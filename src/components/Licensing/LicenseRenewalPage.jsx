// src/components/Licensing/LicenseRenewalPage.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  getLicenseById,
  getEntityById,
  getProductById,
  initiateLicenseRenewal,
  updateLicenseRenewalData,
  processLicenseRenewalDecision,
  getLicenseActionsByLicenseId
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
    <dt className="text-sm font-medium text-theme-text-secondary">{label}</dt>
    <dd className="mt-1 text-sm text-theme-text-primary sm:mt-0 sm:col-span-2">
      {children || value || 'N/A'}
    </dd>
  </div>
);

const SectionTitle = ({ title }) => (
  <h3 className="text-lg leading-6 font-semibold text-theme-text-primary mb-3 mt-6 pb-2 border-b border-theme-border">
    {title}
  </h3>
);

const SuspendedLicenseWarning = ({ statusReason }) => (
    <div className="my-6 p-4 bg-orange-900 bg-opacity-30 border-l-4 border-orange-500 text-orange-200">
        <div className="flex">
            <div className="py-1">
                <svg className="fill-current h-6 w-6 text-orange-400 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
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


const LicenseRenewalPage = ({ licenseId, onBackToList, onViewLicenseActionDetails }) => {
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

  const [activePageTab, setActivePageTab] = useState('RENEWAL_DETAILS');
  const [actionHistory, setActionHistory] = useState([]);

  const fetchLicenseDetailsAndActions = useCallback(async () => {
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
        setActionHistory([]);
        setIsLoading(false);
        return;
      }
      setLicense(licData);
      setIsComplianceReviewed(licData.complianceHistoryReviewed || false);

      const [entityData, productData, historyData] = await Promise.all([
        getEntityById(licData.entityId),
        getProductById(licData.productId),
        getLicenseActionsByLicenseId(licData.licenseId)
      ]);
      setEntity(entityData);
      setProduct(productData);
      setActionHistory(historyData || []);

    } catch (err) {
      console.error("Error fetching license details and actions:", err);
      setError(`Failed to load license details and/or action history: ${err.message}`);
      setLicense(null);
      setActionHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, [licenseId]);

  useEffect(() => {
    fetchLicenseDetailsAndActions();
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

  const renderActionHistoryTab = () => {
    if (!actionHistory || actionHistory.length === 0) {
      return <p className="text-theme-text-secondary italic mt-4">No actions recorded for this license.</p>;
    }
    return (
      <div className="space-y-4 mt-4">
        {actionHistory.map(action => (
          <div key={action.actionId} className="bg-theme-bg p-4 shadow rounded-lg border border-theme-border">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-md font-semibold text-blue-400">{action.actionType}</h4>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                action.status === 'Approved' ? 'bg-green-200 text-green-800' :
                action.status === 'Rejected' ? 'bg-red-200 text-red-800' :
                action.status === 'Pending Review' || action.status === 'Awaiting Decision' ? 'bg-yellow-200 text-yellow-800' :
                'bg-gray-200 text-gray-800'
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
                className="text-sm text-blue-400 hover:text-theme-accent hover:underline focus:outline-none"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderRenewalDetailsTab = () => (
    <>
      <dl className="divide-y divide-theme-border">
        <InfoRow label="Issue Date" value={formatDate(license.issueDate)} />
        <InfoRow label="Expiry Date" value={formatDate(license.expiryDate)} />
        <InfoRow label="Next Renewal Due Date" value={formatDate(license.nextRenewalDueDate)} />
        <InfoRow label="Last Renewal Date" value={formatDate(license.lastRenewalDate)} />
        <InfoRow label="Current Renewal Cycle Status">
          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
              license.renewalStatus === "Pending Submission" || license.renewalStatus === "Requires Clarification" ? "bg-yellow-200 text-yellow-800" :
              license.renewalStatus === "Submitted" || license.renewalStatus === "Under Review" ? "bg-blue-200 text-blue-800" :
              license.renewalStatus === "Renewal Approved" ? "bg-green-200 text-green-800" :
              license.renewalStatus === "Renewal Denied" ? "bg-red-200 text-red-800" :
              "bg-gray-200 text-gray-800"
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
          <div className="bg-theme-bg p-4 rounded-md border border-theme-border">
               <div className="mb-3">
                  <label htmlFor="renewalDocIdInput" className="block text-sm font-medium text-theme-text-secondary">Add Submitted Document ID (Simulated):</label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                          type="text" id="renewalDocIdInput" value={renewalDocIdInput}
                          onChange={(e) => setRenewalDocIdInput(e.target.value)}
                          placeholder="e.g., doc_013_renewal_financials.pdf"
                          className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm bg-theme-bg border-theme-border p-2"
                      />
                      <button
                          onClick={handleAddRenewalDocumentId}
                          disabled={!renewalDocIdInput.trim()}
                          className="inline-flex items-center px-3 py-2 border border-l-0 border-theme-border bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-r-md text-sm font-medium disabled:bg-gray-800 disabled:text-gray-500"
                      > Add Doc ID </button>
                  </div>
              </div>
              {license.renewalStatus === "Pending Submission" && (
                   <button onClick={() => handleStatusUpdate("Submitted")} className="mt-4 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600">
                      Mark as All Documents Submitted
                  </button>
              )}
          </div>

          <SectionTitle title="2. Compliance History Review" />
          <div className="bg-theme-bg p-4 rounded-md border border-theme-border">
              <div className="mt-4 flex items-center">
                  <input
                      id="complianceReviewed" name="complianceReviewed" type="checkbox"
                      checked={isComplianceReviewed}
                      onChange={(e) => handleComplianceReviewToggle(e.target.checked)}
                      className="h-4 w-4 text-blue-500 bg-theme-bg border-gray-500 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="complianceReviewed" className="ml-2 block text-sm text-theme-text-primary">
                      Compliance history has been reviewed for this renewal.
                  </label>
              </div>
          </div>

          <SectionTitle title="3. Internal Review & Notes" />
          <div className="bg-theme-bg p-4 rounded-md border border-theme-border">
              <textarea
                  value={newRenewalNote} onChange={(e) => setNewRenewalNote(e.target.value)}
                  placeholder="Add internal note for this renewal cycle..."
                  rows="3"
                  className="w-full p-2 bg-theme-bg border border-theme-border rounded-md shadow-sm text-sm mb-2"
              />
              <button
                  onClick={handleAddRenewalNote} disabled={!newRenewalNote.trim()}
                  className="px-4 py-1.5 bg-gray-600 text-white text-xs font-semibold rounded-md hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-500"
              > Add Renewal Note </button>
              {license.renewalStatus === "Submitted" && isComplianceReviewed && (
                   <button onClick={() => handleStatusUpdate("Under Review")} className="mt-4 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600">
                      Move to "Under Review"
                  </button>
              )}
          </div>

          <SectionTitle title="4. Renewal Decision" />
           <div className="bg-theme-bg p-4 rounded-md border border-theme-border space-y-4">
              <div>
                <label htmlFor="newExpiryDate" className="block text-sm font-medium text-theme-text-secondary">New Expiry Date (if approving):</label>
                <input type="date" id="newExpiryDate" value={newExpiryDate} onChange={e => setNewExpiryDate(e.target.value)}
                    className="mt-1 block w-full sm:w-1/2 p-2 bg-theme-bg border border-theme-border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
              </div>
              <div>
                <label htmlFor="decisionReason" className="block text-sm font-medium text-theme-text-secondary">Decision Reason / Notes:</label>
                <textarea id="decisionReason" value={decisionReason} onChange={e => setDecisionReason(e.target.value)}
                    rows="3" className="mt-1 block w-full p-2 bg-theme-bg border border-theme-border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter reason for approval, denial, or clarification request..."/>
              </div>
              <div className="flex space-x-3">
                  <button
                      onClick={() => handleProcessDecision("Renewal Approved")}
                      disabled={!newExpiryDate || license.renewalStatus === "Renewal Approved" || license.renewalStatus === "Renewal Denied"}
                      className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed"
                  > Approve Renewal </button>
                  <button
                      onClick={() => handleProcessDecision("Renewal Denied")}
                       disabled={license.renewalStatus === "Renewal Approved" || license.renewalStatus === "Renewal Denied"}
                      className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed"
                  > Deny Renewal </button>
                   <button
                      onClick={() => handleStatusUpdate("Requires Clarification")}
                       disabled={license.renewalStatus === "Renewal Approved" || license.renewalStatus === "Renewal Denied"}
                      className="px-4 py-2 bg-yellow-500 text-black font-semibold rounded-md hover:bg-yellow-600 disabled:bg-gray-700 disabled:cursor-not-allowed"
                  > Request Clarification </button>
              </div>
          </div>
        </>
      )}
      {(license.renewalStatus === "Renewal Approved" || license.renewalStatus === "Renewal Denied") && !isLicenseSuspended && (
          <div className="mt-8 p-4 bg-theme-bg rounded-md text-center border border-theme-border">
              <p className="text-lg font-semibold text-theme-text-primary">
                  Renewal process for this license has been finalized as:
                  <span className={`ml-2 ${license.renewalStatus === "Renewal Approved" ? "text-green-400" : "text-red-400"}`}>
                      {license.renewalStatus}
                  </span>
              </p>
              <p className="text-sm text-theme-text-secondary mt-2">{license.statusReason || decisionReason}</p>
          </div>
      )}
    </>
  );

  if (isLoading) return <div className="p-6 text-center text-theme-text-secondary text-lg">Loading license renewal details...</div>;
  if (error && !license) return <div className="p-6 text-center text-red-400 bg-red-900 bg-opacity-20 rounded-md shadow">{error} <button onClick={onBackToList} className="ml-2 text-sm text-blue-400 hover:underline">Go Back</button></div>;
  if (!license) return <div className="p-6 text-center text-theme-text-secondary">License data not found. <button onClick={onBackToList} className="ml-2 text-sm text-blue-400 hover:underline">Go Back</button></div>;

  const canStartRenewal = license.licenseStatus === "Active" && license.renewalStatus === "Not Started";
  const isRenewalProcessActive = license.licenseStatus !== "Suspended" && license.renewalStatus && license.renewalStatus !== "Not Started" && license.renewalStatus !== "Renewal Approved" && license.renewalStatus !== "Renewal Denied";
  const isLicenseSuspended = license.licenseStatus === 'Suspended';

  return (
    <div className="p-4 md:p-6 bg-theme-bg min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-theme-text-primary">License Management</h1>
        {onBackToList && (
          <button onClick={onBackToList} className="text-sm text-blue-400 hover:text-theme-accent focus:outline-none">
            &larr; Back to Dashboard
          </button>
        )}
      </div>

      {error && <div className="mb-4 p-3 text-center text-red-400 bg-red-900 bg-opacity-20 rounded-md shadow">{error}</div>}

      <div className="bg-theme-bg-secondary p-6 rounded-xl shadow-lg border border-theme-border">
        <div className="border-b border-theme-border pb-4 mb-6">
          <h2 className="text-xl font-semibold text-theme-text-primary">
            License: {license.licenseNumber} <span className="text-base font-normal text-theme-text-secondary">- {entity?.companyName || license.entityId}</span>
          </h2>
          <p className="text-sm text-theme-text-secondary">Product: {product?.productName || license.productId}</p>
          <p className={`text-sm font-semibold mt-1 ${
            license.licenseStatus === 'Active' ? 'text-green-400' :
            license.licenseStatus === 'Suspended' ? 'text-orange-400' :
            'text-red-400'
          }`}>
            Current License Status: {license.licenseStatus}
            {license.licenseStatus === 'Suspended' && license.statusReason && <span className="text-xs text-theme-text-secondary italic ml-2">({license.statusReason})</span>}
          </p>
        </div>

        <div className="mb-6 border-b border-theme-border">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                <button
                    onClick={() => setActivePageTab('RENEWAL_DETAILS')}
                    className={`${activePageTab === 'RENEWAL_DETAILS' ? 'border-theme-accent text-theme-accent' : 'border-transparent text-theme-text-secondary hover:text-theme-text-primary hover:border-gray-500'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none`}
                >
                    Renewal Details
                </button>
                <button
                    onClick={() => setActivePageTab('ACTION_HISTORY')}
                    className={`${activePageTab === 'ACTION_HISTORY' ? 'border-theme-accent text-theme-accent' : 'border-transparent text-theme-text-secondary hover:text-theme-text-primary hover:border-gray-500'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none`}
                >
                    Action History
                </button>
            </nav>
        </div>

        {activePageTab === 'RENEWAL_DETAILS' && renderRenewalDetailsTab()}
        {activePageTab === 'ACTION_HISTORY' && renderActionHistoryTab()}

      </div>
    </div>
  );
};

export default LicenseRenewalPage;