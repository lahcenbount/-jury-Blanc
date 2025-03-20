import { useState, useEffect } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from '../api/api';

const TaskManager = ({ projectId }) => {
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({
    description: '',
    startDate: '',
    endDate: '',
    resources: [],
  });
  const [newResource, setNewResource] = useState('');
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  // Charger les tâches au montage
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await getTasks(projectId);
        setTasks(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Failed to load tasks',err);
      }
    };
    if (projectId) loadTasks();
  }, [projectId]);

  // Validation des dates
  const validateDates = (start, end) => {
    if (!start || !end) return 'Dates are required';
    if (new Date(start) > new Date(end)) return 'End date must be after start date';
    return '';
  };

  // Soumettre le formulaire de création ou de mise à jour
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.description) return setError('Description is required');
    const dateError = validateDates(formData.startDate, formData.endDate);
    if (dateError) return setError(dateError);

    try {
      if (editId) {
        const updatedTask = await updateTask(projectId, editId, formData);
        setTasks(tasks.map(t => t.id === editId ? updatedTask : t));
        setEditId(null);
      } else {
        const newTask = await createTask(projectId, formData);
        setTasks([...tasks, newTask]);
      }
      setFormData({ description: '', startDate: '', endDate: '', resources: [] });
      setNewResource('');
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  // Ajouter une ressource
  const handleAddResource = () => {
    if (newResource.trim()) {
      setFormData({
        ...formData,
        resources: [...formData.resources, newResource.trim()],
      });
      setNewResource('');
    }
  };

  // Supprimer une ressource
  const handleRemoveResource = (index) => {
    setFormData({
      ...formData,
      resources: formData.resources.filter((_, i) => i !== index),
    });
  };

  // Charger les données d'une tâche pour édition
  const handleEdit = (task) => {
    setFormData({
      description: task.description,
      startDate: task.startDate.split('T')[0],
      endDate: task.endDate.split('T')[0],
      resources: task.resources,
    });
    setEditId(task.id);
  };

  return (
    <div className="task-manager">
      <h2>Manage Tasks for Project {projectId}</h2>

      {/* Formulaire de tâche */}
      <form onSubmit={handleSubmit} className="task-form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label>Task Description:</label>
          <textarea
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Start Date:</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={e => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>End Date:</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={e => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Resources:</label>
          <div className="resource-input">
            <input
              type="text"
              value={newResource}
              onChange={e => setNewResource(e.target.value)}
              placeholder="Add resource"
            />
            <button type="button" onClick={handleAddResource} className="add-btn">
              Add
            </button>
          </div>
          <div className="resource-list">
            {formData.resources.map((resource, index) => (
              <div key={index} className="resource-item">
                {resource}
                <button
                  type="button"
                  onClick={() => handleRemoveResource(index)}
                  className="remove-btn"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="submit-btn">
          {editId ? 'Update Task' : 'Create Task'}
        </button>
      </form>

      {/* Liste des tâches */}
      <div className="task-list">
        {tasks.map(task => (
          <div key={task.id} className="task-card">
            <h3>{task.description}</h3>
            <div className="task-dates">
              <span>{new Date(task.startDate).toLocaleDateString()}</span> - 
              <span>{new Date(task.endDate).toLocaleDateString()}</span>
            </div>
            {task.resources.length > 0 && (
              <div className="task-resources">
                <strong>Resources:</strong>
                <ul>
                  {task.resources.map((resource, index) => (
                    <li key={index}>{resource}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="task-actions">
              <button onClick={() => handleEdit(task)} className="edit-btn">
                Edit
              </button>
              <button
                onClick={() =>
                  deleteTask(projectId, task.id).then(() =>
                    setTasks(tasks.filter(t => t.id !== task.id))
                  )
                }
                className="delete-btn"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskManager;


