import { useState, useEffect } from 'react';
import { getResources, createResource, updateResource, deleteResource } from '../api/api';

const ResourceManager = () => {
  const [resources, setResources] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    quantity: '',
    supplierInfo: ''
  });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadResources = async () => {
      try {
        setLoading(true);
        const data = await getResources();
        setResources(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Failed to load resources');
      } finally {
        setLoading(false);
      }
    };
    loadResources();
  }, []);

  const validateForm = () => {
    if (!formData.name.trim()) return 'Name is required';
    if (!formData.type.trim()) return 'Type is required';
    if (formData.quantity <= 0) return 'Quantity must be positive';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) return setError(validationError);

    try {
      setLoading(true);
      setError('');

      if (editId) {
        const updated = await updateResource(editId, formData);
        setResources(resources.map(r => r.id === editId ? updated : r));
      } else {
        const newResource = await createResource(formData);
        setResources([...resources, newResource]);
      }

      setFormData({ name: '', type: '', quantity: '', supplierInfo: '' });
      setEditId(null);
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (resource) => {
    setFormData({
      name: resource.name,
      type: resource.type,
      quantity: resource.quantity,
      supplierInfo: resource.supplierInfo
    });
    setEditId(resource.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await deleteResource(id);
        setResources(resources.filter(r => r.id !== id));
      } catch (err) {
        setError('Failed to delete resource');
      }
    }
  };

  return (
    <div className="resource-manager">
      <h2>Manage Resources</h2>

      <form onSubmit={handleSubmit} className="resource-form">
        {error && <div className="error">{error}</div>}

        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Type:</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value})}
            required
          >
            <option value="">Select Type</option>
            <option value="Material">Material</option>
            <option value="Equipment">Equipment</option>
            <option value="Human">Human</option>
          </select>
        </div>

        <div className="form-group">
          <label>Quantity:</label>
          <input
            type="number"
            min="1"
            value={formData.quantity}
            onChange={(e) => setFormData({...formData, quantity: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Supplier Info:</label>
          <textarea
            value={formData.supplierInfo}
            onChange={(e) => setFormData({...formData, supplierInfo: e.target.value})}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : editId ? 'Update Resource' : 'Create Resource'}
        </button>
      </form>

      <div className="resource-list">
        {resources.map(resource => (
          <div key={resource.id} className="resource-card">
            <h3>{resource.name}</h3>
            <p>Type: {resource.type}</p>
            <p>Quantity: {resource.quantity}</p>
            <p>Supplier: {resource.supplierInfo || 'N/A'}</p>
            
            <div className="actions">
              <button onClick={() => handleEdit(resource)}>Edit</button>
              <button onClick={() => handleDelete(resource.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourceManager;

