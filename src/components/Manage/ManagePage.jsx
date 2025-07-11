// src/components/Manage/ManagePage.js
import React, { useState } from 'react';
import WorkflowManagement from './WorkflowManagement.jsx';
import TemplateManagement from './TemplateManagement.jsx';
import MetricsManagement from './MetricsManagement.jsx';
import ApplicationFormManagement from './ApplicationFormManagement.jsx';

const ManagePage = () => {
  const [activeSubTab, setActiveSubTab] = useState('application-form');

  const subNavItems = [
    { id: 'workflow', label: 'Workflow Management' },
    { id: 'template', label: 'Template Management' },
    { id: 'metrics', label: 'Metrics Management' },
    { id: 'application-form', label: 'Application Form Management' },
  ];

  const renderSubContent = () => {
    switch (activeSubTab) {
      case 'workflow':
        // NOTE: This component's content has not been provided, so it will appear unstyled.
        return <WorkflowManagement />;
      case 'template':
        // NOTE: This component's content has not been provided, so it will appear unstyled.
        return <TemplateManagement />;
      case 'metrics':
        // NOTE: This component's content has not been provided, so it will appear unstyled.
        return <MetricsManagement />;
      case 'application-form':
        return <ApplicationFormManagement />; // This component has been styled.
      default:
        return <ApplicationFormManagement />;
    }
  };

  return (
    <div className="p-4 md:p-6 bg-theme-bg min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-theme-text-primary">Management Dashboard</h1>
        <p className="text-theme-text-secondary mt-1">Configure and manage core system settings, templates, and workflows.</p>
      </div>

      <div className="mb-6 border-b border-theme-border">
        <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto" aria-label="Manage Tabs">
          {subNavItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSubTab(item.id)}
              className={`${
                activeSubTab === item.id
                  ? 'border-theme-accent text-theme-accent'
                  : 'border-transparent text-theme-text-secondary hover:text-theme-text-primary hover:border-gray-500'
              } whitespace-nowrap py-3 px-2 sm:px-3 border-b-2 font-medium text-sm focus:outline-none`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* The content container is now themed. The content inside will depend on whether its component has been themed. */}
      <div className="bg-theme-bg-secondary p-6 shadow-lg rounded-xl border border-theme-border">
        {renderSubContent()}
      </div>
    </div>
  );
};

export default ManagePage;