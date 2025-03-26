import React, { useState } from 'react';

function Sidebar({ activeTab, setActiveTab }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    
  };

  return (
    <>
      {/* Hamburger Button for Mobile */}
      <button 
        className="lg:hidden absolute top-4 left-4 p-2 bg-blue-600 text-white rounded"
        onClick={toggleSidebar}
        aria-label={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
      >
        <span className="block w-6 h-0.5 bg-white mb-1"></span>
        <span className="block w-6 h-0.5 bg-white mb-1"></span>
        <span className="block w-6 h-0.5 bg-white"></span>
      </button>

      {/* Sidebar Navigation */}
      <nav 
        className={`fixed top-0 left-0 h-full bg-white p-4 mb-6 rounded-r-lg shadow-md transform transition-all duration-300 ease-in-out w-60 lg:w-64 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:block`}
      >
        <ul className="flex flex-col space-y-4">
          <li>
            <button 
              onClick={() => setActiveTab('projects')}
              className={`w-full px-4 py-2 rounded text-left ${activeTab === 'projects' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Projets
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('tasks')}
              className={`w-full px-4 py-2 rounded text-left ${activeTab === 'tasks' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Tâches
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('resources')}
              className={`w-full px-4 py-2 rounded text-left ${activeTab === 'resources' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Ressources
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}

export default Sidebar;
