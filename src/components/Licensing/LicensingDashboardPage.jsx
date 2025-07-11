// src/components/Licensing/LicensingDashboardPage.js
import React, { useEffect, useState, useCallback } from 'react';
import {
    getAllApplications,
    getLicensesNearingExpiryOrPending,
} from './licensingService';
import { getAllContent } from '../RegulatoryUpdates/regulatoryUpdatesService.js';
import ApplicationsTable from './ApplicationsTable.jsx';
import ApplicationDetailPage from './ApplicationDetailPage.jsx';
import ActiveLicensesTable from './ActiveLicensesTable.jsx';
import LicenseRenewalPage from './LicenseRenewalPage.jsx';
import LicenseActionPage from './LicenseActionPage.jsx';
import NewApplicationPage from './NewApplicationPage.jsx';
import { DocumentTextIcon, CheckCircleIcon, XCircleIcon, ClockIcon, BellIcon } from '@heroicons/react/24/outline';


// Helper function to format date strings
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  return date.toLocaleDateString(undefined, options);
};

// --- UPDATED HELPER COMPONENT: SummaryCard for Dark Theme (Smaller) ---
const SummaryCard = ({ title, count, icon }) => {
  return (
    <div className="bg-theme-bg-secondary p-4 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-theme-text-secondary">{title}</p>
          <p className="text-2xl font-bold text-theme-text-primary">{count === null ? '...' : count}</p>
        </div>
        {icon && (
          <div className="p-2 rounded-full bg-black bg-opacity-20">
            {React.cloneElement(icon, { className: 'text-theme-accent w-6 h-6' })}
          </div>
        )}
      </div>
    </div>
  );
};

