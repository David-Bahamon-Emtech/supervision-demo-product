// src/App.jsx
import React, { useState } from 'react';

// Import the main layout component
import Layout from './components/Layout/Layout.jsx';

// Import page components
import DashboardPage from './components/Dashboard/DashboardPage.jsx';
import LicensingDashboardPage from './components/Licensing/LicensingDashboardPage.jsx';
import ManagePage from './components/Manage/ManagePage.jsx';
import ReportsDashboardPage from './components/Reporting/ReportsDashboardPage.jsx';
import RegulatoryUpdatesDashboardPage from './components/RegulatoryUpdates/RegulatoryUpdatesDashboardPage.jsx';
import RiskAssessmentPage from './components/RiskAssessment/RiskAssessmentPage.jsx';
import MacroSupervisionPage from './components/MacroSupervision/MacroSupervisionPage.jsx';
import MarketConductPage from './components/MarketConduct/MarketConductPage.jsx';
import ExaminationsPage from './components/Examinations/ExaminationsPage.jsx';
import DataAnalyticsPage from './components/DataAnalytics/DataAnalyticsPage.jsx';
import EnforcementPage from './components/Enforcement/EnforcementPage.jsx';
import DocumentManagementPage from './components/DocumentManagement/DocumentManagementPage.jsx';
import SettingsPage from './components/Settings/SettingsPage.jsx';

// Import the WorkflowProvider
import { WorkflowProvider } from './context/WorkflowContext.jsx';

// Import the full-screen submission page
import EnhancedReportSubmissionPage from './components/Reporting/ReportSubmissionPage.jsx';

// --- NEWLY ADDED ---
// Import the new PasswordScreen component
import PasswordScreen from './components/PasswordScreen/PasswordScreen.jsx';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // This state will now control whether we show the main app or the fintech view
  const [currentView, setCurrentView] = useState('main'); // 'main' or 'fintech_submission'

  // --- NEWLY ADDED ---
  // Add authentication state. Set to `false` to show password screen first.
  const [isAuthenticated, setIsAuthenticated] = useState(false);


  const renderMainContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'licensing':
        return <LicensingDashboardPage />;
      case 'manage':
        return <ManagePage />;
      case 'reporting':
        // We pass a function that allows this component to change the view
        return <ReportsDashboardPage onEnterSubmission={() => setCurrentView('fintech_submission')} />;
      case 'regulatory-updates':
        return <RegulatoryUpdatesDashboardPage />;
      case 'risk-assessment':
        return <RiskAssessmentPage />;
      case 'macro-supervision':
        return <MacroSupervisionPage />;
      case 'market-conduct':
        return <MarketConductPage />;
      case 'examinations':
        return <ExaminationsPage />;
      case 'data-analytics':
        return <DataAnalyticsPage />;
      case 'enforcement':
        return <EnforcementPage />;
      case 'document-management':
        return <DocumentManagementPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <div className="p-4"><h1 className="text-2xl font-semibold">Page Not Found</h1></div>;
    }
  };

  // --- UPDATED RENDER LOGIC ---
  if (!isAuthenticated) {
    // If not authenticated, show the password screen
    // Pass a function to update the state upon successful login
    return <PasswordScreen onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <WorkflowProvider>
      {currentView === 'main' ? (
        // If the view is 'main', render the Layout with the sidebar and the active page
        <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
          {renderMainContent()}
        </Layout>
      ) : (
        // Otherwise, render the full-screen fintech submission page WITHOUT the sidebar
        <EnhancedReportSubmissionPage onBack={() => setCurrentView('main')} />
      )}
    </WorkflowProvider>
  );
}

export default App;