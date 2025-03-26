import React, { useState, useEffect } from 'react';
import { projectService, taskService } from '../services/api';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const ProjectManager = () => {
  const [projects, setProjects] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectService.getAll();
      setProjects(response.data);
    } catch (err) {
      setError("Erreur lors du chargement des projets: " + err.message);
    }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setError(null);
    try {
      if (editingProject) {
        await projectService.update(editingProject._id, values);
      } else {
        await projectService.create(values);
      }
      fetchProjects();
      resetForm();
    } catch (err) {
      setError("Erreur lors de l'enregistrement du projet: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      // Vérifier si le projet a des tâches associées
      const tasksResponse = await taskService.getByProject(id);
      if (tasksResponse.data.length > 0) {
        setError("Impossible de supprimer un projet avec des tâches associées");
        return;
      }

      await projectService.delete(id);
      fetchProjects();
    } catch (err) {
      setError("Erreur lors de la suppression du projet: " + err.message);
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
  };

  const resetForm = () => {
    setEditingProject(null);
  };

  const projectValidationSchema = Yup.object({
    name: Yup.string().required('Le nom du projet est requis'),
    description: Yup.string().required('La description est requise'),
    startDate: Yup.date().required('La date de début est requise').nullable(),
    endDate: Yup.date()
      .required('La date de fin est requise')
      .min(Yup.ref('startDate'), "La date de fin ne peut pas être antérieure à la date de début")
      .nullable(),
    budget: Yup.number()
      .positive('Le budget doit être un nombre positif')
      .required('Le budget est requis'),
  });

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Gestion des Projets</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <Formik
        initialValues={{
          name: editingProject ? editingProject.name : '',
          description: editingProject ? editingProject.description : '',
          startDate: editingProject ? new Date(editingProject.startDate).toISOString().split('T')[0] : '',
          endDate: editingProject ? new Date(editingProject.endDate).toISOString().split('T')[0] : '',
          budget: editingProject ? editingProject.budget : 0,
        }}
        validationSchema={projectValidationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting }) => (
          <Form className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-xl font-semibold mb-4">
              {editingProject ? 'Modifier le Projet' : 'Nouveau Projet'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">Nom du Projet</label>
                <Field
                  type="text"
                  name="name"
                  className="w-full p-2 border rounded"
                />
                <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
              </div>

              <div>
                <label className="block mb-2">Description</label>
                <Field
                  as="textarea"
                  name="description"
                  className="w-full p-2 border rounded"
                />
                <ErrorMessage name="description" component="div" className="text-red-500 text-sm" />
              </div>

              <div>
                <label className="block mb-2">Date de Début</label>
                <Field
                  type="date"
                  name="startDate"
                  className="w-full p-2 border rounded"
                />
                <ErrorMessage name="startDate" component="div" className="text-red-500 text-sm" />
              </div>

              <div>
                <label className="block mb-2">Date de Fin</label>
                <Field
                  type="date"
                  name="endDate"
                  className="w-full p-2 border rounded"
                />
                <ErrorMessage name="endDate" component="div" className="text-red-500 text-sm" />
              </div>

              <div>
                <label className="block mb-2">Budget</label>
                <Field
                  type="number"
                  name="budget"
                  className="w-full p-2 border rounded"
                  min="0"
                />
                <ErrorMessage name="budget" component="div" className="text-red-500 text-sm" />
              </div>
            </div>

            <div className="mt-4 flex space-x-2">
              <button 
                type="submit" 
                className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {editingProject ? 'Mettre à Jour' : 'Créer'}
              </button>
              {editingProject && (
                <button 
                  type="button" 
                  onClick={resetForm} 
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Annuler
                </button>
              )}
            </div>
          </Form>
        )}
      </Formik>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <div key={project._id} className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="font-bold text-lg mb-2">{project.name}</h3>
            <p className="text-gray-600 mb-2">{project.description}</p>
            <div className="text-sm space-y-1">
              <p>📅 Début: {new Date(project.startDate).toLocaleDateString()}</p>
              <p>📅 Fin: {new Date(project.endDate).toLocaleDateString()}</p>
              <p>💰 Budget: {project.budget}€</p>
            </div>
            <div className="mt-4 flex space-x-2">
              <button 
                onClick={() => handleEdit(project)}
                className="text-blue-500 hover:text-blue-700"
              >
                ✏️ Modifier
              </button>
              <button 
                onClick={() => handleDelete(project._id)}
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

export default ProjectManager;
