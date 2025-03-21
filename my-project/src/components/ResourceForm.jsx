import React, { useState, useEffect } from "react";

const projectService = {
  getAll: () => Promise.resolve({ 
    data: [
      { id: "1", title: "Project A" },
      { id: "2", title: "Project BAc" },
      { id: "3", title: "BCSS" }
    ] 
  })
};

const ResourceForm = ({ entity, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(entity || {
    name: "",
    role: "",
    email: "",
    phone: "",
    availability: "Disponible",
    skills: "",
    projectId: ""
  });
  
  const [projects, setProjects] = useState([]);
  
  useEffect(() => {
    loadProjects();
  }, []);
  
  const loadProjects = async () => {
    try {
      const response = await projectService.getAll();
      setProjects(response.data);
    } catch (error) {
      console.error("Failed to load projects:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mx-4 my-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {entity ? "Modifier la ressource" : "Ajouter une nouvelle ressource"}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nom complet
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Rôle / Fonction
            </label>
            <input
              type="text"
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-1">
              Disponibilité
            </label>
            <select
              id="availability"
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Disponible">Disponible</option>
              <option value="Partiellement disponible">Partiellement disponible</option>
              <option value="Non disponible">Non disponible</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-1">
              Projet assigné
            </label>
            <select
                           id="projectId"
                           name="projectId"
                           value={formData.projectId}
                           onChange={handleChange}
                           required
                           className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                         >
                           <option value="">Sélectionner un projet</option>
                           {projects.map((project) => (
                             <option key={project.id} value={project.id}>
                               {project.title}
                             </option>
                           ))}
                         </select>
                       </div>
                     </div>
         
                     <div className="form-group">
                       <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
                         Compétences
                       </label>
                       <input
                         type="text"
                         id="skills"
                         name="skills"
                         value={formData.skills}
                         onChange={handleChange}
                         className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                       />
                     </div>
                     
                     <div className="mt-6 flex justify-between items-center">
                       <button
                         type="button"
                         onClick={onCancel}
                         className="text-gray-600 hover:text-gray-800"
                       >
                         Annuler
                       </button>
                       <button
                         type="submit"
                         className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700"
                       >
                         {entity ? "Mettre à jour" : "Ajouter"}
                       </button>
                     </div>
                   </form>
                 </div>
               );
             };
         
         export default ResourceForm;