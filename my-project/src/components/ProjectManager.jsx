import React, { useEffect, useState } from 'react';
import { projectService, taskService, resourceService } from '../services/api';

// Composant de formulaire réutilisable pour Projets, Tâches et Ressources
const EntityForm = ({ entity, newEntity, setNewEntity, handleSubmit, editingId, fields }) => (
  <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
    <h2 className="text-xl font-semibold mb-4">{editingId ? 'Modifier' : 'Nouveau'} {entity}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {fields.map((field) => {
        if (field.type === 'select' && field.name === 'project') {
          return (
            <select
              key={field.name}
              value={newEntity[field.name]}
              onChange={(e) => setNewEntity({ ...newEntity, [field.name]: e.target.value })}
              className="p-2 border rounded"
              required={field.required}
            >
              <option value="">Sélectionner un projet</option>
              {field.options?.map(option => (
                <option key={option._id} value={option._id}>
                  {option.name}
                </option>
              ))}
            </select>
          );
        }
        return (
          <input
            key={field.name}
            type={field.type || 'text'}
            placeholder={field.placeholder}
            value={newEntity[field.name] || ''}
            onChange={(e) => setNewEntity({ ...newEntity, [field.name]: e.target.value })}
            className="p-2 border rounded"
            required={field.required}
            min={field.name === 'budget' || field.name === 'quantity' ? 1 : undefined} // Validation min pour budget et quantité
          />
        );
      })}
    </div>
    <button type="submit" className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
      {editingId ? `Mettre à jour ${entity}` : `Créer ${entity}`}
    </button>
  </form>
);

