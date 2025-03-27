import React, { useState } from 'react';
import Header from './components/Header'; 
import Sidebar from './components/Sidebar'; 
import ProjectManager from './components/ProjectManager';
import TaskManager from './components/TaskManager';
import ResourceManager from './components/ResourceManager';

function App() {
  const [activeTab, setActiveTab] = useState('projects');

  const renderContent = () => {
    switch(activeTab) {
      case 'projects':
        return <ProjectManager />;
      case 'tasks':
        return <TaskManager />;
      case 'resources':
        return <ResourceManager />;
      default:
        return <ProjectManager />;
    }
  };

  return (
    <div className="flex h-screen">
      
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 p-6 ml-64 lg:ml-64">
        
        <Header />

        {renderContent()}
      </div>
    </div>
  );
}

export default App;
