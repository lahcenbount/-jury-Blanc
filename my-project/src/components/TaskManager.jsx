import React, { useState, useEffect } from 'react';
import { taskService, projectService, resourceService } from '../services/api';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [resources, setResources] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const projectsResponse = await projectService.getAll();
        const resourcesResponse = await resourceService.getAll();

        setProjects(projectsResponse.data);
        setResources(resourcesResponse.data);

        // Automatically select the first project if available
        if (projectsResponse.data.length > 0) {
          setSelectedProject(projectsResponse.data[0]._id);
        }
      } catch (err) {
        setError("Erreur lors du chargement des données: " + err.message);
      }
    };

    fetchInitialData();
  }, []);

  // Load tasks for the selected project
  useEffect(() => {
    const fetchProjectTasks = async () => {
      if (selectedProject) {
        try {
          const tasksResponse = await taskService.getByProject(selectedProject);
          setTasks(tasksResponse.data);
        } catch (err) {
          setError("Erreur lors du chargement des tâches du projet: " + err.message);
        }
      }
    };

    fetchProjectTasks();
  }, [selectedProject]);

  const handleSubmit = async (values, { resetForm }) => {
    try {
      const taskData = { ...values, project: selectedProject };

      if (values.id) {
        // If editing, update the task
        await taskService.update(values.id, taskData);
      } else {
        // If creating, create a new task
        await taskService.create(taskData);
      }

      // Reload tasks for the project
      const tasksResponse = await taskService.getByProject(selectedProject);
      setTasks(tasksResponse.data);
      resetForm();
    } catch (err) {
      setError("Erreur lors de l'enregistrement de la tâche: " + err.message);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await taskService.delete(taskId);

      // Reload tasks for the project
      const tasksResponse = await taskService.getByProject(selectedProject);
      setTasks(tasksResponse.data);
    } catch (err) {
      setError("Erreur lors de la suppression de la tâche: " + err.message);
    }
  };

  const handleEdit = (task) => {
    setSelectedProject(task.project);
  };

  const handleProjectChange = (projectId) => {
    setSelectedProject(projectId);
  };

  // Validation schema with Yup
  const validationSchema = Yup.object({
    description: Yup.string().required('La description est requise'),
    startDate: Yup.date().required('La date de début est requise').nullable(),
    endDate: Yup.date()
      .required('La date de fin est requise')
      .min(Yup.ref('startDate'), 'La date de fin doit être après la date de début')
      .nullable(),
    status: Yup.string().required('Le statut est requis'),
    resources: Yup.array().min(1, 'Veuillez sélectionner au moins une ressource'),
  });

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Gestion des Tâches</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Project Selector */}
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Sélectionner un Projet</label>
        <select
          value={selectedProject || ''}
          onChange={(e) => handleProjectChange(e.target.value)}
          className="w-full p-2 border rounded"
        >
          {projects.map((project) => (
            <option key={project._id} value={project._id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      {/* Task Form with Formik */}
      <Formik
        initialValues={{
          description: '',
          startDate: '',
          endDate: '',
          status: 'À faire',
          resources: [],
          project: selectedProject,
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue }) => (
          <Form className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-xl font-semibold mb-4">
              {!values.id ? 'Nouvelle Tâche' : 'Modifier la Tâche'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">Description</label>
                <Field
                  as="textarea"
                  name="description"
                  className="w-full p-2 border rounded"
                />
                <ErrorMessage name="description" component="div" className="text-red-500" />
              </div>

              <div>
                <label className="block mb-2">Statut</label>
                <Field as="select" name="status" className="w-full p-2 border rounded">
                  <option value="À faire">À faire</option>
                  <option value="En cours">En cours</option>
                  <option value="Terminé">Terminé</option>
                </Field>
                <ErrorMessage name="status" component="div" className="text-red-500" />
              </div>

              <div>
                <label className="block mb-2">Date de Début</label>
                <Field
                  type="date"
                  name="startDate"
                  className="w-full p-2 border rounded"
                />
                <ErrorMessage name="startDate" component="div" className="text-red-500" />
              </div>

              <div>
                <label className="block mb-2">Date de Fin</label>
                <Field
                  type="date"
                  name="endDate"
                  className="w-full p-2 border rounded"
                />
                <ErrorMessage name="endDate" component="div" className="text-red-500" />
              </div>

              <div>
                <label className="block mb-2">Ressources</label>
                <Field
                  as="select"
                  name="resources"
                  multiple
                  className="w-full p-2 border rounded"
                  onChange={(e) => {
                    const selectedResources = Array.from(e.target.selectedOptions, option => option.value);
                    setFieldValue("resources", selectedResources);
                  }}
                >
                  {resources.map((resource) => (
                    <option key={resource._id} value={resource._id}>
                      {resource.name}
                    </option>
                  ))}
                </Field>
                <ErrorMessage name="resources" component="div" className="text-red-500" />
              </div>
            </div>

            <div className="mt-4 flex space-x-2">
              <button
                type="submit"
                className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {values.id ? 'Mettre à Jour' : 'Créer'}
              </button>
              {values.id && (
                <button
                  type="button"
                  onClick={() => setFieldValue('id', null)}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Annuler
                </button>
              )}
            </div>
          </Form>
        )}
      </Formik>

      {/* Task List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((task) => (
          <div key={task._id} className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="font-bold text-lg mb-2">{task.description}</h3>
            <div className="text-sm space-y-1">
              <p>📅 Début: {new Date(task.startDate).toLocaleDateString()}</p>
              <p>📅 Fin: {new Date(task.endDate).toLocaleDateString()}</p>
              <p>🏷️ Statut: {task.status}</p>
              <p>👥 Ressources: {task.resources?.length || 0} sélectionnées</p>
            </div>
            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => handleEdit(task)}
                className="text-blue-500 hover:text-blue-700"
              >
                ✏️ Modifier
              </button>
              <button
                onClick={() => handleDelete(task._id)}
                className="text-red-500 hover:text-red-700"
              >
                🗑️ Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskManager;
