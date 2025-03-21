import React, { useState, useEffect } from "react";

const taskService = {
  getAll: () => Promise.resolve({ 
    data: [
      {
        id: "1",
        title: "Développement Frontend",
        description: "Implémenter l'interface utilisateur selon les maquettes",
        projectId: "1",
        startDate: "2025-04-05",
        endDate: "2025-04-20",
        status: "En cours",
        priority: "Haute",
        assignedTo: "Jean Dupont"
      },
      {
        id: "2",
        title: "Configuration Base de données",
        description: "Mettre en place la structure de la base de données",
        projectId: "1",
        startDate: "2025-04-01",
        endDate: "2025-04-10",
        status: "Terminé",
        priority: "Haute",
        assignedTo: "Marie Martin"
      },
      {
        id: "3",
        title: "Tests d'intégration",
        description: "Tester les différentes fonctionnalités ensemble",
        projectId: "2",
        startDate: "2025-06-10",
        endDate: "2025-06-20",
        status: "À faire",
        priority: "Moyenne",
        assignedTo: "Sophie Laurent"
      }
    ] 
  }),
  create: (task) => Promise.resolve({ data: task }),
  update: (id, task) => Promise.resolve({ data: task }),
  delete: (id) => Promise.resolve({ data: {} })
};

const TaskManager = ({ activeTab, openForm }) => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all"); // all, todo, inProgress, done
  
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await taskService.getAll();
      setTasks(response.data);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    }
  };

  const handleCreateTask = () => {
    openForm(null); // Null indicates a new task
  };

  const handleEditTask = (task) => {
    openForm(task);
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) {
      try {
        await taskService.delete(id);
        setTasks(tasks.filter(task => task.id !== id));
      } catch (error) {
        console.error("Failed to delete task:", error);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case "terminé":
        return "bg-green-100 text-green-800";
      case "en cours":
        return "bg-blue-100 text-blue-800";
      case "à faire":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority.toLowerCase()) {
      case "haute":
        return "bg-red-100 text-red-800";
      case "moyenne":
        return "bg-yellow-100 text-yellow-800";
      case "basse":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === "all") return true;
    if (filter === "todo" && task.status.toLowerCase() === "à faire") return true;
    if (filter === "inProgress" && task.status.toLowerCase() === "en cours") return true;
    if (filter === "done" && task.status.toLowerCase() === "terminé") return true;
    return false;
  });

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestionnaire de Tâches</h1>
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={handleCreateTask}
        >
          Créer Tâche
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
            onClick={() => setFilter("todo")}
            className={`px-3 py-1 rounded-md ${filter === "todo" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            À faire
          </button>
          <button 
            onClick={() => setFilter("inProgress")}
            className={`px-3 py-1 rounded-md ${filter === "inProgress" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            En cours
          </button>
          <button 
            onClick={() => setFilter("done")}
            className={`px-3 py-1 rounded-md ${filter === "done" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Terminées
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.map(task => (
          <div key={task.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
                <div className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(task.status)}`}>
                  {task.status}
                </div>
              </div>
              
              <p className="text-gray-600 mb-3">{task.description}</p>
              
              <div className="text-sm text-gray-500 space-y-1">
                <p className="flex items-center">
                  <span className="mr-2">📅</span> {formatDate(task.startDate)} - {formatDate(task.endDate)}
                </p>
                <p className="flex items-center">
                  <span className="mr-2">👤</span> {task.assignedTo}
                </p>
                <p className="flex items-center">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-100 flex justify-end space-x-2">
              <button 
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                onClick={() => handleEditTask(task)}
              >
                <span className="mr-1">✏️</span> Modifier
              </button>
              <button 
                className="px-3 py-1 text-sm text-red-600 hover:text-red-800 flex items-center"
                onClick={() => handleDeleteTask(task.id)}
              >
                <span className="mr-1">🗑️</span> Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {filteredTasks.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">Aucune tâche trouvée.</p>
        </div>
      )}
    </div>
  );
};

export default TaskManager;