const ProjectManager = ({ activeTab }) => {
  // États pour les entités et formulaires
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [resources, setResources] = useState([]);
  
  const [newProject, setNewProject] = useState({ name: '', description: '', startDate: '', endDate: '', budget: 0 });
  const [newTask, setNewTask] = useState({ description: '', startDate: '', endDate: '', project: '', status: 'À faire' });
  const [newResource, setNewResource] = useState({ name: '', type: '', quantity: 0, supplier: { name: '', contact: '' } });
  
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Chargement des données
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (activeTab === 'projects') {
          const response = await projectService.getAll();
          setProjects(response.data);
        } else if (activeTab === 'tasks') {
          // Pour les tâches, nous devons d'abord charger les projets pour le dropdown
          const projectsResponse = await projectService.getAll();
          setProjects(projectsResponse.data);
          
          // Si nous avons un projet sélectionné, charger ses tâches
          if (newTask.project) {
            const tasksResponse = await taskService.getByProject(newTask.project);
            setTasks(tasksResponse.data);
          }
        } else if (activeTab === 'resources') {
          const response = await resourceService.getAll();
          setResources(response.data);
        }
      } catch (err) {
        setError("Erreur lors du chargement des données: " + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, newTask.project]);

  // Champs pour chaque formulaire
  const projectFields = [
    { name: 'name', placeholder: 'Nom du projet', required: true },
    { name: 'description', placeholder: 'Description', required: true },
    { name: 'startDate', placeholder: 'Date de début', type: 'date', required: true },
    { name: 'endDate', placeholder: 'Date de fin', type: 'date', required: true },
    { name: 'budget', placeholder: 'Budget', type: 'number', required: true }
  ];

  const taskFields = [
    { 
      name: 'project', 
      placeholder: 'Sélectionner un projet', 
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
    ]}
  ];

  const resourceFields = [
    { name: 'name', placeholder: 'Nom', required: true },
    { name: 'type', placeholder: 'Type', required: true },
    { name: 'quantity', placeholder: 'Quantité', type: 'number', required: true },
    { name: 'supplier.name', placeholder: 'Nom du fournisseur' },
    { name: 'supplier.contact', placeholder: 'Contact du fournisseur' }
  ];

  // Gérer les soumissions de formulaire
  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    
    // Validation du budget
    if (newProject.budget <= 0) {
      setError('Le budget doit être un nombre positif');
      return;
    }

    try {
      if (editingId) {
        const response = await projectService.update(editingId, newProject);
        setProjects(projects.map(p => p._id === editingId ? response.data : p));
      } else {
        const response = await projectService.create(newProject);
        setProjects([...projects, response.data.project]);
      }
      setNewProject({ name: '', description: '', startDate: '', endDate: '', budget: 0 });
      setEditingId(null);
    } catch (err) {
      setError("Erreur lors de l'enregistrement du projet: " + err.message);
      console.error(err);
    }
  };

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
      setNewTask({ description: '', startDate: '', endDate: '', project: newTask.project, status: 'À faire' });
      setEditingId(null);
    } catch (err) {
      setError("Erreur lors de l'enregistrement de la tâche: " + err.message);
      console.error(err);
    }
  };

  const handleResourceSubmit = async (e) => {
    e.preventDefault();
    
    // Validation de la quantité
    if (newResource.quantity <= 0) {
      setError('La quantité doit être un nombre positif');
      return;
    }

    try {
      if (editingId) {
        const response = await resourceService.update(editingId, newResource);
        setResources(resources.map(r => r._id === editingId ? response.data : r));
      } else {
        const response = await resourceService.create(newResource);
        setResources([...resources, response.data]);
      }
      setNewResource({ name: '', type: '', quantity: 0, supplier: { name: '', contact: '' } });
      setEditingId(null);
    } catch (err) {
      setError("Erreur lors de l'enregistrement de la ressource: " + err.message);
      console.error(err);
    }
  };

  // Gérer la suppression
  const handleDeleteProject = async (id) => {
    try {
      await projectService.delete(id);
      setProjects(projects.filter(p => p._id !== id));
    } catch (err) {
      setError("Erreur lors de la suppression du projet: " + err.message);
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

  const handleDeleteResource = async (id) => {
    try {
      await resourceService.delete(id);
      setResources(resources.filter(r => r._id !== id));
    } catch (err) {
      setError("Erreur lors de la suppression de la ressource: " + err.message);
      console.error(err);
    }
  };

  if (loading) return <div className="text-center p-4">Chargement...</div>;

  return (
    <div>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      
      {/* Projets */}
      {activeTab === 'projects' && (
        <div>
          <EntityForm
            entity="Projet"
            newEntity={newProject}
            setNewEntity={setNewProject}
            handleSubmit={handleProjectSubmit}
            editingId={editingId}
            fields={projectFields}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(project => (
              <div key={project._id} className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="font-semibold text-lg mb-2">{project.name}</h3>
                <p className="text-gray-600 mb-2">{project.description}</p>
                <div className="text-sm space-y-1">
                  <p>📅 Début: {new Date(project.startDate).toLocaleDateString()}</p>
                  <p>📅 Fin: {new Date(project.endDate).toLocaleDateString()}</p>
                  <p> Budget: {project.budget}€</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => {
                    setNewProject({
                      ...project,
                      startDate: new Date(project.startDate).toISOString().split('T')[0],
                      endDate: new Date(project.endDate).toISOString().split('T')[0]
                    });
                    setEditingId(project._id);
                  }} className="text-blue-500 hover:text-blue-700">
                    ✏️ Modifier
                  </button>
                  <button onClick={() => handleDeleteProject(project._id)} 
                    className="text-red-500 hover:text-red-700">
                    🗑️ Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tâches */}
      {activeTab === 'tasks' && (
        <div>
          <EntityForm
            entity="Tâche"
            newEntity={newTask}
            setNewEntity={setNewTask}
            handleSubmit={handleTaskSubmit}
            editingId={editingId}
            fields={taskFields}
          />
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
                    <p> Statut: {task.status}</p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => {
                      setNewTask({
                        ...task,
                        startDate: new Date(task.startDate).toISOString().split('T')[0],
                        endDate: task.endDate ? new Date(task.endDate).toISOString().split('T')[0] : '',
                        project: task.project
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
      )}

      {/* Ressources */}
      {activeTab === 'resources' && (
        <div>
          <EntityForm
            entity="Ressource"
            newEntity={newResource}
            setNewEntity={setNewResource}
            handleSubmit={handleResourceSubmit}
            editingId={editingId}
            fields={resourceFields}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map(resource => (
              <div key={resource._id} className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="font-semibold text-lg mb-2">{resource.name}</h3>
                <div className="text-sm space-y-1">
                  <p>Type: {resource.type}</p>
                  <p>🔢 Quantité: {resource.quantity}</p>
                  {resource.supplier && (
                    <>
                      <p>Fournisseur: {resource.supplier.name}</p>
                      <p>Contact: {resource.supplier.contact}</p>
                    </>
                  )}
                </div>
                
                <div className="mt-4 flex gap-2">
                  <button onClick={() => {
                    setNewResource({
                      ...resource,
                      quantity: resource.quantity,
                      supplier: { name: resource.supplier?.name, contact: resource.supplier?.contact }
                    });
                    setEditingId(resource._id);
                  }} className="text-blue-500 hover:text-blue-700">
                    ✏️ Modifier
                  </button>
                  <button onClick={() => handleDeleteResource(resource._id)} 
                    className="text-red-500 hover:text-red-700">
                    🗑️ Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManager;
