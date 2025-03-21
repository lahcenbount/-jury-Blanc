import React, { useState, useEffect } from "react";

const resourceService = {
  getAll: () => Promise.resolve({ 
    data: [
      {
        id: "1",
        name: "Jean Dupont",
        role: "Développeur Frontend",
        email: "jean.dupont@example.com",
        phone: "06 12 34 56 78",
        availability: "Disponible",
        skills: "React, JavaScript, CSS",
        projectId: "1"
      },
      {
        id: "2",
        name: "Marie Martin",
        role: "Développeur Backend",
        email: "marie.martin@example.com",
        phone: "06 23 45 67 89",
        availability: "Partiellement disponible",
        skills: "Node.js, Express, MongoDB",
        projectId: "1"
      },
      {
        id: "3",
        name: "Sophie Laurent",
        role: "Designer UX/UI",
        email: "sophie.laurent@example.com",
        phone: "06 34 56 78 90",
        availability: "Non disponible",
        skills: "Figma, Adobe XD, Sketch",
        projectId: "2"
      }
    ] 
  }),
  create: (resource) => Promise.resolve({ data: resource }),
  update: (id, resource) => Promise.resolve({ data: resource }),
  delete: (id) => Promise.resolve({ data: {} })
};

const ResourceManager = ({ activeTab, openForm }) => {
  const [resources, setResources] = useState([]);
  const [filter, setFilter] = useState("all"); // all, available, partial, unavailable
  
  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      const response = await resourceService.getAll();
      setResources(response.data);
    } catch (error) {
      console.error("Failed to load resources:", error);
    }
  };

  const handleCreateResource = () => {
    openForm(null); // Null indicates a new resource
  };

  const handleEditResource = (resource) => {
    openForm(resource);
  };

  const handleDeleteResource = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette ressource ?")) {
      try {
        await resourceService.delete(id);
        setResources(resources.filter(resource => resource.id !== id));
      } catch (error) {
        console.error("Failed to delete resource:", error);
      }
    }
  };

  const getAvailabilityColor = (availability) => {
    switch(availability.toLowerCase()) {
      case "disponible":
        return "bg-green-100 text-green-800";
      case "partiellement disponible":
        return "bg-yellow-100 text-yellow-800";
      case "non disponible":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredResources = resources.filter(resource => {
    if (filter === "all") return true;
    if (filter === "available" && resource.availability.toLowerCase() === "disponible") return true;
    if (filter === "partial" && resource.availability.toLowerCase() === "partiellement disponible") return true;
    if (filter === "unavailable" && resource.availability.toLowerCase() === "non disponible") return true;
    return false;
  });

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Ressources</h1>
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={handleCreateResource}
        >
          Ajouter Ressource
        </button>
      </div>

      <div className="mb-4">
        <div className="flex space-x-2">
          <button 
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded-md ${filter === "all" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Toutes
          </button>
          <button 
            onClick={() => setFilter("available")}
            className={`px-3 py-1 rounded-md ${filter === "available" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Disponibles
          </button>
          <button 
            onClick={() => setFilter("partial")}
            className={`px-3 py-1 rounded-md ${filter === "partial" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Partiellement
          </button>
          <button 
            onClick={() => setFilter("unavailable")}
            className={`px-3 py-1 rounded-md ${filter === "unavailable" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Non disponibles
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map(resource => (
          <div key={resource.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-800">{resource.name}</h3>
                <div className={`px-2 py-1 rounded-md text-xs font-medium ${getAvailabilityColor(resource.availability)}`}>
                  {resource.availability}
                </div>
              </div>
              
              <p className="text-gray-600 font-medium mb-3">{resource.role}</p>
              
              <div className="text-sm text-gray-500 space-y-1">
                <p className="flex items-center">
                  <span className="mr-2">📧</span> {resource.email}
                </p>
                <p className="flex items-center">
                  <span className="mr-2">📞</span> {resource.phone}
                </p>
                <p className="flex items-center">
                  <span className="mr-2">🔧</span> {resource.skills}
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-100 flex justify-end space-x-2">
              <button 
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                onClick={() => handleEditResource(resource)}
              >
                <span className="mr-1">✏️</span> Modifier
              </button>
              <button 
                className="px-3 py-1 text-sm text-red-600 hover:text-red-800 flex items-center"
                onClick={() => handleDeleteResource(resource.id)}
              >
                <span className="mr-1">🗑️</span> Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {filteredResources.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">Aucune ressource trouvée.</p>
        </div>
      )}
    </div>
  );
};

export default ResourceManager;