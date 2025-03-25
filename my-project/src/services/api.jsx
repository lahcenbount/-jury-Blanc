// src/services/api.js
import axios from 'axios';

// Création d'une instance axios avec l'URL de base
const API = axios.create({
  baseURL: 'http://localhost:5001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Services pour les projets
export const projectService = {
  getAll: () => API.get('/project'),
  create: (projectData) => API.post('/project', projectData),
  update: (id, projectData) => API.put(`/project/${id}`, projectData),
  delete: (id) => API.delete(`/project/${id}`),
};

// Services pour les ressources
export const resourceService = {
  getAll: () => API.get('/resource'),
  create: (resourceData) => API.post('/resource', resourceData),
  update: (id, resourceData) => API.put(`/resource/${id}`, resourceData),
  delete: (id) => API.delete(`/resource/${id}`),
};

// Services pour les tâches
export const taskService = {
  getAll: () => API.get('/Task'),  // Nouvelle méthode getAll()
  getByProject: (projectId) => API.get(`/Task/project/${projectId}`),
  create: (taskData) => API.post('/Task', taskData),
  update: (id, taskData) => API.put(`/Task/${id}`, taskData),
  delete: (id) => API.delete(`/Task/${id}`),
};

export default API;