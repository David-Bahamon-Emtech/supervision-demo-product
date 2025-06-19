// src/components/Reporting/EntityReportDetailPage.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getComplianceSubmissionsForEntity,
  getDocumentById,
  assignReportSectionReviewer,
  updateSectionReview,
  updateComplianceSubmissionStatus,
} from './reportingService.js';
import {
  getAllRegulatorStaff,
  getEntityById,
  getStaffById,
  getAllLicenses, // Import getAllLicenses
} from '../Licensing/licensingService.js';
// NEW: Import service to get updates
import { getAllUpdates } from '../RegulatoryUpdates/regulatoryUpdatesService.js';


// Helper to format date strings
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

// NEW: Alert Banner for Regulatory Updates
const RegulatoryUpdateAlert = ({ updates }) => {
    if (!updates || updates.length === 0) return null;

    return (
        <div className="my-6 p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-800">
            <div className="flex">
                <div className="py-1">
                    <svg className="fill-current h-6 w-6 text-blue-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M10 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16zm1 11H9v-2h2v2zm0-3H9V6h2v4z"/>
                    </svg>
                </div>
                <div>
                    <p className="font-bold">Applicable Regulatory Updates</p>
                    <p className="text-xs mt-1 mb-2">This entity may be subject to the requirements of the following published updates:</p>
                    <ul className="text-sm list-disc list-inside">
                        {updates.map(update => (
                            <li key={update.updateId}>
                                <span className="font-semibold">{update.title}</span> (Effective: {formatDate(update.effectiveDate)})
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};


// --- Reusable Minor Components ---
const InfoRow = ({ label, value }) => (
  <div className="py-1">
    <span className="text-sm font-medium text-gray-500">{label}: </span>
    <span className="text-sm text-gray-700">{value || 'N/A'}</span>
  </div>
);

const FileLink = ({ documentId, onDocumentClick }) => {
  const [doc, setDoc] = useState(null);
  useEffect(() => {
    if (documentId) {
      getDocumentById(documentId).then(setDoc);
    }
  }, [documentId]);

  if (!doc) return <div className="text-xs text-gray-400 italic">Loading document...</div>;
  return (
    <a
      href={doc.dummyFileContentLink || '#'}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
          if (onDocumentClick) {
              e.preventDefault();
              onDocumentClick(doc);
          }
      }}
      className="text-xs text-blue-500 hover:text-blue-700 hover:underline flex items-center"
      title={doc.fileName}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
      {doc.fileName} ({doc.documentType})
    </a>
  );
};

const SectionStatusBadge = ({ status }) => {
  let bgColorClass = 'bg-gray-100';
  let textColorClass = 'text-gray-700';
  switch (status) {
    case 'Compliant': bgColorClass = 'bg-green-100'; textColorClass = 'text-green-700'; break;
    case 'Non-Compliant': bgColorClass = 'bg-red-100'; textColorClass = 'text-red-700'; break;
    case 'Partially Compliant': bgColorClass = 'bg-yellow-100'; textColorClass = 'text-yellow-700'; break;
    case 'Under Review': bgColorClass = 'bg-blue-100'; textColorClass = 'text-blue-700'; break;
    case 'Pending Review': bgColorClass = 'bg-indigo-100'; textColorClass = 'text-indigo-700'; break;
    default: break;
  }
  return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${bgColorClass} ${textColorClass}`}>{status}</span>;
};

// --- Modal for Finalizing Submission Review ---
const FinalizeReviewModal = ({ submission, onSubmit, onCancel }) => {
    const [finalStatus, setFinalStatus] = useState(submission?.status || 'Reviewed - Compliant');
    const [overallNotes, setOverallNotes] = useState(submission?.overallComplianceNotes || '');

    const handleSubmit = () => {
        if (!finalStatus) {
            alert("Please select a final status.");
            return;
        }
        onSubmit(submission.submissionId, finalStatus, overallNotes);
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">Finalize Review for Submission: {submission.submissionId}</h3>
                <p className="text-sm text-gray-600 mb-1">Report: {submission.reportType.replace(/_/g, ' ')} ({submission.reportingPeriod})</p>

                <div className="my-4">
                    <label htmlFor="finalStatus" className="block text-sm font-medium text-gray-700">Final Submission Status</label>
                    <select
                        id="finalStatus"
                        value={finalStatus}
                        onChange={(e) => setFinalStatus(e.target.value)}
                        className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="Reviewed - Compliant">Reviewed - Compliant</option>
                        <option value="Reviewed - Issues Found">Reviewed - Issues Found</option>
                        <option value="Requires Clarification">Requires Clarification</option>
                    </select>
                </div>

                <div className="my-4">
                    <label htmlFor="overallNotes" className="block text-sm font-medium text-gray-700">Overall Compliance Notes</label>
                    <textarea
                        id="overallNotes"
                        rows="5"
                        value={overallNotes}
                        onChange={(e) => setOverallNotes(e.target.value)}
                        className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter final overall notes for this submission..."
                    />
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md">Cancel</button>
                    <button type="button" onClick={handleSubmit} className="px-4 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-md">Submit Final Review</button>
                </div>
            </div>
        </div>
    );
};


// --- Main Component ---
const EntityReportDetailPage = ({ entityId, onBack, currentSupervisorId = "reg_001" }) => {
  const [entity, setEntity] = useState(null);
  const [primarySupervisor, setPrimarySupervisor] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [allStaff, setAllStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSubmissionId, setExpandedSubmissionId] = useState(null);

  const [applicableUpdates, setApplicableUpdates] = useState([]);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentReviewingSection, setCurrentReviewingSection] = useState(null);
  const [sectionReviewStatus, setSectionReviewStatus] = useState('');
  const [sectionReviewNotes, setSectionReviewNotes] = useState('');

  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [submissionToFinalize, setSubmissionToFinalize] = useState(null);

  const fetchData = useCallback(async () => {
    if (!entityId) {
      setError("No Entity ID provided.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [entityData, submissionsData, staffData, allRegUpdates, allLicenses] = await Promise.all([
        getEntityById(entityId),
        getComplianceSubmissionsForEntity(entityId),
        getAllRegulatorStaff(),
        getAllUpdates(),
        getAllLicenses(),
      ]);

      if (!entityData) {
        setError(`Entity with ID ${entityId} not found.`);
        setEntity(null);
        setIsLoading(false);
        return;
      }
      setEntity(entityData);
      setSubmissions(submissionsData || []);
      setAllStaff(staffData || []);

      const entityLicenses = allLicenses.filter(lic => lic.entityId === entityId);
      const licenseTypes = [...new Set(entityLicenses.map(lic => lic.licenseType))];
      if (licenseTypes.length > 0 && allRegUpdates) {
          const relevantUpdates = allRegUpdates.filter(update =>
              update.status === 'Published' &&
              update.applicableCategories.some(catId => licenseTypes.some(lt => lt.toLowerCase().includes(catId.split('_')[1])))
          );
          setApplicableUpdates(relevantUpdates);
      }

      if (entityData.assignedOfficerId) {
        const supervisor = await getStaffById(entityData.assignedOfficerId);
        setPrimarySupervisor(supervisor);
      }

      if (submissionsData && submissionsData.length > 0 && !expandedSubmissionId) {
        setExpandedSubmissionId(submissionsData[0].submissionId);
      }

    } catch (err) {
      console.error(`Error fetching data for entity ${entityId}:`, err);
      setError(`Failed to load compliance details for this entity.`);
    } finally {
      setIsLoading(false);
    }
  }, [entityId, expandedSubmissionId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAssignSectionReviewer = async (submissionId, sectionId, newReviewerId) => {
    if (!newReviewerId) return;
    try {
      await assignReportSectionReviewer(submissionId, sectionId, newReviewerId);
      fetchData();
      alert(`Section ${sectionId.split('_').pop()} assigned to staff ID ${newReviewerId}.`);
    } catch (e) {
      alert(`Failed to assign reviewer: ${e.message}`);
    }
  };
  const openSectionReviewModal = (submissionId, section) => {
    setCurrentReviewingSection({ submissionId, ...section });
    setSectionReviewStatus(section.status || 'Pending Review');
    setSectionReviewNotes(section.reviewNotes || '');
    setShowReviewModal(true);
  };
  const handleSaveSectionReview = async () => {
    if (!currentReviewingSection || !sectionReviewStatus) {
      alert("Status is required.");
      return;
    }
    try {
      await updateSectionReview(
        currentReviewingSection.submissionId,
        currentReviewingSection.sectionId,
        sectionReviewStatus,
        sectionReviewNotes,
        currentSupervisorId
      );
      setShowReviewModal(false);
      setCurrentReviewingSection(null);
      fetchData();
      alert("Section review saved.");
    } catch(e) {
      alert(`Failed to save section review: ${e.message}`);
    }
  };
  const openFinalizeReviewModal = (submission) => {
    setSubmissionToFinalize(submission);
    setShowFinalizeModal(true);
  };
  const handleFinalizeSubmissionReview = async (submissionId, finalStatus, overallNotes) => {
    try {
        await updateComplianceSubmissionStatus(submissionId, finalStatus, overallNotes);
        setShowFinalizeModal(false);
        setSubmissionToFinalize(null);
        fetchData();
        alert(`Submission ${submissionId} review finalized with status: ${finalStatus}.`);
    } catch(e) {
        alert(`Failed to finalize submission review: ${e.message}`);
    }
  };


  if (isLoading) {
    return <div className="p-6 text-center text-gray-600 text-lg">Loading entity compliance details...</div>;
  }
  if (error) {
    return <div className="p-6 text-center text-red-700 bg-red-100 rounded-md shadow">{error}</div>;
  }
  if (!entity) {
    return (
      <div className="p-6 text-center text-gray-500">
        Entity data not available.
        <button onClick={onBack} className="ml-4 text-blue-600 hover:underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="mb-4 px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-500 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        >
          &larr; Back to Category Reports
        </button>
        <h1 className="text-3xl font-bold text-gray-800">{entity.companyName}</h1>
        <p className="text-gray-600 mt-1">Compliance Report Details</p>
      </div>
      
      <RegulatoryUpdateAlert updates={applicableUpdates} />

      <div className="mb-8 p-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Entity Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <InfoRow label="Legal Name" value={entity.legalName} />
          <InfoRow label="Registration No." value={entity.registrationNumber} />
          <InfoRow label="Primary Supervisor" value={primarySupervisor?.name || entity.assignedOfficerId || 'N/A'} />
          <InfoRow label="Compliance Readiness" value={entity.complianceReadinessStatus || 'Unknown'} />
        </div>
      </div>

      <div className="mb-8 p-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Compliance Data Visualization</h2>
        <div className="text-center text-gray-500 italic py-8">
          (Placeholder: Charts and key data visualizations for this entity's reporting history would appear here.)
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Compliance Submissions</h2>
        {submissions.length > 0 ? (
          <div className="space-y-6">
            {submissions.map(submission => {
              const isSubmissionSupervisor = currentSupervisorId === submission.assignedSupervisorId;
              const canFinalize = isSubmissionSupervisor && (submission.status === 'Under Review' || submission.status === 'Submitted' || submission.status === 'Requires Clarification');
              const allSectionsReviewed = submission.sections.every(s => s.status === 'Compliant' || s.status === 'Non-Compliant' || s.status === 'Partially Compliant' || s.status === 'Not Applicable');

              return (
                <div key={submission.submissionId} className="bg-white shadow-xl rounded-lg">
                  <button
                    onClick={() => setExpandedSubmissionId(expandedSubmissionId === submission.submissionId ? null : submission.submissionId)}
                    className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-t-lg focus:outline-none flex justify-between items-center"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-blue-700">{submission.reportType.replace(/_/g, ' ')} - {submission.reportingPeriod}</h3>
                      <p className="text-xs text-gray-500">Submitted: {formatDate(submission.submissionDate)} | Status: <span className="font-medium">{submission.status}</span></p>
                    </div>
                    <svg className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${expandedSubmissionId === submission.submissionId ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>

                  {expandedSubmissionId === submission.submissionId && (
                    <div className="p-4 md:p-6 border-t border-gray-200">
                      <InfoRow label="Due Date" value={formatDate(submission.dueDate)} />
                      <InfoRow label="Primary Supervisor (Submission)" value={allStaff.find(s => s.staffId === submission.assignedSupervisorId)?.name || submission.assignedSupervisorId} />
                      <InfoRow label="Review Due Date" value={formatDate(submission.reviewDueDate)} />

                      <h4 className="text-md font-semibold text-gray-600 mt-4 mb-2">Overall Notes:</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md whitespace-pre-wrap">{submission.overallComplianceNotes || 'No overall notes.'}</p>

                      <h4 className="text-md font-semibold text-gray-600 mt-4 mb-2">General Attachments:</h4>
                      {submission.attachments && submission.attachments.length > 0 ? (
                        <ul className="list-none space-y-1 mb-3">
                          {submission.attachments.map(docId => <li key={docId}><FileLink documentId={docId} /></li>)}
                        </ul>
                      ) : <p className="text-sm text-gray-500 italic">No general attachments for this submission.</p>}

                      <h4 className="text-md font-semibold text-gray-600 mt-6 mb-3">Report Sections:</h4>
                      <div className="space-y-4">
                        {submission.sections.map(section => (
                           <div key={section.sectionId} className="p-3 border rounded-md bg-white">
                            <div className="flex justify-between items-start mb-1">
                                <h5 className="font-medium text-gray-800">{section.sectionName}</h5>
                                <SectionStatusBadge status={section.status} />
                            </div>
                            <p className="text-xs text-gray-500 mb-1">Assigned Reviewer: {allStaff.find(s => s.staffId === section.assignedReviewerId)?.name || section.assignedReviewerId || 'Not Assigned'}</p>
                            <p className="text-xs text-gray-500 mb-2">Last Reviewed: {formatDate(section.reviewDate) || 'N/A'}</p>
                            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded whitespace-pre-wrap text-xs">{section.reviewNotes || 'No review notes for this section.'}</p>

                            {section.sectionAttachments && section.sectionAttachments.length > 0 && (
                                <div className="mt-2">
                                    <p className="text-xs font-semibold text-gray-500 mb-0.5">Section Attachments:</p>
                                    <ul className="list-none space-y-0.5">
                                        {section.sectionAttachments.map(docId => <li key={docId}><FileLink documentId={docId} /></li>)}
                                    </ul>
                                </div>
                            )}

                            {isSubmissionSupervisor && (
                                <div className="mt-3 pt-3 border-t border-gray-200 flex items-center space-x-2">
                                <select
                                    defaultValue={section.assignedReviewerId || ""}
                                    onChange={(e) => handleAssignSectionReviewer(submission.submissionId, section.sectionId, e.target.value)}
                                    className="text-xs p-1 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    title="Delegate Section Review"
                                >
                                    <option value="" disabled>Delegate to...</option>
                                    {allStaff.map(staff => (
                                    <option key={staff.staffId} value={staff.staffId}>
                                        {staff.name} ({staff.role.substring(0,15)})
                                    </option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => openSectionReviewModal(submission.submissionId, section)}
                                    className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Review Section
                                </button>
                                </div>
                            )}
                            </div>
                        ))}
                      </div>
                        {canFinalize && (
                            <div className="mt-6 pt-4 border-t border-gray-200 text-right">
                                <button
                                    onClick={() => openFinalizeReviewModal(submission)}
                                    disabled={!allSectionsReviewed && submission.status !== 'Requires Clarification'}
                                    className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 disabled:opacity-50"
                                    title={(!allSectionsReviewed && submission.status !== 'Requires Clarification') ? "All sections must be reviewed first, or status must be 'Requires Clarification'" : "Finalize this submission's review"}
                                >
                                    Finalize Submission Review
                                </button>
                            </div>
                        )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-500 italic">No compliance submissions found for this entity.</p>
          </div>
        )}
      </div>

      {showReviewModal && currentReviewingSection && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Review Section: {currentReviewingSection.sectionName}</h3>
            <div className="mb-4">
              <label htmlFor="sectionStatus" className="block text-sm font-medium text-gray-700">Status</label>
              <select
                id="sectionStatus"
                value={sectionReviewStatus}
                onChange={(e) => setSectionReviewStatus(e.target.value)}
                className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                {['Pending Review', 'Under Review', 'Compliant', 'Non-Compliant', 'Partially Compliant', 'Not Applicable'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="sectionNotes" className="block text-sm font-medium text-gray-700">Review Notes</label>
              <textarea
                id="sectionNotes"
                rows="4"
                value={sectionReviewNotes}
                onChange={(e) => setSectionReviewNotes(e.target.value)}
                className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your review notes for this section..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowReviewModal(false)} className="px-4 py-2 text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md">Cancel</button>
              <button onClick={handleSaveSectionReview} className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md">Save Review</button>
            </div>
          </div>
        </div>
      )}

      {showFinalizeModal && submissionToFinalize && (
          <FinalizeReviewModal
            submission={submissionToFinalize}
            onSubmit={handleFinalizeSubmissionReview}
            onCancel={() => {
                setShowFinalizeModal(false);
                setSubmissionToFinalize(null);
            }}
          />
      )}

    </div>
  );
};

export default EntityReportDetailPage;