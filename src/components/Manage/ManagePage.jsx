// src/components/Manage/ManagePage.js
import React, { useState } from 'react';
import WorkflowManagement from './WorkflowManagement.jsx';
import TemplateManagement from './TemplateManagement.jsx';
import MetricsManagement from './MetricsManagement.jsx';
import ApplicationFormManagement from './ApplicationFormManagement.jsx'; // Import the new component

const ManagePage = () => {
  const [activeSubTab, setActiveSubTab] = useState('workflow');

  const subNavItems = [
    { id: 'workflow', label: 'Workflow Management' },
    { id: 'template', label: 'Template Management' },
    { id: 'metrics', label: 'Metrics Management' },
    { id: 'application-form', label: 'Application Form Management' },
  ];

  const renderSubContent = () => {
    switch (activeSubTab) {
      case 'workflow':
        return <WorkflowManagement />;
      case 'template':
        return <TemplateManagement />;
      case 'metrics':
        return <MetricsManagement />;
      case 'application-form':
        return <ApplicationFormManagement />; // Use the imported component
      default:
        return <WorkflowManagement />;
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Management Dashboard</h1>

      <div className="mb-6 border-b border-gray-300">
        <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto" aria-label="Manage Tabs">
          {subNavItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSubTab(item.id)}
              className={`${
                activeSubTab === item.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-3 px-2 sm:px-3 border-b-2 font-medium text-sm focus:outline-none`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white p-6 shadow-lg rounded-xl">
        {renderSubContent()}
      </div>
    </div>
  );
};

export default ManagePage;