const AlertBanner = ({ alerts, title, icon }) => {
    if (!alerts || alerts.length === 0) return null;

    return (
        <div className="mb-6 p-3 bg-theme-bg-secondary border border-theme-border rounded-md shadow-sm" style={{ maxHeight: '160px', overflowY: 'auto' }}>
            <div className="flex items-start">
                {React.cloneElement(icon, { className: `w-5 h-5 mr-2.5 flex-shrink-0 mt-0.5 text-theme-accent`})}
                <div>
                    <h4 className="font-semibold text-sm mb-1 text-theme-text-primary">{title}</h4>
                    <ul className="list-disc list-inside space-y-1">
                        {alerts.map((alert, index) => (
                            <li key={index} className="text-xs text-theme-text-secondary">
                                {alert.text}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};


const LicensingDashboardPage = () => {
  const [_allApplicationsForOptions, setAllApplicationsForOptions] = useState([]);
  const [summaryData, setSummaryData] = useState({ total: null, approved: null, inReview: null, denied: null });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [selectedLicenseIdForRenewal, setSelectedLicenseIdForRenewal] = useState(null);

  const [managingLicenseAction, setManagingLicenseAction] = useState({
    licenseId: null,
    actionType: null,
    existingActionId: null,
    showPage: false,
  });
  const currentStaffId = "reg_001";

  const [showNewApplicationForm, setShowNewApplicationForm] = useState(false);

  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [companyNameFilter, setCompanyNameFilter] = useState('');
  const [applicationIdSearch, setApplicationIdSearch] = useState('');

  const [statusOptions, setStatusOptions] = useState([]);
  const [sourceOptions, setSourceOptions] = useState([]);

  const [renewalAlerts, setRenewalAlerts] = useState([]);
  const [regUpdateAlerts, setRegUpdateAlerts] = useState([]);

  const [activeTableView, setActiveTableView] = useState('applications');

  const fetchDataForDashboard = useCallback(async () => {
    if (managingLicenseAction.showPage || selectedApplicationId || selectedLicenseIdForRenewal || showNewApplicationForm) {
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [applications, rawAlertsData, regContent] = await Promise.all([
          getAllApplications(),
          getLicensesNearingExpiryOrPending(90, new Date("2025-07-10")),
          getAllContent()
      ]);

      if (applications) {
        setAllApplicationsForOptions(applications);
        const total = applications.length;
        const approved = applications.filter(app => app.applicationStatus === 'Approved').length;
        const denied = applications.filter(app => app.applicationStatus === 'Denied').length;
        const inReviewStatuses = ['In Review', 'Initial Review', 'Detailed Review', 'Awaiting Decision', 'Submitted'];
        const inReview = applications.filter(app => inReviewStatuses.includes(app.applicationStatus)).length;
        setSummaryData({ total, approved, inReview, denied });

        const uniqueStatuses = [...new Set(applications.map(app => app.applicationStatus))].filter(Boolean);
        const uniqueSources = [...new Set(applications.map(app => app.source))].filter(Boolean);
        setStatusOptions(['', ...uniqueStatuses.sort()]);
        setSourceOptions(['', ...uniqueSources.sort()]);
      } else {
        setError(prev => prev ? `${prev} & Could not fetch applications.` : "Could not fetch applications.");
      }

      if (rawAlertsData) {
          const formattedRenewalAlerts = rawAlertsData.map(alert => ({
              text: `License ${alert.licenseNumber} is due for renewal on ${formatDate(alert.nextRenewalDueDate)}. Status: ${alert.renewalStatus || "Not Started"}`
          }));
          setRenewalAlerts(formattedRenewalAlerts);
      }

      if (regContent) {
          const publishedUpdates = regContent
              .filter(u => u.contentType === 'Update' && u.status === 'Published')
              .sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate))
              .slice(0, 5);
          const formattedRegAlerts = publishedUpdates.map(u => ({
              text: `New ${u.type}: "${u.title}" issued on ${formatDate(u.issueDate)}.`
          }));
          setRegUpdateAlerts(formattedRegAlerts);
      }

    } catch (err) {
      console.error("Error fetching licensing data for dashboard:", err);
      setError("Failed to load licensing data for the dashboard.");
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [managingLicenseAction.showPage, selectedApplicationId, selectedLicenseIdForRenewal, showNewApplicationForm]);


  useEffect(() => {
    fetchDataForDashboard();
  }, [fetchDataForDashboard]);

  const handleApplicationSelect = (applicationId) => {
    setSelectedApplicationId(applicationId);
    setSelectedLicenseIdForRenewal(null);
    setManagingLicenseAction({ showPage: false, licenseId: null, actionType: null, existingActionId: null });
    setShowNewApplicationForm(false);
  };
  const handleManageRenewalClick = (licenseId) => {
    setSelectedLicenseIdForRenewal(licenseId);
    setSelectedApplicationId(null);
    setManagingLicenseAction({ showPage: false, licenseId: null, actionType: null, existingActionId: null });
    setShowNewApplicationForm(false);
  };
  const handleManageLicenseAction = (licenseId, actionType, existingActionId = null) => {
    setManagingLicenseAction({
        licenseId,
        actionType,
        existingActionId,
        showPage: true,
    });
    setSelectedApplicationId(null);
    setSelectedLicenseIdForRenewal(null);
    setShowNewApplicationForm(false);
  };
  const handleShowNewApplicationForm = () => {
    setShowNewApplicationForm(true);
    setSelectedApplicationId(null);
    setSelectedLicenseIdForRenewal(null);
    setManagingLicenseAction({ showPage: false, licenseId: null, actionType: null, existingActionId: null });
  };
  const handleBackToDashboard = () => {
    setSelectedApplicationId(null);
    setSelectedLicenseIdForRenewal(null);
    setManagingLicenseAction({ showPage: false, licenseId: null, actionType: null, existingActionId: null });
    setShowNewApplicationForm(false);
  };
  const handleLicenseActionCompleted = (action, submitted = false) => {
    console.log("License action completed/saved:", action);
    handleBackToDashboard();
  };
  const handleApplicationSubmitSuccess = () => {
    setShowNewApplicationForm(false);
    fetchDataForDashboard();
  };
  const handleClearFilters = () => {
    setStatusFilter('');
    setSourceFilter('');
    setCompanyNameFilter('');
    setApplicationIdSearch('');
  };

  const summaryCardsData = [
    { title: 'Total Applications', count: summaryData.total, icon: <DocumentTextIcon /> },
    { title: 'Approved Applications', count: summaryData.approved, icon: <CheckCircleIcon /> },
    { title: 'Applications In Review', count: summaryData.inReview, icon: <ClockIcon /> },
    { title: 'Denied Applications', count: summaryData.denied, icon: <XCircleIcon /> },
  ];

  if (showNewApplicationForm) {
    return <NewApplicationPage
             onBackToList={handleBackToDashboard}
             onApplicationSubmitSuccess={handleApplicationSubmitSuccess}
           />;
  }
  if (managingLicenseAction.showPage) {
    return <LicenseActionPage licenseId={managingLicenseAction.licenseId} actionType={managingLicenseAction.actionType} existingActionId={managingLicenseAction.existingActionId} onBackToList={handleBackToDashboard} onActionCompleted={handleLicenseActionCompleted} currentStaffId={currentStaffId} />;
  }
  if (selectedApplicationId) {
    return <ApplicationDetailPage applicationId={selectedApplicationId} onBackToList={handleBackToDashboard} />;
  }
  if (selectedLicenseIdForRenewal) {
    return <LicenseRenewalPage licenseId={selectedLicenseIdForRenewal} onBackToList={handleBackToDashboard} onViewLicenseActionDetails={handleManageLicenseAction} />;
  }

  return (
    <div className="p-4 md:p-6 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-theme-text-primary">Licensing Dashboard</h1>
          <p className="text-theme-text-secondary mt-1">
            Overview of license applications and active licenses.
          </p>
        </div>
        <button
          onClick={handleShowNewApplicationForm}
          className="px-4 py-2 bg-theme-accent text-sidebar-bg font-semibold rounded-md shadow-sm hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-bg focus:ring-theme-accent"
        >
          Submit New Application
        </button>
      </div>

      {isLoading && <div className="text-center p-4 text-lg text-theme-text-secondary">Loading dashboard data...</div>}
      {error && !isLoading && <div className="text-center p-4 text-red-500 bg-red-100 rounded-md mb-6 shadow">{error}</div>}

      {!isLoading && !error && (
        <>
          <AlertBanner
            alerts={regUpdateAlerts}
            title="Recent Regulatory Updates"
            icon={<BellIcon />}
          />
          <AlertBanner
            alerts={renewalAlerts}
            title="License Renewal Alerts"
            icon={<ClockIcon />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {summaryCardsData.map(card => (
              <SummaryCard key={card.title} title={card.title} count={card.count} icon={card.icon} />
            ))}
          </div>

          <div className="mb-6">
            <div className="flex border-b border-theme-border">
              <button onClick={() => setActiveTableView('applications')} className={`py-3 px-4 sm:px-6 -mb-px font-medium text-sm focus:outline-none ${activeTableView === 'applications' ? 'border-b-2 border-theme-accent text-theme-accent' : 'border-transparent text-theme-text-secondary hover:text-theme-text-primary'}`}>
                License Applications
              </button>
              <button onClick={() => setActiveTableView('licenses')} className={`py-3 px-4 sm:px-6 -mb-px font-medium text-sm focus:outline-none ${activeTableView === 'licenses' ? 'border-b-2 border-theme-accent text-theme-accent' : 'border-transparent text-theme-text-secondary hover:text-theme-text-primary'}`}>
                Active & Expiring Licenses
              </button>
            </div>
          </div>

          {activeTableView === 'applications' && (
            <>
              <div className="mb-6 p-4 bg-theme-bg-secondary rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-theme-text-primary mb-3">Filter Applications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
                  <div>
                    <label htmlFor="statusFilter" className="block text-sm font-medium text-theme-text-secondary mb-1">Status</label>
                    <select id="statusFilter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-3 py-2 bg-theme-bg border border-theme-border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-theme-accent text-sm">
                      {statusOptions.map(option => (<option key={option || 'all-statuses'} value={option}>{option || 'All Statuses'}</option>))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="sourceFilter" className="block text-sm font-medium text-theme-text-secondary mb-1">Applied From</label>
                    <select id="sourceFilter" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="w-full px-3 py-2 bg-theme-bg border border-theme-border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-theme-accent text-sm">
                      {sourceOptions.map(option => (<option key={option || 'all-sources'} value={option}>{option || 'All Sources'}</option>))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="companyNameFilter" className="block text-sm font-medium text-theme-text-secondary mb-1">Company Name</label>
                    <input type="text" id="companyNameFilter" placeholder="Search company..." value={companyNameFilter} onChange={(e) => setCompanyNameFilter(e.target.value)} className="w-full px-3 py-2 bg-theme-bg border border-theme-border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-theme-accent text-sm" />
                  </div>
                  <div>
                    <label htmlFor="applicationIdSearch" className="block text-sm font-medium text-theme-text-secondary mb-1">Application ID</label>
                    <input type="text" id="applicationIdSearch" placeholder="Search App ID..." value={applicationIdSearch} onChange={(e) => setApplicationIdSearch(e.target.value)} className="w-full px-3 py-2 bg-theme-bg border border-theme-border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-theme-accent text-sm" />
                  </div>
                  <div className="flex items-end">
                    <button onClick={handleClearFilters} className="w-full px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 text-sm transition-colors shadow-sm">
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
              <ApplicationsTable
                onRowClick={handleApplicationSelect}
                statusFilter={statusFilter}
                sourceFilter={sourceFilter}
                companyNameFilter={companyNameFilter}
                applicationIdFilter={applicationIdSearch}
              />
            </>
          )}

          {activeTableView === 'licenses' && (
            <ActiveLicensesTable
              onManageRenewalClick={handleManageRenewalClick}
              onManageLicenseAction={handleManageLicenseAction}
            />
          )}
        </>
      )}
    </div>
  );
};

export default LicensingDashboardPage;