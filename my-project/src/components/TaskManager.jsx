import React, { useState, useEffect } from 'react';
import { taskService, projectService, resourceService } from '../services/api';

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [resources, setResources] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newTask, setNewTask] = useState({
    description: '',
    startDate: '',
    endDate: '',
    project: '',
    status: 'À faire',
    resources: []
  });
  const [editingTask, setEditingTask] = useState(null);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Ensure the project is defined
      const taskData = {
        ...newTask,
        project: selectedProject
      };

      if (editingTask) {
        await taskService.update(editingTask._id, taskData);
      } else {
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
    setEditingTask(task);
    setNewTask({
      description: task.description,
      startDate: new Date(task.startDate).toISOString().split('T')[0],
      endDate: new Date(task.endDate).toISOString().split('T')[0],
      project: task.project,
      status: task.status,
      resources: task.resources || []
    });
  };

  const handleProjectChange = (projectId) => {
    setSelectedProject(projectId);
    resetForm();
  };

  const resetForm = () => {
    setNewTask({
      description: '',
      startDate: '',
      endDate: '',
      project: selectedProject,
      status: 'À faire',
      resources: []
    });
    setEditingTask(null);
  };

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
          {projects.map(project => (
            <option key={project._id} value={project._id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      {/* Task Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-semibold mb-4">
          {editingTask ? 'Modifier la Tâche' : 'Nouvelle Tâche'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">Description</label>
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({...newTask, description: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Statut</label>
            <select
              value={newTask.status}
              onChange={(e) => setNewTask({...newTask, status: e.target.value})}
              className="w-full p-2 border rounded"
            >
              <option value="À faire">À faire</option>
              <option value="En cours">En cours</option>
              <option value="Terminé">Terminé</option>
            </select>
          </div>

          <div>
            <label className="block mb-2">Date de Début</label>
            <input
              type="date"
              value={newTask.startDate}
              onChange={(e) => setNewTask({...newTask, startDate: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Date de Fin</label>
            <input
              type="date"
              value={newTask.endDate}
              onChange={(e) => setNewTask({...newTask, endDate: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Ressources</label>
            <select
              multiple
              value={newTask.resources}
              onChange={(e) => {
                const selectedResources = Array.from(e.target.selectedOptions, option => option.value);
                setNewTask({...newTask, resources: selectedResources});
              }}
              className="w-full p-2 border rounded"
            >
              {resources.map(resource => (
                <option key={resource._id} value={resource._id}>
                  {resource.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex space-x-2">
          <button 
            type="submit" 
            className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {editingTask ? 'Mettre à Jour' : 'Créer'}
          </button>
          {editingTask && (
            <button 
              type="button" 
              onClick={resetForm} 
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
            >
              Annuler
            </button>
          )}
        </div>
      </form>

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