// src/components/Licensing/LicenseRenewalPage.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  getLicenseById,
  getEntityById,
  getProductById,
  initiateLicenseRenewal,
  updateLicenseRenewalData,
  processLicenseRenewalDecision,
  getLicenseActionsByLicenseId // MODIFICATION: Import getLicenseActionsByLicenseId
} from './licensingService.js';

const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  return date.toLocaleDateString(undefined, options);
};

const InfoRow = ({ label, value, children }) => (
  <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
    <dt className="text-sm font-medium text-gray-600">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
      {children || value || 'N/A'}
    </dd>
  </div>
);

const SectionTitle = ({ title }) => (
  <h3 className="text-lg leading-6 font-semibold text-gray-900 mb-3 mt-6 pb-2 border-b border-gray-200">
    {title}
  </h3>
);

const SuspendedLicenseWarning = ({ statusReason }) => (
    <div className="my-6 p-4 bg-orange-100 border-l-4 border-orange-500 text-orange-700">
        <div className="flex">
            <div className="py-1">
                <svg className="fill-current h-6 w-6 text-orange-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM9 5v6h2V5H9zm0 8v2h2v-2H9z"/>
                </svg>
            </div>
            <div>
                <p className="font-bold">License Suspended</p>
                <p className="text-sm">{statusReason || "This license is currently suspended. Renewal actions are unavailable."}</p>
            </div>
        </div>
    </div>
);


