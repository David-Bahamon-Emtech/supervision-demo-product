// src/App.jsx - Clean Version
import React, { useState } from 'react';

// Import the main layout component
import Layout from './components/Layout/Layout.jsx';

// Import the specific component for the Licensing section
import LicensingDashboardPage from './components/Licensing/LicensingDashboardPage.jsx';
import ManagePage from './components/Manage/ManagePage.jsx';
import ReportsDashboardPage from './components/Reporting/ReportsDashboardPage.jsx';
import RegulatoryUpdatesDashboardPage from './components/RegulatoryUpdates/RegulatoryUpdatesDashboardPage.jsx';

// Import the new WorkflowProvider
import { WorkflowProvider } from './context/WorkflowContext.jsx';

// Import DevRoadmapBanner and a question mark icon for it
import DevRoadmapBanner from './components/Layout/DevRoadmapBanner.jsx';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline'; // You might need to install @heroicons/react

// Main application component
function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showDevRoadmapBanner, setShowDevRoadmapBanner] = useState(false); // New state for banner visibility

  const renderContent = () => {
    const pageTitle = activeTab
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());

    switch (activeTab) {
      case 'licensing':
        return <LicensingDashboardPage />;

      case 'manage':
        return <ManagePage />;

      case 'reporting':
        return <ReportsDashboardPage />;

      case 'regulatory-updates':
        return <RegulatoryUpdatesDashboardPage />;

      case 'settings':
        return (
          <div className="p-4">
            <h1 className="text-2xl font-semibold">Settings</h1>
            <p>Application settings will be here.</p>
          </div>
        );

      case 'dashboard':
      case 'risk-assessment':
      case 'macro-supervision':
      case 'market-conduct':
      case 'examinations':
      case 'data-analytics':
      case 'enforcement':
      case 'document-management':
        return (
          <div className="p-4">
            <div className="flex items-center mb-4">
              <h1 className="text-2xl font-semibold">{pageTitle}</h1>
              <QuestionMarkCircleIcon
                className="w-6 h-6 ml-3 text-gray-500 cursor-pointer hover:text-blue-600"
                onClick={() => setShowDevRoadmapBanner(!showDevRoadmapBanner)}
                title="View Development Roadmap"
              />
            </div>
            {showDevRoadmapBanner && (
              <DevRoadmapBanner
                isOpen={showDevRoadmapBanner}
                onClose={() => setShowDevRoadmapBanner(false)}
              />
            )}
            <p>This is the placeholder content for the {pageTitle} section.</p>
            <p>More specific components and features will be added here later.</p>
          </div>
        );
      default:
        return (
          <div className="p-4">
            <div className="flex items-center mb-4">
                <h1 className="text-2xl font-semibold">Dashboard</h1>
                <QuestionMarkCircleIcon
                    className="w-6 h-6 ml-3 text-gray-500 cursor-pointer hover:text-blue-600"
                    onClick={() => setShowDevRoadmapBanner(!showDevRoadmapBanner)}
                    title="View Development Roadmap"
                />
            </div>
            {showDevRoadmapBanner && (
              <DevRoadmapBanner
                isOpen={showDevRoadmapBanner}
                onClose={() => setShowDevRoadmapBanner(false)}
              />
            )}
            <p>This is the placeholder content for the Dashboard section.</p>
          </div>
        );
    }
  };

  return (
    <WorkflowProvider>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderContent()}
      </Layout>
    </WorkflowProvider>
  );
}

export default App;