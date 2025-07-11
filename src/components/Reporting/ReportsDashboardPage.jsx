// src/components/Reporting/ReportsDashboardPage.js
import React, { useState, useEffect, useCallback } from 'react';
import {
    getOverallComplianceSnapshot,
    getRecentActivity,
    getLicenseCategories
} from './reportingService.js';
import LicenseCategoryReportsPage from './LicenseCategoryReportsPage.jsx';
import EntityReportDetailPage from './EntityReportDetailPage.jsx';

// --- Reusable Components for the New Dashboard (Updated for Dark Theme) ---

const StatCard = ({ title, value, icon, description }) => (
    <div className="bg-theme-bg-secondary p-5 rounded-xl shadow-lg flex items-start space-x-4 border border-theme-border">
        <div className="bg-black bg-opacity-20 p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-theme-text-secondary">{title}</p>
            <p className="text-3xl font-bold text-theme-text-primary">{value}</p>
            <p className="text-xs text-theme-text-secondary mt-1">{description}</p>
        </div>
    </div>
);

const ReportTypeIcon = ({ reportType }) => {
    const formattedType = reportType.replace(/_/g, ' ');
    let icon;

    if (reportType.toLowerCase().includes('data')) {
        icon = (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-theme-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <title>{formattedType}</title>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h4M8 7a2 2 0 012-2h4a2 2 0 012 2v8a2 2 0 01-2-2h-4a2 2 0 01-2-2l-4-4z" />
            </svg>
        );
    } else {
        icon = (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-theme-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <title>{formattedType}</title>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        );
    }
    return <div className="flex justify-center">{icon}</div>;
};

const ActivityTable = ({ title, headers, items, onRowClick }) => (
    <div className="bg-theme-bg-secondary p-6 rounded-xl shadow-lg border border-theme-border">
        <h3 className="text-xl font-semibold text-theme-text-primary mb-4">{title}</h3>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-theme-border">
                <thead className="bg-black bg-opacity-20">
                    <tr>
                        {headers.map((h, i) => (
                            <th key={i} scope="col" className={`px-6 py-3 text-xs font-medium text-theme-text-secondary uppercase tracking-wider ${h === 'Type' ? 'text-center' : 'text-left'}`}>{h}</th>
                        ))}
                         <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">View</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-theme-bg-secondary divide-y divide-theme-border">
                    {items.map((item, index) => (
                        <tr key={index} onClick={() => onRowClick(item.entityId, item.categoryId)} className="hover:bg-theme-bg cursor-pointer group">
                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-theme-text-primary">{item.entity}</td>
                           <td className="px-6 py-4 whitespace-nowrap"><ReportTypeIcon reportType={item.reportType} /></td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary">{item.date}</td>
                           <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                View &rarr;
                           </td>
                        </tr>
                    ))}
                    {items.length === 0 && (
                        <tr>
                            <td colSpan={headers.length + 1} className="px-6 py-4 text-center text-sm text-theme-text-secondary italic">
                                No items to display.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
);


const ReportsDashboardPage = ({ onEnterSubmission }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [licenseCategories, setLicenseCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
      const [snapshot, activity, categories] = await Promise.all([
        getOverallComplianceSnapshot(),
        getRecentActivity(),
        getLicenseCategories(),
      ]);

      setDashboardData({ snapshot, activity });
      setLicenseCategories(categories || []);

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load reporting dashboard. Please try again later.");
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

  const handleDrillDown = (entityId, categoryId) => {
    setSelectedCategoryId(categoryId);
    handleEntitySelect(entityId);
  };

  const handleBackToCategories = () => {
    setSelectedCategoryId(null);
    setSelectedEntityId(null);
  };

  const handleBackToCategoryDetail = () => {
    setSelectedEntityId(null);
  };

  const ICONS = {
      Overdue: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      IssuesFound: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
      UnderReview: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
  };


  if (isLoading) {
    return <div className="p-6 text-center text-theme-text-secondary text-lg">Loading Reporting Dashboard...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-400 bg-red-900 bg-opacity-20 rounded-md shadow">{error}</div>;
  }

  if (selectedEntityId && selectedCategoryId) {
    return <EntityReportDetailPage entityId={selectedEntityId} onBack={handleBackToCategoryDetail} />;
  }

  if (selectedCategoryId) {
    return <LicenseCategoryReportsPage categoryId={selectedCategoryId} onBack={handleBackToCategories} onSelectEntity={handleEntitySelect} />;
  }

  const overdueItems = dashboardData?.activity?.recentOverdue.map(item => ({ ...item, date: item.dueDate })) || [];
  const flaggedItems = dashboardData?.activity?.recentIssues.map(item => ({ ...item, date: item.finalizedDate })) || [];

  return (
    <div className="p-4 md:p-6 min-h-screen">
      <div className="mb-6">
        <div>
          <h1 className="text-3xl font-bold text-theme-text-primary">Compliance Reporting Dashboard</h1>
          <p className="text-theme-text-secondary mt-1">
            At-a-glance overview of system-wide compliance health.
          </p>
        </div>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <StatCard title="Overdue Submissions" value={dashboardData?.snapshot?.overdueCount || 0} description="Reports past their due date." icon={ICONS.Overdue} />
            <StatCard title="Entities with Issues" value={dashboardData?.snapshot?.entitiesWithIssuesCount || 0} description="Finalized reviews with issues found." icon={ICONS.IssuesFound} />
            <StatCard title="Submissions Under Review" value={dashboardData?.snapshot?.underReviewCount || 0} description="Reports currently being reviewed." icon={ICONS.UnderReview} />
       </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ActivityTable
                title="Recently Overdue Submissions"
                headers={['Entity', 'Type', 'Due Date']}
                items={overdueItems}
                onRowClick={(entityId, categoryId) => handleDrillDown(entityId, categoryId)}
            />
            <ActivityTable
                title="Recently Flagged Submissions"
                headers={['Entity', 'Type', 'Finalized Date']}
                items={flaggedItems}
                onRowClick={(entityId, categoryId) => handleDrillDown(entityId, categoryId)}
            />
        </div>


      <div>
        <h2 className="text-2xl font-semibold text-theme-text-primary mb-4">Drill Down by Category</h2>
          {licenseCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {licenseCategories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className="bg-theme-bg-secondary p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out cursor-pointer transform hover:-translate-y-1 border border-theme-border"
                >
                  <h2 className="text-xl font-semibold text-theme-accent mb-2">{category.name}</h2>
                  <p className="text-sm text-theme-text-secondary mb-3 h-16 overflow-hidden">{category.description}</p>
                   <button
                        className="mt-4 w-full px-4 py-2 text-sm font-medium text-sidebar-bg bg-theme-accent rounded-md hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-bg-secondary focus:ring-theme-accent"
                    >
                        View Category Reports
                    </button>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center p-10 text-theme-text-secondary bg-theme-bg-secondary rounded-lg shadow">
              No license categories found or defined.
            </div>
          )}
      </div>

      <div className="mt-8 text-right">
        <button
          onClick={onEnterSubmission}
          className="bg-theme-accent text-sidebar-bg px-3 py-1.5 rounded-md shadow-md hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-bg focus:ring-theme-accent text-xs font-semibold"
        >
          Fintech Report Submission Demo
        </button>
      </div>
    </div>
  );
};

export default ReportsDashboardPage;