const LicenseRenewalPage = ({ licenseId, onBackToList, onViewLicenseActionDetails }) => { // MODIFICATION: Added onViewLicenseActionDetails prop
  const [license, setLicense] = useState(null);
  const [entity, setEntity] = useState(null);
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newRenewalNote, setNewRenewalNote] = useState("");
  const [renewalDocIdInput, setRenewalDocIdInput] = useState("");
  const [isComplianceReviewed, setIsComplianceReviewed] = useState(false);
  const [decisionReason, setDecisionReason] = useState("");
  const [newExpiryDate, setNewExpiryDate] = useState("");

  // MODIFICATION START: State for active tab within this page and action history
  const [activePageTab, setActivePageTab] = useState('RENEWAL_DETAILS'); // 'RENEWAL_DETAILS' or 'ACTION_HISTORY'
  const [actionHistory, setActionHistory] = useState([]);
  // MODIFICATION END

  const fetchLicenseDetailsAndActions = useCallback(async () => { // MODIFICATION: Renamed and updated function
    if (!licenseId) {
      setError("No License ID provided.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const licData = await getLicenseById(licenseId);
      if (!licData) {
        setError(`License with ID ${licenseId} not found.`);
        setLicense(null);
        setActionHistory([]); // MODIFICATION: Clear history if license not found
        setIsLoading(false);
        return;
      }
      setLicense(licData);
      setIsComplianceReviewed(licData.complianceHistoryReviewed || false);

      const [entityData, productData, historyData] = await Promise.all([ // MODIFICATION: Fetch action history
        getEntityById(licData.entityId),
        getProductById(licData.productId),
        getLicenseActionsByLicenseId(licData.licenseId) // MODIFICATION: Call service
      ]);
      setEntity(entityData);
      setProduct(productData);
      setActionHistory(historyData || []); // MODIFICATION: Set action history

    } catch (err) {
      console.error("Error fetching license details and actions:", err); // MODIFICATION: Updated error message
      setError(`Failed to load license details and/or action history: ${err.message}`);
      setLicense(null);
      setActionHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, [licenseId]);

  useEffect(() => {
    fetchLicenseDetailsAndActions(); // MODIFICATION: Call updated function
  }, [fetchLicenseDetailsAndActions]);

  const handleInitiateRenewal = async () => {
    if (!license || license.licenseStatus === 'Suspended') return;
    try {
      await initiateLicenseRenewal(license.licenseId);
      fetchLicenseDetailsAndActions(); 
    } catch (err) {
      console.error("Error initiating renewal:", err);
      setError(`Could not initiate renewal process: ${err.message}`);
    }
  };

  const handleAddRenewalNote = async () => {
    if (!newRenewalNote.trim() || !license || license.licenseStatus === 'Suspended') return;
    try {
      await updateLicenseRenewalData(license.licenseId, { renewalNotes: [newRenewalNote.trim()] });
      setNewRenewalNote("");
      fetchLicenseDetailsAndActions();
    } catch (err) {
      console.error("Error adding renewal note:", err);
      setError(`Failed to add renewal note: ${err.message}`);
    }
  };
  
  const handleAddRenewalDocumentId = async () => {
    if (!renewalDocIdInput.trim() || !license || license.licenseStatus === 'Suspended') return;
    try {
        await updateLicenseRenewalData(license.licenseId, { renewalDocumentIds: [renewalDocIdInput.trim()] });
        setRenewalDocIdInput("");
        fetchLicenseDetailsAndActions();
    } catch (err) {
        console.error("Error adding document ID:", err);
        setError(`Failed to add document ID: ${err.message}`);
    }
  };

  const handleComplianceReviewToggle = async (checked) => {
    if (!license || license.licenseStatus === 'Suspended') return;
    setIsComplianceReviewed(checked);
    try {
      await updateLicenseRenewalData(license.licenseId, { complianceHistoryReviewed: checked });
      fetchLicenseDetailsAndActions();
    } catch (err) {
      console.error("Error updating compliance review status:", err);
      setIsComplianceReviewed(!checked); 
      setError(`Failed to update compliance review: ${err.message}`);
    }
  };

  const handleProcessDecision = async (decision) => {
    if (!license || license.licenseStatus === 'Suspended') return;
    if (decision === "Renewal Approved" && !newExpiryDate) {
        alert("New Expiry Date is required for approval.");
        return;
    }
    try {
        await processLicenseRenewalDecision(license.licenseId, decision, newExpiryDate, decisionReason);
        fetchLicenseDetailsAndActions();
        alert(`License renewal has been ${decision.toLowerCase()}.`);
        if (decision === "Renewal Approved" || decision === "Renewal Denied") {
            if (onBackToList) onBackToList();
        }
    } catch (err) {
        console.error(`Error processing renewal decision (${decision}):`, err);
        alert(`Failed to process renewal decision. ${err.message}`);
    }
  };
  
  const handleStatusUpdate = async (newStatus) => {
    if(!license || !newStatus || license.licenseStatus === 'Suspended') return;
    try {
        await updateLicenseRenewalData(license.licenseId, { renewalStatus: newStatus });
        fetchLicenseDetailsAndActions();
    } catch(err) {
        console.error("Error updating renewal status:", err);
        setError(`Failed to update renewal status: ${err.message}`);
    }
  };

  // MODIFICATION START: Render function for Action History Tab
  const renderActionHistoryTab = () => {
    if (!actionHistory || actionHistory.length === 0) {
      return <p className="text-gray-500 italic mt-4">No actions recorded for this license.</p>;
    }
    return (
      <div className="space-y-4 mt-4">
        {actionHistory.map(action => (
          <div key={action.actionId} className="bg-white p-4 shadow rounded-lg border border-gray-200">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-md font-semibold text-blue-600">{action.actionType}</h4>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                action.status === 'Approved' ? 'bg-green-100 text-green-700' :
                action.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                action.status === 'Pending Review' || action.status === 'Awaiting Decision' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              }`}>{action.status}</span>
            </div>
            <InfoRow label="Action ID" value={action.actionId} />
            <InfoRow label="Created On" value={formatDate(action.creationDate, true)} />
            <InfoRow label="Reason Category" value={action.reasonCategory} />
            {action.decision && <InfoRow label="Decision" value={action.decision} />}
            {action.decisionDate && <InfoRow label="Decision Date" value={formatDate(action.decisionDate, true)} />}
            <div className="mt-3 text-right">
              <button
                onClick={() => onViewLicenseActionDetails && onViewLicenseActionDetails(action.licenseId, action.actionType, action.actionId)}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline focus:outline-none"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };
  // MODIFICATION END

  // MODIFICATION START: Render function for Renewal Details (existing content)
  const renderRenewalDetailsTab = () => (
    <>
      <dl className="divide-y divide-gray-200">
        <InfoRow label="Issue Date" value={formatDate(license.issueDate)} />
        <InfoRow label="Expiry Date" value={formatDate(license.expiryDate)} />
        <InfoRow label="Next Renewal Due Date" value={formatDate(license.nextRenewalDueDate)} />
        <InfoRow label="Last Renewal Date" value={formatDate(license.lastRenewalDate)} />
        <InfoRow label="Current Renewal Cycle Status">
          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
              license.renewalStatus === "Pending Submission" || license.renewalStatus === "Requires Clarification" ? "bg-yellow-100 text-yellow-800" :
              license.renewalStatus === "Submitted" || license.renewalStatus === "Under Review" ? "bg-blue-100 text-blue-800" :
              license.renewalStatus === "Renewal Approved" ? "bg-green-100 text-green-800" :
              license.renewalStatus === "Renewal Denied" ? "bg-red-100 text-red-800" :
              "bg-gray-100 text-gray-800"
          }`}>
              {license.renewalStatus || "Not Started"}
          </span>
        </InfoRow>
        {license.renewalLastUpdated && <InfoRow label="Renewal Last Updated" value={formatDate(license.renewalLastUpdated, true)} />}
      </dl>

      {isLicenseSuspended && <SuspendedLicenseWarning statusReason={license.statusReason} />}
      
      {canStartRenewal && !isLicenseSuspended && (
          <div className="mt-8 text-center">
              <button
                  onClick={handleInitiateRenewal}
                  className="px-6 py-2.5 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition-colors"
              >
                  Start Renewal Process
              </button>
          </div>
      )}

      {isRenewalProcessActive && !isLicenseSuspended && (
        <>
          <SectionTitle title="1. Document Submission" />
          <div className="bg-gray-50 p-4 rounded-md">
               <div className="mb-3">
                  <label htmlFor="renewalDocIdInput" className="block text-sm font-medium text-gray-700">Add Submitted Document ID (Simulated):</label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                          type="text" id="renewalDocIdInput" value={renewalDocIdInput}
                          onChange={(e) => setRenewalDocIdInput(e.target.value)}
                          placeholder="e.g., doc_013_renewal_financials.pdf"
                          className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 p-2"
                      />
                      <button
                          onClick={handleAddRenewalDocumentId}
                          disabled={!renewalDocIdInput.trim()}
                          className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100 rounded-r-md text-sm font-medium disabled:bg-gray-200 disabled:text-gray-400"
                      > Add Doc ID </button>
                  </div>
              </div>
              {/* TODO: Display submitted renewal documents */}
              {license.renewalStatus === "Pending Submission" && (
                   <button onClick={() => handleStatusUpdate("Submitted")} className="mt-4 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600">
                      Mark as All Documents Submitted
                  </button>
              )}
          </div>

          <SectionTitle title="2. Compliance History Review" />
          <div className="bg-gray-50 p-4 rounded-md">
              <div className="mt-4 flex items-center">
                  <input
                      id="complianceReviewed" name="complianceReviewed" type="checkbox"
                      checked={isComplianceReviewed}
                      onChange={(e) => handleComplianceReviewToggle(e.target.checked)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="complianceReviewed" className="ml-2 block text-sm text-gray-900">
                      Compliance history has been reviewed for this renewal.
                  </label>
              </div>
          </div>

          <SectionTitle title="3. Internal Review & Notes" />
          <div className="bg-gray-50 p-4 rounded-md">
              <textarea
                  value={newRenewalNote} onChange={(e) => setNewRenewalNote(e.target.value)}
                  placeholder="Add internal note for this renewal cycle..."
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm mb-2"
              />
              <button
                  onClick={handleAddRenewalNote} disabled={!newRenewalNote.trim()}
                  className="px-4 py-1.5 bg-gray-600 text-white text-xs font-semibold rounded-md hover:bg-gray-700 disabled:bg-gray-300"
              > Add Renewal Note </button>
              {/* TODO: Display renewal notes */}
              {license.renewalStatus === "Submitted" && isComplianceReviewed && (
                   <button onClick={() => handleStatusUpdate("Under Review")} className="mt-4 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600">
                      Move to "Under Review"
                  </button>
              )}
          </div>

          <SectionTitle title="4. Renewal Decision" />
           <div className="bg-gray-50 p-4 rounded-md space-y-4">
              <div>
                <label htmlFor="newExpiryDate" className="block text-sm font-medium text-gray-700">New Expiry Date (if approving):</label>
                <input type="date" id="newExpiryDate" value={newExpiryDate} onChange={e => setNewExpiryDate(e.target.value)}
                    className="mt-1 block w-full sm:w-1/2 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
              </div>
              <div>
                <label htmlFor="decisionReason" className="block text-sm font-medium text-gray-700">Decision Reason / Notes:</label>
                <textarea id="decisionReason" value={decisionReason} onChange={e => setDecisionReason(e.target.value)}
                    rows="3" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter reason for approval, denial, or clarification request..."/>
              </div>
              <div className="flex space-x-3">
                  <button
                      onClick={() => handleProcessDecision("Renewal Approved")}
                      disabled={!newExpiryDate || license.renewalStatus === "Renewal Approved" || license.renewalStatus === "Renewal Denied"}
                      className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-gray-300"
                  > Approve Renewal </button>
                  <button
                      onClick={() => handleProcessDecision("Renewal Denied")}
                       disabled={license.renewalStatus === "Renewal Approved" || license.renewalStatus === "Renewal Denied"}
                      className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 disabled:bg-gray-300"
                  > Deny Renewal </button>
                   <button
                      onClick={() => handleStatusUpdate("Requires Clarification")}
                       disabled={license.renewalStatus === "Renewal Approved" || license.renewalStatus === "Renewal Denied"}
                      className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-md hover:bg-yellow-600 disabled:bg-gray-300"
                  > Request Clarification </button>
              </div>
          </div>
        </>
      )}
      {(license.renewalStatus === "Renewal Approved" || license.renewalStatus === "Renewal Denied") && !isLicenseSuspended && (
          <div className="mt-8 p-4 bg-gray-50 rounded-md text-center">
              <p className="text-lg font-semibold">
                  Renewal process for this license has been finalized as:
                  <span className={`ml-2 ${license.renewalStatus === "Renewal Approved" ? "text-green-600" : "text-red-600"}`}>
                      {license.renewalStatus}
                  </span>
              </p>
              <p className="text-sm text-gray-600 mt-2">{license.statusReason || decisionReason}</p>
          </div>
      )}
    </>
  );
  // MODIFICATION END

  if (isLoading) return <div className="p-6 text-center text-gray-600 text-lg">Loading license renewal details...</div>;
  if (error && !license) return <div className="p-6 text-center text-red-600 bg-red-100 rounded-md shadow">{error} <button onClick={onBackToList} className="ml-2 text-sm text-blue-600 hover:underline">Go Back</button></div>;
  if (!license) return <div className="p-6 text-center text-gray-500">License data not found. <button onClick={onBackToList} className="ml-2 text-sm text-blue-600 hover:underline">Go Back</button></div>;
  
  const canStartRenewal = license.licenseStatus === "Active" && license.renewalStatus === "Not Started";
  const isRenewalProcessActive = license.licenseStatus !== "Suspended" && license.renewalStatus && license.renewalStatus !== "Not Started" && license.renewalStatus !== "Renewal Approved" && license.renewalStatus !== "Renewal Denied";
  const isLicenseSuspended = license.licenseStatus === 'Suspended';

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">License Management</h1> {/* MODIFICATION: Simplified title */}
        {onBackToList && (
          <button onClick={onBackToList} className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none">
            &larr; Back to Dashboard
          </button>
        )}
      </div>

      {error && <div className="mb-4 p-3 text-center text-red-600 bg-red-100 rounded-md shadow">{error}</div>}

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="border-b border-gray-200 pb-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            License: {license.licenseNumber} <span className="text-base font-normal text-gray-600">- {entity?.companyName || license.entityId}</span>
          </h2>
          <p className="text-sm text-gray-500">Product: {product?.productName || license.productId}</p>
          <p className={`text-sm font-semibold mt-1 ${
            license.licenseStatus === 'Active' ? 'text-green-600' : 
            license.licenseStatus === 'Suspended' ? 'text-orange-600' :
            'text-red-600'
          }`}>
            Current License Status: {license.licenseStatus}
            {license.licenseStatus === 'Suspended' && license.statusReason && <span className="text-xs text-gray-500 italic ml-2">({license.statusReason})</span>}
          </p>
        </div>

        {/* MODIFICATION START: Tab Navigation */}
        <div className="mb-6 border-b border-gray-300">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                <button
                    onClick={() => setActivePageTab('RENEWAL_DETAILS')}
                    className={`${activePageTab === 'RENEWAL_DETAILS' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none`}
                >
                    Renewal Details
                </button>
                <button
                    onClick={() => setActivePageTab('ACTION_HISTORY')}
                    className={`${activePageTab === 'ACTION_HISTORY' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none`}
                >
                    Action History
                </button>
            </nav>
        </div>
        {/* MODIFICATION END */}

        {/* MODIFICATION START: Conditional Tab Content Rendering */}
        {activePageTab === 'RENEWAL_DETAILS' && renderRenewalDetailsTab()}
        {activePageTab === 'ACTION_HISTORY' && renderActionHistoryTab()}
        {/* MODIFICATION END */}

      </div>
    </div>
  );
};

export default LicenseRenewalPage;