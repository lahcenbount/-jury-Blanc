import React, { useEffect, useState, useCallback } from 'react';
import { projectService, taskService } from '../services/api';

const ProjectComponent = ({ onProjectUpdate }) => {
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    budget: 0
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fields = [
    { name: 'name', label: 'Nom du projet', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'text', required: true },
    { name: 'startDate', label: 'Date de début', type: 'date', required: true },
    { name: 'endDate', label: 'Date de fin', type: 'date', required: true },
    { name: 'budget', label: 'Budget', type: 'number', required: true, min: 1 }
  ];

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await projectService.getAll();
      setProjects(data);
      onProjectUpdate?.(data);
    } catch (err) {
      setError(`Erreur de chargement: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [onProjectUpdate]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.budget <= 0) {
      setError('Le budget doit être positif');
      return;
    }

    try {
      const response = editingId
        ? await projectService.update(editingId, formData)
        : await projectService.create(formData);

      const updatedProjects = editingId
        ? projects.map(p => p._id === editingId ? response.data : p)
        : [...projects, response.data];

      setProjects(updatedProjects);
      resetForm();
      onProjectUpdate?.(updatedProjects);
    } catch (err) {
      setError(`Erreur: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { data: tasks } = await taskService.getByProject(id);
      if (tasks.length > 0) {
        throw new Error(`${tasks.length} tâche(s) associée(s)`);
      }
      
      await projectService.delete(id);
      const updatedProjects = projects.filter(p => p._id !== id);
      setProjects(updatedProjects);
      onProjectUpdate?.(updatedProjects);
    } catch (err) {
      setError(`Suppression impossible: ${err.message}`);
    }
  };

  const handleEdit = (project) => {
    setFormData({
      ...project,
      startDate: project.startDate.split('T')[0],
      endDate: project.endDate.split('T')[0]
    });
    setEditingId(project._id);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', startDate: '', endDate: '', budget: 0 });
    setEditingId(null);
  };

  if (loading) return <div className="text-center p-4">Chargement...</div>;

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? 'Modifier' : 'Nouveau'} Projet
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map(field => (
            <div key={field.name} className="space-y-1">
              <label className="block text-sm font-medium">
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </label>
              <input
                type={field.type}
                value={formData[field.name]}
                onChange={(e) => setFormData({
                  ...formData, 
                  [field.name]: field.type === 'number' ? +e.target.value : e.target.value
                })}
                className="w-full p-2 border rounded"
                required={field.required}
                min={field.min}
              />
            </div>
          ))}
        </div>

        <div className="mt-4 flex space-x-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {editingId ? 'Mettre à jour' : 'Créer'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
            >
              Annuler
            </button>
          )}
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map(project => (
          <div key={project._id} className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold text-lg">{project.name}</h3>
            <p className="text-gray-600 my-2">{project.description}</p>
            
            <div className="text-sm space-y-1 text-gray-500">
              <p>📅 {new Date(project.startDate).toLocaleDateString()} → {new Date(project.endDate).toLocaleDateString()}</p>
              <p>💰 {project.budget}€</p>
            </div>

            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => handleEdit(project)}
                className="text-blue-600 hover:text-blue-800"
              >
                Modifier
              </button>
              <button
                onClick={() => handleDelete(project._id)}
                className="text-red-600 hover:text-red-800"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectComponent;