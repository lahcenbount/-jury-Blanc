import React from 'react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex gap-4 mb-8 justify-center">
      <button onClick={() => setActiveTab('projects')} className={`px-4 py-2 rounded ${activeTab === 'projects' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
        Projets
      </button>
      <button onClick={() => setActiveTab('tasks')} className={`px-4 py-2 rounded ${activeTab === 'tasks' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
        Tâches
      </button>
      <button onClick={() => setActiveTab('resources')} className={`px-4 py-2 rounded ${activeTab === 'resources' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
        Ressources
      </button>
    </div>
  );
};

export default Sidebar;
