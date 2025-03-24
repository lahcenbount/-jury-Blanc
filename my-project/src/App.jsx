import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ProjectManager from './components/ProjectManager';
import Header from './components/Header';

function App() {
  const [activeTab, setActiveTab] = useState('projects');

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col">
      {/* Header */}
      <Header />

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content */}
        <div className="flex-1 p-6 ml-0 lg:ml-64"> 
          <ProjectManager activeTab={activeTab} />
        </div>
      </div>
    </div>
  );
}

export default App;
