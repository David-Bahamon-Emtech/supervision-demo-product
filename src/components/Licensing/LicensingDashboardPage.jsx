// src/components/Licensing/LicensingDashboardPage.js
import React, { useEffect, useState, useCallback } from 'react';
import {
    getAllApplications,
    getLicensesNearingExpiryOrPending,
} from './licensingService';
// NEW: Import service to get regulatory updates
import { getAllUpdates } from '../RegulatoryUpdates/regulatoryUpdatesService.js'; 
import ApplicationsTable from './ApplicationsTable.jsx';
import ApplicationDetailPage from './ApplicationDetailPage.jsx';
import ActiveLicensesTable from './ActiveLicensesTable.jsx';
import LicenseRenewalPage from './LicenseRenewalPage.jsx';
import LicenseActionPage from './LicenseActionPage.jsx';
import NewApplicationPage from './NewApplicationPage.jsx'; 


// Helper function to format date strings
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  return date.toLocaleDateString(undefined, options);
};

// --- Helper Components: SummaryCard & Icons ---
const SummaryCard = ({ title, count, icon, bgColorClass = 'bg-white', textColorClass = 'text-gray-800', iconColorClass = 'text-gray-500' }) => {
  return (
    <div className={`${bgColorClass} p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${bgColorClass.includes('bg-') && !bgColorClass.includes('white') ? 'text-white opacity-80 group-hover:opacity-100' : textColorClass}`}>{title}</p>
          <p className={`text-3xl font-bold ${bgColorClass.includes('bg-') && !bgColorClass.includes('white') ? 'text-white' : textColorClass}`}>{count === null ? '...' : count}</p>
        </div>
        {icon && (
          <div className={`p-3 rounded-full ${bgColorClass.includes('bg-') && !bgColorClass.includes('white') ? 'bg-black bg-opacity-20' : 'bg-gray-100'}`}>
            {React.cloneElement(icon, { className: `${iconColorClass} w-8 h-8` })}
          </div>
        )}
      </div>
    </div>
  );
};
const DocumentTextIcon = ({ className = "w-8 h-8" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h.008v.008H8.25v-.008zM8.25 9.75h.008v.008H8.25V9.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM19.5 14.25A.75.75 0 0118.75 15H7.5A.75.75 0 016.75 14.25v-2.625a3.375 3.375 0 000-6.75H7.5a3.375 3.375 0 013.375 3.375v1.5a2.25 2.25 0 002.25 2.25h1.5a3.375 3.375 0 003.375-3.375V6.75A3.375 3.375 0 0016.5 3.375H8.25" /></svg>;
const CheckCircleIcon = ({ className = "w-8 h-8" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const XCircleIcon = ({ className = "w-8 h-8" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ClockIcon = ({ className = "w-8 h-8" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const BellIcon = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>;

// MODIFICATION: Re-purposed the banner to be more generic for different types of alerts
const AlertBanner = ({ alerts, title, bgColorClass, borderColorClass, textColorClass, icon }) => {
    if (!alerts || alerts.length === 0) return null;

    return (
        <div className={`mb-6 p-3 ${bgColorClass} border ${borderColorClass} ${textColorClass} rounded-md shadow-sm`} style={{ maxHeight: '160px', overflowY: 'auto' }}>
            <div className="flex items-start">
                {React.cloneElement(icon, { className: `w-5 h-5 mr-2.5 flex-shrink-0 mt-0.5`})}
                <div>
                    <h4 className="font-semibold text-sm mb-1">{title}</h4>
                    <ul className="list-disc list-inside space-y-1">
                        {alerts.map((alert, index) => (
                            <li key={index} className="text-xs">
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
  // NEW STATE for regulatory update alerts
  const [regUpdateAlerts, setRegUpdateAlerts] = useState([]);
  
  const [activeTableView, setActiveTableView] = useState('applications'); 

  const fetchDataForDashboard = useCallback(async () => {
    if (managingLicenseAction.showPage || selectedApplicationId || selectedLicenseIdForRenewal || showNewApplicationForm) {
        return;
    }
    setIsLoading(true); 
    setError(null); 
    try {
      // Fetch all data in parallel
      const [applications, rawAlertsData, regUpdates] = await Promise.all([ 
          getAllApplications(),
          getLicensesNearingExpiryOrPending(90, new Date("2025-05-15")),
          getAllUpdates() // NEW: Fetch regulatory updates
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
          // No need to enrich renewal alerts here, we'll keep it simple for the banner
          const formattedRenewalAlerts = rawAlertsData.map(alert => ({
              text: `License ${alert.licenseNumber} is due for renewal on ${formatDate(alert.nextRenewalDueDate)}. Status: ${alert.renewalStatus || "Not Started"}`
          }));
          setRenewalAlerts(formattedRenewalAlerts);
      }
      
      // NEW: Process regulatory updates for the banner
      if (regUpdates) {
          const publishedUpdates = regUpdates
              .filter(u => u.status === 'Published')
              .sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate))
              .slice(0, 5); // Show latest 5
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

  // All handler functions remain unchanged
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
    { title: 'Total Applications', count: summaryData.total, icon: <DocumentTextIcon />, bgColorClass: 'bg-blue-600', textColorClass: 'text-white', iconColorClass: 'text-blue-100' },
    { title: 'Approved Applications', count: summaryData.approved, icon: <CheckCircleIcon />, bgColorClass: 'bg-green-600', textColorClass: 'text-white', iconColorClass: 'text-green-100' },
    { title: 'Applications In Review', count: summaryData.inReview, icon: <ClockIcon />, bgColorClass: 'bg-yellow-500', textColorClass: 'text-white', iconColorClass: 'text-yellow-100' },
    { title: 'Denied Applications', count: summaryData.denied, icon: <XCircleIcon />, bgColorClass: 'bg-red-600', textColorClass: 'text-white', iconColorClass: 'text-red-100' },
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
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6"> 
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Licensing Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Overview of license applications and active licenses.
          </p>
        </div>
        <button
          onClick={handleShowNewApplicationForm}
          className="px-4 py-2 bg-green-500 text-white font-semibold rounded-md shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
        >
          Submit New Application
        </button>
      </div>

      {isLoading && <div className="text-center p-4 text-lg text-gray-600">Loading dashboard data...</div>}
      {error && !isLoading && <div className="text-center p-4 text-red-700 bg-red-100 rounded-md mb-6 shadow">{error}</div>}
      
      {!isLoading && !error && (
        <>
          <AlertBanner 
            alerts={regUpdateAlerts} 
            title="Recent Regulatory Updates" 
            bgColorClass="bg-blue-50" 
            borderColorClass="border-blue-400" 
            textColorClass="text-blue-800"
            icon={<BellIcon className="text-blue-500"/>}
          />
          <AlertBanner 
            alerts={renewalAlerts} 
            title="License Renewal Alerts" 
            bgColorClass="bg-yellow-50" 
            borderColorClass="border-yellow-400" 
            textColorClass="text-yellow-800"
            icon={<ClockIcon className="text-yellow-500"/>}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {summaryCardsData.map(card => (
              <SummaryCard key={card.title} title={card.title} count={card.count} icon={card.icon} bgColorClass={card.bgColorClass} textColorClass={card.textColorClass} iconColorClass={card.iconColorClass} />
            ))}
          </div>

          <div className="mb-6">
            <div className="flex border-b border-gray-300">
              <button onClick={() => setActiveTableView('applications')} className={`py-3 px-4 sm:px-6 -mb-px font-medium text-sm focus:outline-none ${activeTableView === 'applications' ? 'border-b-2 border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-400'}`}>
                License Applications
              </button>
              <button onClick={() => setActiveTableView('licenses')} className={`py-3 px-4 sm:px-6 -mb-px font-medium text-sm focus:outline-none ${activeTableView === 'licenses' ? 'border-b-2 border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-400'}`}>
                Active & Expiring Licenses
              </button>
            </div>
          </div>

          {activeTableView === 'applications' && (
            <>
              <div className="mb-6 p-4 bg-white rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Filter Applications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
                  <div>
                    <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select id="statusFilter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm">
                      {statusOptions.map(option => (<option key={option || 'all-statuses'} value={option}>{option || 'All Statuses'}</option>))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="sourceFilter" className="block text-sm font-medium text-gray-700 mb-1">Applied From</label>
                    <select id="sourceFilter" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm">
                      {sourceOptions.map(option => (<option key={option || 'all-sources'} value={option}>{option || 'All Sources'}</option>))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="companyNameFilter" className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <input type="text" id="companyNameFilter" placeholder="Search company..." value={companyNameFilter} onChange={(e) => setCompanyNameFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm" />
                  </div>
                  <div>
                    <label htmlFor="applicationIdSearch" className="block text-sm font-medium text-gray-700 mb-1">Application ID</label>
                    <input type="text" id="applicationIdSearch" placeholder="Search App ID..." value={applicationIdSearch} onChange={(e) => setApplicationIdSearch(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm" />
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