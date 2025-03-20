import React, { useState } from 'react';
import ProjectManager from './components/ProjectManager';

function App() {
  const [activeTab, setActiveTab] = useState('projects');

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">ConstructionXpert</h1>
          <p className="text-sm">Gestion de projets de construction</p>
        </div>
      </header>

      <div className="container mx-auto p-4">
        <nav className="bg-white p-4 mb-6 rounded-lg shadow-md">
          <ul className="flex space-x-4">
            <li>
              <button 
                onClick={() => setActiveTab('projects')}
                className={`px-4 py-2 rounded ${activeTab === 'projects' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                Projets
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('tasks')}
                className={`px-4 py-2 rounded ${activeTab === 'tasks' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                Tâches
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('resources')}
                className={`px-4 py-2 rounded ${activeTab === 'resources' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                Ressources
              </button>
            </li>
          </ul>
        </nav>

        <ProjectManager activeTab={activeTab} />
      </div>
    </div>
  );
}

export default App;