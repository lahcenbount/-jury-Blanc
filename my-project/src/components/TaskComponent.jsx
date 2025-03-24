import React, { useEffect, useState, useCallback } from 'react';
import { taskService } from '../services/api';

const TaskComponent = ({ projects = [], resources = [] }) => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ 
    description: '', 
    startDate: '', 
    endDate: '', 
    project: '', 
    status: 'À faire',
    resources: []
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('');

  // Champs pour le formulaire de tâche
  const taskFields = [
    { 
      name: 'project', 
      placeholder: 'Projet', 
      type: 'select', 
      required: true,
      options: projects 
    },
    { name: 'description', placeholder: 'Description', required: true },
    { name: 'startDate', placeholder: 'Date de début', type: 'date', required: true },
    { name: 'endDate', placeholder: 'Date de fin', type: 'date' },
    { name: 'status', placeholder: 'Statut', type: 'select', options: [
      { _id: 'À faire', name: 'À faire' },
      { _id: 'En cours', name: 'En cours' },
      { _id: 'Terminé', name: 'Terminé' }
    ]},
    {
      name: 'resources',
      placeholder: 'Ressources nécessaires',
      type: 'multiselect',
      options: resources
    }
  ];

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (selectedProjectFilter) {
        response = await taskService.getByProject(selectedProjectFilter);
      } else {
        response = await taskService.getAll();
      }
      setTasks(response.data);
    } catch (err) {
      setError("Erreur lors du chargement des tâches: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedProjectFilter]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const response = await taskService.update(editingId, newTask);
        setTasks(tasks.map(t => t._id === editingId ? response.data : t));
      } else {
        const response = await taskService.create(newTask);
        setTasks([...tasks, response.data]);
      }
      setNewTask({ 
        description: '', 
        startDate: '', 
        endDate: '', 
        project: newTask.project, 
        status: 'À faire',
        resources: []
      });
      setEditingId(null);
    } catch (err) {
      setError("Erreur lors de l'enregistrement de la tâche: " + err.message);
      console.error(err);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await taskService.delete(id);
      setTasks(tasks.filter(t => t._id !== id));
    } catch (err) {
      setError("Erreur lors de la suppression de la tâche: " + err.message);
      console.error(err);
    }
  };

  // Fonction pour obtenir les noms des ressources associées à une tâche
  const getResourceNames = (resourceIds) => {
    if (!resourceIds || resourceIds.length === 0) return "Aucune";
    
    return resourceIds.map(id => {
      const resource = resources.find(r => r._id === id);
      return resource ? resource.name : "Inconnu";
    }).join(", ");
  };

  if (loading) return <div className="text-center p-4">Chargement des tâches...</div>;

  return (
    <div>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      
      {/* Filtres */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Filtrer les tâches</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
            <label className="block text-sm mb-1">Par projet</label>
            <select 
              value={selectedProjectFilter} 
              onChange={(e) => setSelectedProjectFilter(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Tous les projets</option>
              {projects.map(project => (
                <option key={project._id} value={project._id}>{project.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Formulaire de tâche */}
      <form onSubmit={handleTaskSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">{editingId ? 'Modifier' : 'Nouvelle'} Tâche</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {taskFields.map((field) => {
            if (field.type === 'select' && (field.name === 'project' || field.name === 'status')) {
              return (
                <div key={field.name} className="flex flex-col">
                  <label className="mb-1 text-sm font-medium">{field.placeholder}</label>
                  <select
                    value={newTask[field.name] || ''}
                    onChange={(e) => setNewTask({ ...newTask, [field.name]: e.target.value })}
                    className="p-2 border rounded"
                    required={field.required}
                  >
                    <option value="">{`Sélectionner ${field.name === 'project' ? 'un projet' : 'un statut'}`}</option>
                    {field.options?.map(option => (
                      <option key={option._id} value={option._id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }
            
            if (field.type === 'multiselect') {
              return (
                <div key={field.name} className="flex flex-col col-span-2">
                  <label className="mb-1 text-sm font-medium">{field.placeholder}</label>
                  <div className="p-2 border rounded bg-gray-50 max-h-40 overflow-y-auto">
                    {field.options?.map(option => (
                      <div key={option._id} className="flex items-center mb-1">
                        <input
                          type="checkbox"
                          id={`resource-${option._id}`}
                          checked={newTask[field.name]?.includes(option._id) || false}
                          onChange={(e) => {
                            const selectedResources = [...(newTask[field.name] || [])];
                            if (e.target.checked) {
                              selectedResources.push(option._id);
                            } else {
                              const index = selectedResources.indexOf(option._id);
                              if (index !== -1) selectedResources.splice(index, 1);
                            }
                            setNewTask({ ...newTask, [field.name]: selectedResources });
                          }}
                          className="mr-2"
                        />
                        <label htmlFor={`resource-${option._id}`}>{option.name} ({option.type})</label>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <div key={field.name} className="flex flex-col">
                <label className="mb-1 text-sm font-medium">{field.placeholder}</label>
                <input
                  type={field.type || 'text'}
                  value={newTask[field.name] || ''}
                  onChange={(e) => setNewTask({ ...newTask, [field.name]: e.target.value })}
                  className="p-2 border rounded"
                  required={field.required}
                />
              </div>
            );
          })}
        </div>
        
        <button type="submit" className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          {editingId ? `Mettre à jour Tâche` : `Créer Tâche`}
        </button>
      </form>
      
      {/* Liste des tâches */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.map(task => {
          const project = projects.find(p => p._id === task.project);
          return (
            <div key={task._id} className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="font-semibold mb-2">{project?.name || 'Projet inconnu'}</h3>
              <p className="text-gray-600 mb-2">{task.description}</p>
              <div className="text-sm space-y-1">
                <p>📅 Début: {new Date(task.startDate).toLocaleDateString()}</p>
                {task.endDate && <p>📅 Fin: {new Date(task.endDate).toLocaleDateString()}</p>}
                <p>🔄 Statut: {task.status}</p>
                <p>🔧 Ressources: {getResourceNames(task.resources)}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => {
                  setNewTask({
                    ...task,
                    startDate: new Date(task.startDate).toISOString().split('T')[0],
                    endDate: task.endDate ? new Date(task.endDate).toISOString().split('T')[0] : '',
                    project: task.project,
                    resources: task.resources || []
                  });
                  setEditingId(task._id);
                }} className="text-blue-500 hover:text-blue-700">
                  ✏️ Modifier
                </button>
                <button onClick={() => handleDeleteTask(task._id)} 
                  className="text-red-500 hover:text-red-700">
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskComponent;