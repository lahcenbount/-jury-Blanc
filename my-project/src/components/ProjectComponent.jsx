import React, { useEffect, useState, useCallback } from 'react';
import { projectService, taskService } from '../services/api';

const ProjectComponent = ({ onProjectUpdate }) => {
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({ name: '', description: '', startDate: '', endDate: '', budget: 0 });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Champs pour le formulaire de projet
  const projectFields = [
    { name: 'name', placeholder: 'Nom du projet', required: true },
    { name: 'description', placeholder: 'Description', required: true },
    { name: 'startDate', placeholder: 'Date de début', type: 'date', required: true },
    { name: 'endDate', placeholder: 'Date de fin', type: 'date', required: true },
    { name: 'budget', placeholder: 'Budget', type: 'number', required: true }
  ];

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await projectService.getAll();
      setProjects(response.data);
      if (onProjectUpdate) {
        onProjectUpdate(response.data);
      }
    } catch (err) {
      setError("Erreur lors du chargement des projets: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [onProjectUpdate]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    
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
        const newProjectData = response.data.project || response.data;
        setProjects([...projects, newProjectData]);
      }
      
      setNewProject({ name: '', description: '', startDate: '', endDate: '', budget: 0 });
      setEditingId(null);
      
      // Notifier le parent que les projets ont été mis à jour
      if (onProjectUpdate) {
        onProjectUpdate([...projects]);
      }
    } catch (err) {
      setError("Erreur lors de l'enregistrement du projet: " + err.message);
      console.error(err);
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      // Vérifier si des tâches utilisent ce projet
      const tasksResponse = await taskService.getByProject(id);
      if (tasksResponse.data.length > 0) {
        setError(`Impossible de supprimer ce projet: ${tasksResponse.data.length} tâche(s) y sont associées.`);
        return;
      }
      
      await projectService.delete(id);
      const updatedProjects = projects.filter(p => p._id !== id);
      setProjects(updatedProjects);
      
      // Notifier le parent que les projets ont été mis à jour
      if (onProjectUpdate) {
        onProjectUpdate(updatedProjects);
      }
    } catch (err) {
      setError("Erreur lors de la suppression du projet: " + err.message);
      console.error(err);
    }
  };

  if (loading) return <div className="text-center p-4">Chargement des projets...</div>;

  return (
    <div>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      
      <form onSubmit={handleProjectSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">{editingId ? 'Modifier' : 'Nouveau'} Projet</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projectFields.map((field) => (
            <div key={field.name} className="flex flex-col">
              <label className="mb-1 text-sm font-medium">{field.placeholder}</label>
              <input
                type={field.type || 'text'}
                value={newProject[field.name] || ''}
                onChange={(e) => setNewProject({ ...newProject, [field.name]: e.target.value })}
                className="p-2 border rounded"
                required={field.required}
                min={field.name === 'budget' ? 1 : undefined}
              />
            </div>
          ))}
        </div>
        
        <button type="submit" className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          {editingId ? `Mettre à jour Projet` : `Créer Projet`}
        </button>
      </form>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map(project => (
          <div key={project._id} className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="font-semibold text-lg mb-2">{project.name}</h3>
            <p className="text-gray-600 mb-2">{project.description}</p>
            <div className="text-sm space-y-1">
              <p>📅 Début: {new Date(project.startDate).toLocaleDateString()}</p>
              <p>📅 Fin: {new Date(project.endDate).toLocaleDateString()}</p>
              <p>💰 Budget: {project.budget}€</p>
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
  );
};

export default ProjectComponent;