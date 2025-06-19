// src/components/Reporting/ReportsDashboardPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { getLicenseCategories } from './reportingService.js';
import LicenseCategoryReportsPage from './LicenseCategoryReportsPage.jsx'; 
import EntityReportDetailPage from './EntityReportDetailPage.jsx';
// NEW: Import service for regulatory updates
import { getAllUpdates } from '../RegulatoryUpdates/regulatoryUpdatesService.js'; 

// NEW: Alert Banner component
const AlertBanner = ({ alerts, title, icon }) => {
    if (!alerts || alerts.length === 0) return null;

    return (
        <div className="mb-6 p-3 bg-blue-50 border border-blue-400 text-blue-800 rounded-md shadow-sm">
            <div className="flex items-start">
                {React.cloneElement(icon, { className: `w-5 h-5 mr-2.5 text-blue-500 flex-shrink-0 mt-0.5`})}
                <div>
                    <h4 className="font-semibold text-sm mb-1">{title}</h4>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                        {alerts.map((alert, index) => (
                            <li key={index}>{alert.title} (Effective: {new Date(alert.effectiveDate).toLocaleDateString()})</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

// NEW: Icon for the banner
const BellIcon = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>;


const ReportsDashboardPage = () => {
  const [licenseCategories, setLicenseCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // NEW: State for regulatory update alerts
  const [regUpdateAlerts, setRegUpdateAlerts] = useState([]);

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedEntityId, setSelectedEntityId] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    if (selectedCategoryId || selectedEntityId) {
        setIsLoading(false);
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // Fetch categories and updates in parallel
      const [categories, updates] = await Promise.all([
        getLicenseCategories(),
        getAllUpdates()
      ]);
      
      setLicenseCategories(categories || []);

      // NEW: Filter for recent, published updates to display as alerts
      if (updates) {
        const recentPublished = updates
            .filter(u => u.status === 'Published' && new Date(u.issueDate) > new Date(new Date().setMonth(new Date().getMonth() - 3))) // Published in last 3 months
            .sort((a,b) => new Date(b.issueDate) - new Date(a.issueDate));
        setRegUpdateAlerts(recentPublished);
      }

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load reporting dashboard. Please try again later.");
      setLicenseCategories([]);
      setRegUpdateAlerts([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategoryId, selectedEntityId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setSelectedEntityId(null); 
  };

  const handleEntitySelect = (entityId) => {
    setSelectedEntityId(entityId);
  };

  const handleBackToCategories = () => {
    setSelectedCategoryId(null);
    setSelectedEntityId(null);
    // Data will be refetched by useEffect
  };

  const handleBackToCategoryDetail = () => {
    setSelectedEntityId(null);
  };


  if (isLoading) {
    return <div className="p-6 text-center text-gray-600 text-lg">Loading Reporting Dashboard...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-700 bg-red-100 rounded-md shadow">{error}</div>;
  }

  // --- Navigation Logic ---
  if (selectedEntityId && selectedCategoryId) {
    return (
      <EntityReportDetailPage
        entityId={selectedEntityId}
        onBack={handleBackToCategoryDetail}
      />
    );
  }

  if (selectedCategoryId) {
    return (
      <LicenseCategoryReportsPage
        categoryId={selectedCategoryId}
        onBack={handleBackToCategories}
        onSelectEntity={handleEntitySelect}
      />
    );
  }

  // Default view: Show license categories
  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Reporting Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Navigate license categories to view specific compliance reports and metrics.
        </p>
      </div>

      {/* NEW: Display the alert banner */}
      <AlertBanner 
        alerts={regUpdateAlerts}
        title="Recent Regulatory Updates Affecting Reporting"
        icon={<BellIcon />}
      />

      {licenseCategories.length === 0 && !isLoading && (
        <div className="text-center p-10 text-gray-500 bg-white rounded-lg shadow">
          No license categories found or defined.
        </div>
      )}

      {licenseCategories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {licenseCategories.map((category) => (
            <div
              key={category.id}
              onClick={() => handleCategorySelect(category.id)}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out cursor-pointer transform hover:-translate-y-1"
            >
              <h2 className="text-xl font-semibold text-blue-700 mb-2">{category.name}</h2>
              <p className="text-sm text-gray-600 mb-3 h-16 overflow-hidden">{category.description}</p>
              <div className="text-xs text-gray-500">
                <span className="font-medium">Relevant Report Types:</span>
                <ul className="list-disc list-inside ml-1 mt-1">
                  {(category.relevantComplianceReportTypes || []).slice(0, 2).map(rt => <li key={rt} className="truncate">{rt.replace(/_/g, ' ')}</li>)}
                  {(category.relevantComplianceReportTypes || []).length > 2 && <li className="text-gray-400 italic">...and more</li>}
                </ul>
              </div>
                <button
                    className="mt-4 w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                >
                    View Category Reports
                </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportsDashboardPage;