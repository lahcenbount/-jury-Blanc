import React, { useEffect, useState, useCallback } from 'react';
import { resourceService, taskService } from '../services/api';

const ResourceComponent = ({ onResourceUpdate }) => {
  const [resources, setResources] = useState([]);
  const [newResource, setNewResource] = useState({ name: '', type: '', quantity: 0, supplier: { name: '', contact: '' } });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Champs pour le formulaire de ressource
  const resourceFields = [
    { name: 'name', placeholder: 'Nom', required: true },
    { name: 'type', placeholder: 'Type', required: true },
    { name: 'quantity', placeholder: 'Quantité', type: 'number', required: true },
    { name: 'supplier.name', placeholder: 'Nom du fournisseur' },
    { name: 'supplier.contact', placeholder: 'Contact du fournisseur' }
  ];

  const loadResources = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await resourceService.getAll();
      setResources(response.data);
      if (onResourceUpdate) {
        onResourceUpdate(response.data);
      }
    } catch (err) {
      setError("Erreur lors du chargement des ressources: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [onResourceUpdate]);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const handleResourceSubmit = async (e) => {
    e.preventDefault();
    
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
        const updatedResources = [...resources, response.data];
        setResources(updatedResources);
        
        // Notifier le parent que les ressources ont été mises à jour
        if (onResourceUpdate) {
          onResourceUpdate(updatedResources);
        }
      }
      setNewResource({ name: '', type: '', quantity: 0, supplier: { name: '', contact: '' } });
      setEditingId(null);
    } catch (err) {
      setError("Erreur lors de l'enregistrement de la ressource: " + err.message);
      console.error(err);
    }
  };

  const handleDeleteResource = async (id) => {
    try {
      // Vérifier si cette ressource est utilisée par une tâche
      const tasksResponse = await taskService.getAll();
      const isResourceUsed = tasksResponse.data.some(task => task.resources?.includes(id));
      
      if (isResourceUsed) {
        setError("Cette ressource est associée à une ou plusieurs tâches. Veuillez d'abord supprimer ces associations.");
        return;
      }
      
      await resourceService.delete(id);
      const updatedResources = resources.filter(r => r._id !== id);
      setResources(updatedResources);
      
      // Notifier le parent que les ressources ont été mises à jour
      if (onResourceUpdate) {
        onResourceUpdate(updatedResources);
      }
    } catch (err) {
      setError("Erreur lors de la suppression de la ressource: " + err.message);
      console.error(err);
    }
  };

  if (loading) return <div className="text-center p-4">Chargement des ressources...</div>;

  return (
    <div>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      
      {/* Formulaire de ressource */}
      <form onSubmit={handleResourceSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">{editingId ? 'Modifier' : 'Nouvelle'} Ressource</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resourceFields.map((field) => (
            <div key={field.name} className="flex flex-col">
              <label className="mb-1 text-sm font-medium">{field.placeholder}</label>
              <input
                type={field.type || 'text'}
                value={field.name.includes('.') 
                  ? newResource[field.name.split('.')[0]][field.name.split('.')[1]] || '' 
                  : newResource[field.name] || ''}
                onChange={(e) => {
                  if (field.name.includes('.')) {
                    const [parent, child] = field.name.split('.');
                    setNewResource({
                      ...newResource,
                      [parent]: {
                        ...newResource[parent],
                        [child]: e.target.value
                      }
                    });
                  } else {
                    setNewResource({ ...newResource, [field.name]: e.target.value });
                  }
                }}
                className="p-2 border rounded"
                required={field.required}
                min={field.name === 'quantity' ? 1 : undefined}
              />
            </div>
          ))}
        </div>
        
        <button type="submit" className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          {editingId ? `Mettre à jour Ressource` : `Créer Ressource`}
        </button>
      </form>
      
      {/* Liste des ressources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map(resource => (
          <div key={resource._id} className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="font-semibold text-lg mb-2">{resource.name}</h3>
            <div className="text-sm space-y-1">
              <p>🏷️ Type: {resource.type}</p>
              <p>🔢 Quantité: {resource.quantity}</p>
              {resource.supplier && resource.supplier.name && (
                <>
                  <p>🏢 Fournisseur: {resource.supplier.name}</p>
                  {resource.supplier.contact && <p>📞 Contact: {resource.supplier.contact}</p>}
                </>
              )}
            </div>
            
            <div className="mt-4 flex gap-2">
              <button onClick={() => {
                setNewResource({
                  ...resource,
                  quantity: resource.quantity,
                  supplier: { 
                    name: resource.supplier?.name || '', 
                    contact: resource.supplier?.contact || '' 
                  }
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
  );
};

export default ResourceComponent;