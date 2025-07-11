// src/components/Licensing/ApplicationDetailPage.jsx

import React, { useEffect, useState, useMemo } from 'react';
import {
  getApplicationById,
  getEntityById,
  getProductById,
  getStaffById,
  getDocumentById,
  getLicenseById,
  getAllRegulatorStaff,
  updateAssignedReviewer,
  addAdditionalReviewer,
  removeAdditionalReviewer,
  addGeneralNoteToApplication,
  updateApplicationStatus,
} from './licensingService';
import { getAllContent } from '../RegulatoryUpdates/regulatoryUpdatesService.js';


// --- Helper Components & Minor Components ---
const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return 'N/A';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
    options.second = '2-digit';
  }
  return date.toLocaleDateString(undefined, options);
};

const RegulatoryUpdateAlert = ({ updates }) => {
    if (!updates || updates.length === 0) return null;

    return (
        <div className="my-4 p-4 bg-blue-900 bg-opacity-30 border-l-4 border-blue-500 text-blue-200">
            <div className="flex">
                <div className="py-1">
                    <svg className="fill-current h-6 w-6 text-blue-400 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M10 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16zm1 11H9v-2h2v2zm0-3H9V6h2v4z"/>
                    </svg>
                </div>
                <div>
                    <p className="font-bold text-theme-text-primary">Applicable Regulatory Updates</p>
                    <ul className="text-sm list-disc list-inside mt-1">
                        {updates.map(update => (
                            <li key={update.id}>
                                <span className="font-semibold">{update.title}</span> (Effective: {formatDate(update.effectiveDate)})
                            </li>
                        ))}
                    </ul>
                    <p className="text-xs mt-2">Note: This application must be assessed against the requirements of the update(s) listed above.</p>
                </div>
            </div>
        </div>
    );
};


const calculateDurationInDays = (submissionDateString) => {
  if (!submissionDateString) return 'N/A';
  const submissionDate = new Date(submissionDateString);
  const today = new Date();

  if (isNaN(submissionDate.getTime())) return 'Invalid Date';
  if (submissionDate > today) return 'Upcoming';

  const differenceInTime = today.getTime() - submissionDate.getTime();
  const differenceInDays = Math.max(0, Math.floor(differenceInTime / (1000 * 3600 * 24)));
  return `${differenceInDays} Day${differenceInDays === 1 ? '' : 's'}`;
};

const generateRating = (status) => {
  let rating;
  if (!status) return 'N/A';
  if (status === 'Denied') {
    rating = Math.random() * (1.9 - 0.5) + 0.5;
  } else if (status === 'Approved') {
    rating = Math.random() * (5.0 - 3.6) + 3.6;
  } else {
    rating = Math.random() * (5.0 - 1.0) + 1.0;
  }
  return `${rating.toFixed(1)} / 5`;
};

const StatusBadge = ({ status }) => {
  let dotColorClass = 'bg-gray-400';
  let textColorClass = 'text-gray-400';
  switch (status) {
    case 'Approved': dotColorClass = 'bg-green-500'; textColorClass = 'text-green-400'; break;
    case 'Denied': dotColorClass = 'bg-red-500'; textColorClass = 'text-red-400'; break;
    case 'In Review': case 'Initial Review': case 'Detailed Review': case 'Awaiting Decision':
      dotColorClass = 'bg-yellow-400'; textColorClass = 'text-yellow-300'; break;
    case 'Submitted': dotColorClass = 'bg-blue-400'; textColorClass = 'text-blue-300'; break;
    default: textColorClass = 'text-gray-400'; break;
  }
  return (
    <div className="flex items-center">
      <span className={`h-2 w-2 rounded-full ${dotColorClass} mr-2`}></span>
      <span className={`text-sm font-medium ${textColorClass}`}>{status || 'Unknown'}</span>
    </div>
  );
};

const FileLink = ({ fileName, href, documentType }) => (
  <div className="py-1">
    <a href={href || '#'} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-theme-accent hover:underline flex items-center group">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-theme-text-secondary group-hover:text-theme-accent transition-colors duration-150 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span className="truncate" title={fileName}>{fileName || 'Unnamed Document'}</span>
      {documentType && <span className="ml-2 text-xs text-theme-text-secondary group-hover:text-theme-text-primary">({documentType})</span>}
    </a>
  </div>
);

const InfoRow = ({ label, value, isHtml = false, className = "" }) => (
  <div className={`mb-4 ${className}`}>
    <p className="text-xs text-theme-text-secondary uppercase tracking-wider">{label}</p>
    {isHtml ? (
         <div className="text-sm text-theme-text-primary break-words" dangerouslySetInnerHTML={{ __html: value || 'N/A' }} />
    ) : (
        <p className="text-sm text-theme-text-primary break-words">{value || 'N/A'}</p>
    )}
  </div>
);

const SubSectionTitle = ({ title }) => (
    <h3 className="text-md font-semibold text-theme-text-primary mt-6 mb-3 border-b border-theme-border pb-1">{title}</h3>
);

const KycCheckModal = ({ targetName, isChecking, kycCheckDisplayData, onClose }) => {
    const kycFields = [
        { label: "Overall Status", value: kycCheckDisplayData?.overallStatus },
        { label: "Date of Check", value: kycCheckDisplayData?.checkDate ? formatDate(kycCheckDisplayData.checkDate, true) : "N/A" },
        { label: "OFAC Sanctions List", value: kycCheckDisplayData?.listResults?.ofac },
        { label: "UN Sanctions List", value: kycCheckDisplayData?.listResults?.un },
        { label: "EU Sanctions List", value: kycCheckDisplayData?.listResults?.eu },
        { label: "Interpol Watchlist", value: kycCheckDisplayData?.listResults?.interpol },
        { label: "Local List A", value: kycCheckDisplayData?.listResults?.localA },
        { label: "Local List B (PEP)", value: kycCheckDisplayData?.listResults?.localB_pep },
        { label: "Adverse Media Check", value: kycCheckDisplayData?.listResults?.adverseMedia },
        { label: "Summary Notes", value: kycCheckDisplayData?.summaryNotes },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center px-4">
            <div className="bg-theme-bg-secondary p-6 rounded-lg shadow-xl w-full max-w-lg border border-theme-border">
                <h4 className="text-xl font-semibold mb-1 text-theme-text-primary">KYC Check Simulation</h4>
                <p className="text-sm text-theme-text-secondary mb-4">For: <span className="font-medium text-theme-text-primary">{targetName || "Selected Contact"}</span></p>

                {isChecking && (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
                        <p className="mt-3 text-theme-text-secondary">Performing simulated KYC checks...</p>
                        <p className="text-xs text-gray-500">(OFAC, UN, EU, Interpol, Local Lists, Adverse Media)</p>
                    </div>
                )}

                {!isChecking && kycCheckDisplayData && (
                    <div className="space-y-3 text-sm">
                        {kycFields.map(field => (
                            <div key={field.label} className="flex justify-between border-b border-theme-border pb-1.5">
                                <span className="font-medium text-theme-text-secondary">{field.label}:</span>
                                <span className="text-theme-text-primary ml-2 text-right">{field.value || "Data captured from KYC check"}</span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        {isChecking ? "Cancel" : "Acknowledge & Close"}
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Main Page Component ---
const ApplicationDetailPage = ({ applicationId, onBackToList }) => {
  const [application, setApplication] = useState(null);
  const [entity, setEntity] = useState(null);
  const [product, setProduct] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [reviewer, setReviewer] = useState(null);
  const [sanctionAdjudicator, setSanctionAdjudicator] = useState(null);
  const [licenseDetails, setLicenseDetails] = useState(null);
  const [allStaff, setAllStaff] = useState([]);
  const [additionalReviewersDetails, setAdditionalReviewersDetails] = useState([]);
  const [applicableUpdates, setApplicableUpdates] = useState([]);
  const [newNoteText, setNewNoteText] = useState("");
  const [showKycModal, setShowKycModal] = useState(false);
  const [kycTargetName, setKycTargetName] = useState("");
  const [isKycChecking, setIsKycChecking] = useState(false);
  const [kycCheckDisplayData, setKycCheckDisplayData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState('LICENSE APPLICATION DETAILS');
  const [activeDetailSection, setActiveDetailSection] = useState('ENTITY INFO');
  const [selectedNextStatus, setSelectedNextStatus] = useState('');
  const [decisionNotesInput, setDecisionNotesInput] = useState('');

  const detailSections = useMemo(() => [
    "ENTITY INFO", "PRODUCT, SERVICE OR SOLUTION", "FINANCIAL INFORMATION",
    "AML PLAN", "CYBERSECURITY PLAN", "OPEN BANKING PLAN",
    "RISK MANAGEMENT PLAN", "TESTING PLAN WHILE IN THE SANDBOX"
  ], []);

  const fetchApplicationData = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const appData = await getApplicationById(id);
      if (!appData) {
        setError(`Application with ID ${id} not found.`);
        setApplication(null); setEntity(null); setProduct(null);
        setIsLoading(false); return;
      }

      const entityData = await getEntityById(appData.entityId);

      if (appData.sanctionScreening?.screenedParties && entityData) {
        const individualsMap = new Map();
        if (entityData.primaryContact) {
            individualsMap.set(entityData.primaryContact.contactId, entityData.primaryContact.fullName);
        }
        (entityData.directors || []).forEach(dir => {
            individualsMap.set(dir.contactId, dir.fullName);
        });
        (entityData.ubos || []).forEach(ubo => {
            individualsMap.set(ubo.contactId, ubo.fullName);
        });

        appData.sanctionScreening.screenedParties = appData.sanctionScreening.screenedParties.map(party => {
            let foundName = individualsMap.get(party.partyId);
            if (!foundName) {
                if (party.partyName.toLowerCase().includes('director') && entityData.directors.length > 0) {
                    foundName = entityData.directors[0]?.fullName;
                } else if (party.partyName.toLowerCase().includes('ubo') && entityData.ubos.length > 0) {
                    foundName = entityData.ubos[0]?.fullName;
                }
            }
            return {
                ...party,
                partyName: foundName || party.partyName,
            };
        });
      }

      setApplication(appData);
      setSelectedNextStatus('');
      setDecisionNotesInput(appData.decisionReason || '');

      const allContent = await getAllContent();
      const productData = await getProductById(appData.productId);

      if (productData && allContent) {
          const relevantUpdates = allContent.filter(content =>
              content.contentType === 'Update' &&
              content.status === 'Published' &&
              content.applicableCategories.some(catId => productData.licenseTypeRequired.toLowerCase().includes(catId.split('_')[1]))
          );
          setApplicableUpdates(relevantUpdates);
      }

      const [
        reviewerData, sanctionAdjData, licData, staffData, ...docsDataResults
      ] = await Promise.allSettled([
        appData.assignedReviewerId ? getStaffById(appData.assignedReviewerId) : Promise.resolve(null),
        appData.sanctionScreening?.adjudicatedByStaffId ? getStaffById(appData.sanctionScreening.adjudicatedByStaffId) : Promise.resolve(null),
        (appData.applicationStatus === 'Approved' && appData.effectiveLicenseId) ? getLicenseById(appData.effectiveLicenseId) : Promise.resolve(null),
        getAllRegulatorStaff(),
        ...(appData.supportingDocumentIds && appData.supportingDocumentIds.length > 0 ? appData.supportingDocumentIds.map(docId => getDocumentById(docId)) : [])
      ]);

      setEntity(entityData);
      setProduct(productData);
      setReviewer(reviewerData.status === 'fulfilled' ? reviewerData.value : null);
      setSanctionAdjudicator(sanctionAdjData.status === 'fulfilled' ? sanctionAdjData.value : null);
      setLicenseDetails(licData.status === 'fulfilled' ? licData.value : null);
      setAllStaff(staffData.status === 'fulfilled' ? (staffData.value || []) : []);
      setDocuments(docsDataResults.map(r => r.status === 'fulfilled' ? r.value : null).filter(doc => doc !== null));

      if (appData.additionalReviewerIds && appData.additionalReviewerIds.length > 0) {
        const adHocReviewerDetails = await Promise.all(appData.additionalReviewerIds.map(staffId => getStaffById(staffId)));
        setAdditionalReviewersDetails(adHocReviewerDetails.filter(staff => staff !== null));
      } else {
        setAdditionalReviewersDetails([]);
      }
      if (!entityData || !productData) {
        console.error("Critical entity or product data missing after fetch.");
        setError("Could not load all essential application details (entity or product missing).");
      }
    } catch (err) {
      console.error("Error fetching application details:", err);
      setError("Failed to load application details. " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (applicationId) {
      fetchApplicationData(applicationId);
    } else {
      setError("No Application ID provided.");
      setApplication(null);
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);

  const handleRefreshApplicationData = () => {
    if (applicationId) fetchApplicationData(applicationId);
  };

  const handleAddNote = async () => {
    if (!newNoteText.trim() || !application) return;
    try {
      await addGeneralNoteToApplication(application.applicationId, newNoteText.trim());
      setNewNoteText("");
      handleRefreshApplicationData();
    } catch (error) {
      console.error("Failed to add note:", error);
      alert("Failed to add note: " + error.message);
    }
  };

  const handleNextSection = () => {
    const currentIndex = detailSections.indexOf(activeDetailSection);
    if (currentIndex < detailSections.length - 1) {
      setActiveDetailSection(detailSections[currentIndex + 1]);
    }
  };
  const isLastSection = detailSections.indexOf(activeDetailSection) === detailSections.length - 1;

  const handlePerformKycCheck = (party) => {
    if (!party) return;
    setKycTargetName(party.partyName || "Selected Party");
    setShowKycModal(true);
    setIsKycChecking(true);
    setKycCheckDisplayData(null);

    setTimeout(() => {
        const dummyData = {
            checkDate: new Date().toISOString(),
            overallStatus: ["Clear", "Potential Match", "Adverse Media Found", "PEP Identified"][Math.floor(Math.random() * 4)],
            listResults: {
                ofac: "Clear",
                un: "Clear",
                eu: "Clear",
                interpol: "Clear",
                localA: "Clear",
                localB_pep: "No Match",
                adverseMedia: "No Significant Findings",
            },
            summaryNotes: "This is a simulated KYC check. All detailed findings would appear here.",
        };
        setKycCheckDisplayData(dummyData);
        setIsKycChecking(false);
    }, 2000);
  };

  const applicationWorkflow = {
    "Submitted": ["Initial Review", "Request Clarification", "Deny Application"],
    "Initial Review": ["Detailed Review", "Request Clarification", "Deny Application"],
    "Detailed Review": ["Awaiting Decision", "Request Clarification", "Deny Application"],
    "Request Clarification": ["Submitted", "Initial Review", "Detailed Review"],
    "Awaiting Decision": ["Approved", "Denied"],
  };

  const availableNextStatuses = useMemo(() => {
    if (!application || !application.applicationStatus) return [];
    return applicationWorkflow[application.applicationStatus] || [];
  }, [application, applicationWorkflow]);

  const handleProgressApplicationStep = async () => {
    if (!application || !selectedNextStatus) {
      alert("Please select a next step for the application.");
      return;
    }
    if ((selectedNextStatus === "Approved" || selectedNextStatus === "Denied") && !decisionNotesInput.trim()) {
        alert("Decision notes are required for approving or denying an application.");
        return;
    }

    setIsProcessingAction(true);
    setError(null);
    try {
      await updateApplicationStatus(application.applicationId, selectedNextStatus, decisionNotesInput.trim());
      alert(`Application status successfully updated to ${selectedNextStatus}.`);
      handleRefreshApplicationData();
    } catch (err) {
      console.error("Error progressing application:", err);
      setError("Failed to update application status: " + err.message);
    } finally {
      setIsProcessingAction(false);
    }
  };


  const headerData = useMemo(() => {
    if (!application || !entity || !product) return null;
    return {
      companyName: entity.companyName,
      service: product.licenseTypeRequired,
      productName: product.productName,
      submittedOn: formatDate(application.submissionDate),
      rating: generateRating(application.applicationStatus),
      duration: calculateDurationInDays(application.submissionDate),
      status: application.applicationStatus,
    };
  }, [application, entity, product]);

  const renderFitAndProperCheckTab = () => {
    if (!application) return <p className="text-theme-text-secondary">Application data not loaded.</p>;

    return (
      <div className="space-y-6">
        <SubSectionTitle title="Sanction Screening Details" />
        {application.sanctionScreening ? (
          <div className="space-y-3">
            <InfoRow label="Overall Screening Status" value={application.sanctionScreening.overallScreeningStatus} />
            <InfoRow label="Last Screening Date" value={formatDate(application.sanctionScreening.lastScreeningDate)} />
            <InfoRow
              label="Adjudicated By"
              value={
                application.sanctionScreening.adjudicatedByStaffId
                ? (sanctionAdjudicator ? `${sanctionAdjudicator.name} (${sanctionAdjudicator.role || 'N/A'})` : application.sanctionScreening.adjudicatedByStaffId)
                : 'N/A'
              }
            />
            <InfoRow label="Adjudication Notes" value={application.sanctionScreening.adjudicationNotes} />
            <h4 className="text-sm font-semibold text-theme-text-secondary pt-2">Screened Parties:</h4>
            {application.sanctionScreening.screenedParties && application.sanctionScreening.screenedParties.length > 0 ? (
              <ul className="list-none pl-0 space-y-2">
                {application.sanctionScreening.screenedParties.map((party, index) => (
                  <li key={party.partyId || index} className="p-3 bg-theme-bg rounded-md border border-theme-border">
                    <div className="flex justify-between items-start">
                      <div>
                        <strong className="text-theme-text-primary">{party.partyName || 'Unknown Party'}</strong>
                        <br />
                        <span className="text-theme-text-secondary">Result: </span>
                        <span className={`font-medium ${party.screeningResult === 'Clear' ? 'text-green-400' : party.screeningResult === 'Potential Match Found' ? 'text-red-400' : 'text-yellow-400'}`}>{party.screeningResult}</span>
                        {party.matchDetails && <p className="text-xs italic text-theme-text-secondary pl-2">Match Details: {party.matchDetails}</p>}
                        {party.listsChecked && party.listsChecked.length > 0 && <p className="text-xs text-theme-text-secondary pl-2">Lists Checked: {party.listsChecked.join(', ')}</p>}
                      </div>
                      <button
                        onClick={() => handlePerformKycCheck(party)}
                        className="ml-4 mt-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-bg-secondary focus:ring-blue-500 whitespace-nowrap"
                      >
                        Perform KYC Check
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-theme-text-secondary">No parties listed for screening.</p>}
          </div>
        ) : <p className="text-sm text-theme-text-secondary">No sanction screening information available.</p>}
      </div>
    );
  };

  const renderEntityInfo = () => {
    if (!entity) return <p className="text-theme-text-secondary">Entity information not available.</p>;
    const corporateDocs = documents.filter(doc => doc.documentType === "Certificate of Incorporation" || (doc.fileName && doc.fileName.toLowerCase().includes('certificate')));
    const boardDocs = documents.filter(doc => doc.documentType === "Board Resolution" || (doc.fileName && doc.fileName.toLowerCase().includes('board')));
    return (
      <div>
        <h2 className="text-xl font-semibold text-theme-text-primary mb-6">Entity Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <InfoRow label="Company Name" value={entity.companyName} />
            <InfoRow label="Legal Name" value={entity.legalName} />
        </div>
        <InfoRow label="Primary Address" value={entity.primaryAddress} />
        <InfoRow label="Website/URI" value={entity.website ? `<a href="${entity.website.startsWith('http') ? entity.website : `//${entity.website}`}" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-theme-accent">${entity.website}</a>` : 'N/A'} isHtml={!!entity.website}/>

        <SubSectionTitle title="Primary Contact" />
        <div className="flex justify-between items-start">
            <div className="flex-grow">
                <InfoRow label="Name" value={entity.primaryContact?.fullName} className="mb-1" />
                <InfoRow label="Email" value={entity.primaryContact?.email} className="mb-1" />
                <InfoRow label="Phone" value={entity.primaryContact?.phone} className="mb-1" />
                <InfoRow label="Position" value={entity.primaryContact?.position} className="mb-1" />
            </div>
        </div>


        <SubSectionTitle title="Corporate Documents" />
        {corporateDocs.length > 0 ? corporateDocs.map(doc => (
          <FileLink key={doc.documentId} fileName={doc.fileName} href={doc.dummyFileContentLink} documentType={doc.documentType} />
        )) : <p className="text-sm text-theme-text-secondary py-1">No specific corporate documents found.</p>}

        <SubSectionTitle title="Board Structure / Resolutions" />
        {boardDocs.length > 0 ? boardDocs.map(doc => (
          <FileLink key={doc.documentId} fileName={doc.fileName} href={doc.dummyFileContentLink} documentType={doc.documentType} />
        )) : <p className="text-sm text-theme-text-secondary py-1">No board structure documents found.</p>}

        {entity.directors && entity.directors.length > 0 && (
            <>
                <SubSectionTitle title="Directors" />
                <ul className="list-disc pl-5 space-y-1 text-sm text-theme-text-primary">
                    {entity.directors.map(d => <li key={d.contactId || d.fullName}>{d.fullName} ({d.role || 'Director'})</li>)}
                </ul>
            </>
        )}
        {entity.ubos && entity.ubos.length > 0 && (
             <>
                <SubSectionTitle title="Ultimate Beneficial Owners (UBOs)" />
                <ul className="list-disc list-inside space-y-1 text-sm text-theme-text-primary">
                    {entity.ubos.map(ubo => <li key={ubo.contactId || ubo.fullName}>{ubo.fullName} ({ubo.ownershipPercentage ? `${ubo.ownershipPercentage}%` : 'Ownership Not Specified'})</li>)}
                </ul>
            </>
        )}
      </div>
    );
  };
  const renderProductServiceSolution = () => {
    if (!product) return <p className="text-theme-text-secondary">Product information not available.</p>;
    return (
      <div>
        <h2 className="text-xl font-semibold text-theme-text-primary mb-6">Product, Service, or Solution</h2>
        <InfoRow label="Product Name" value={product.productName} />
        <InfoRow label="Description" value={product.description} />
        <InfoRow label="License Type Required by Product" value={product.licenseTypeRequired} />
      </div>
    );
  };
  const renderFinancialInformation = () => {
    const financialDocs = documents.filter(doc =>
      ["Financial Projections", "Financial Statements", "Proof of Funds", "Bank Statement"].includes(doc.documentType) ||
      (doc.fileName && (doc.fileName.toLowerCase().includes('financial') || doc.fileName.toLowerCase().includes('bank_statement')))
    );
    return (
      <div>
        <h2 className="text-xl font-semibold text-theme-text-primary mb-6">Financial Information</h2>
        {financialDocs.length > 0 ? financialDocs.map(doc => (
          <FileLink key={doc.documentId} fileName={doc.fileName} href={doc.dummyFileContentLink} documentType={doc.documentType} />
        )) : <p className="text-sm text-theme-text-secondary py-1">No financial documents found.</p>}
      </div>
    );
  };
  const renderAmlPlan = () => {
    const amlDocs = documents.filter(doc =>
      doc.documentType === "AML/CFT Policy" ||
      (doc.fileName && doc.fileName.toLowerCase().includes('aml'))
    );
    return (
      <div>
        <h2 className="text-xl font-semibold text-theme-text-primary mb-6">AML Plan</h2>
        {amlDocs.length > 0 ? amlDocs.map(doc => (
          <FileLink key={doc.documentId} fileName={doc.fileName} href={doc.dummyFileContentLink} documentType={doc.documentType} />
        )) : <p className="text-sm text-theme-text-secondary py-1">No AML Plan documents found.</p>}
      </div>
    );
  };
  const renderCybersecurityPlan = () => {
    const securityDocs = documents.filter(doc =>
      ["Incident Response Plan", "Data Privacy Policy", "System Architecture Diagram"].includes(doc.documentType) ||
      (doc.fileName && (doc.fileName.toLowerCase().includes('security') || doc.fileName.toLowerCase().includes('privacy') || doc.fileName.toLowerCase().includes('architecture')))
    );
    return (
      <div>
        <h2 className="text-xl font-semibold text-theme-text-primary mb-6">Cybersecurity Plan</h2>
        {securityDocs.length > 0 ? securityDocs.map(doc => (
          <FileLink key={doc.documentId} fileName={doc.fileName} href={doc.dummyFileContentLink} documentType={doc.documentType} />
        )) : <p className="text-sm text-theme-text-secondary py-1">No cybersecurity-related documents found.</p>}
      </div>
    );
  };
  const renderGenericSection = (sectionTitle) => {
    const sectionKeywords = sectionTitle.toLowerCase().split(' ').filter(k => k.length > 2);
    const relevantDocs = documents.filter(doc => {
        const docTypeLower = doc.documentType?.toLowerCase();
        const fileNameLower = doc.fileName?.toLowerCase();
        return sectionKeywords.some(keyword =>
            (docTypeLower && docTypeLower.includes(keyword)) ||
            (fileNameLower && fileNameLower.includes(keyword))
        );
    });
     return (
        <div>
            <h2 className="text-xl font-semibold text-theme-text-primary mb-6">{sectionTitle}</h2>
            {relevantDocs.length > 0 ? relevantDocs.map(doc => (
                <FileLink key={doc.documentId} fileName={doc.fileName} href={doc.dummyFileContentLink} documentType={doc.documentType}/>
            )) : <p className="text-sm text-theme-text-secondary py-1">No specific documents found for "{sectionTitle}".</p>}
             <p className="text-xs text-theme-text-secondary mt-4 italic">Further details or specific data for this section would be displayed here if available in the application data model.</p>
        </div>
    );
  };

  const renderLicenseApplicationReviewTab = () => {
    if (!application) return <p className="text-theme-text-secondary">Application data not loaded.</p>;

    const isActionableStatus = application && applicationWorkflow[application.applicationStatus];

    return (
      <div className="space-y-6">
        <div>
          <SubSectionTitle title="Review Assignment" />
          <InfoRow label="Lead Reviewer" value={reviewer ? `${reviewer.name} (${reviewer.role || 'N/A'})` : application.assignedReviewerId || 'Not Assigned'} />
          <button
            onClick={() => {}}
            className="mt-1 mb-3 text-sm text-blue-400 hover:text-theme-accent focus:outline-none"
            disabled={isProcessingAction}
          >
            {reviewer ? 'Change Lead Reviewer' : 'Assign Lead Reviewer'}
          </button>
        </div>
        <div>
          <SubSectionTitle title="Risk Assessment Summary" />
          <InfoRow label="Internal Risk Rating (Entity)" value={entity?.internalRiskRating || 'N/A'} />
          <p className="text-theme-text-secondary italic text-sm mt-2">(Placeholder for application risk summary)</p>
        </div>

        {isActionableStatus && (
            <div className="mt-6 pt-6 border-t border-theme-border">
                <SubSectionTitle title="Progress Application Workflow" />
                <div className="space-y-4 max-w-xl">
                    <div>
                        <label htmlFor="nextStatus" className="block text-sm font-medium text-theme-text-secondary">
                            Next Step / Decision <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="nextStatus"
                            value={selectedNextStatus}
                            onChange={(e) => setSelectedNextStatus(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-theme-bg border-theme-border focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            disabled={isProcessingAction}
                        >
                            <option value="">-- Select Action --</option>
                            {availableNextStatuses.map(statusOpt => (
                                <option key={statusOpt} value={statusOpt}>{statusOpt}</option>
                            ))}
                        </select>
                    </div>
                    {(selectedNextStatus === "Approved" || selectedNextStatus === "Denied" || selectedNextStatus.includes("Clarification") || selectedNextStatus.includes("Deny")) && (
                        <div>
                            <label htmlFor="decisionNotesInput" className="block text-sm font-medium text-theme-text-secondary">
                                Notes / Reason { (selectedNextStatus === "Approved" || selectedNextStatus === "Denied") && <span className="text-red-500">*</span>}
                            </label>
                            <textarea
                                id="decisionNotesInput"
                                value={decisionNotesInput}
                                onChange={(e) => setDecisionNotesInput(e.target.value)}
                                rows="3"
                                className="mt-1 block w-full p-2 bg-theme-bg border border-theme-border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Provide notes for the decision or clarification request..."
                                disabled={isProcessingAction}
                            />
                        </div>
                    )}
                    <button
                        onClick={handleProgressApplicationStep}
                        disabled={isProcessingAction || !selectedNextStatus ||
                                  ((selectedNextStatus === "Approved" || selectedNextStatus === "Denied") && !decisionNotesInput.trim())}
                        className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-bg-secondary focus:ring-blue-500 disabled:opacity-50"
                    >
                        {isProcessingAction ? 'Processing...' : 'Process Step'}
                    </button>
                </div>
            </div>
        )}

        {application.decision && (
            <div className="mt-6 pt-6 border-t border-theme-border">
                <SubSectionTitle title="Final Decision Information" />
                <InfoRow label="Decision" value={application.decision} />
                <InfoRow label="Decision Date" value={formatDate(application.decisionDate)} />
                <InfoRow label="Decision Reason" value={application.decisionReason} />
                {licenseDetails && (
                    <>
                        <InfoRow label="Effective License ID" value={licenseDetails.licenseId} />
                        <InfoRow label="License Number" value={licenseDetails.licenseNumber} />
                        <InfoRow label="License Issue Date" value={formatDate(licenseDetails.issueDate)} />
                        <InfoRow label="License Expiry Date" value={formatDate(licenseDetails.expiryDate)} />
                        <InfoRow label="License Status" value={licenseDetails.licenseStatus} />
                    </>
                )}
            </div>
        )}
      </div>
    );
  };

  const renderCommentsNotesTab = () => {
    if (!application) return <p className="text-theme-text-secondary">Application data not loaded.</p>;
    const sortedCommunicationLog = application.communicationLog && application.communicationLog.length > 0
      ? [...application.communicationLog].sort((a, b) => new Date(b.date) - new Date(a.date))
      : [];

    const sortedGeneralNotes = application.generalNotes && application.generalNotes.length > 0
      ? [...application.generalNotes].reverse()
      : [];

    return (
      <div className="space-y-6">
        <SubSectionTitle title="Communication Log" />
        {sortedCommunicationLog.length > 0 ? (
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {sortedCommunicationLog.map(log => (
              <div key={log.logId} className="p-4 bg-theme-bg rounded-lg border border-theme-border shadow-sm">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-sm font-semibold text-theme-text-primary">{log.type || 'Log Entry'}</p>
                  <p className="text-xs text-theme-text-secondary">{formatDate(log.date, true)}</p>
                </div>
                <p className="text-sm text-theme-text-secondary mb-2">{log.summary || 'No summary provided.'}</p>
                <p className="text-xs text-gray-500">Logged by: {log.loggedByStaffId || 'Unknown'}</p>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-theme-text-secondary">No communication log entries for this application.</p>}

        <SubSectionTitle title="General Notes" />
        <div className="mb-4">
            <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Add a general note..."
                rows="3"
                className="w-full p-2 bg-theme-bg border border-theme-border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                disabled={isProcessingAction}
            />
            <button
                onClick={handleAddNote}
                disabled={!newNoteText.trim() || isProcessingAction}
                className="mt-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:bg-gray-700 transition-colors text-sm"
            >
                Add Note
            </button>
        </div>
        {sortedGeneralNotes.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {sortedGeneralNotes.map((note, index) => (
                    <div key={`note-${index}-${applicationId}`} className="p-3 bg-theme-bg rounded-md border border-theme-border">
                        <p className="text-sm text-theme-text-primary whitespace-pre-wrap">{note}</p>
                    </div>
                ))}
            </div>
        ) : (
            <p className="text-sm text-theme-text-secondary italic">No general notes added yet.</p>
        )}
      </div>
    );
  };

  const renderContentForDetailSection = () => {
    switch (activeDetailSection) {
      case 'ENTITY INFO': return renderEntityInfo();
      case 'PRODUCT, SERVICE OR SOLUTION': return renderProductServiceSolution();
      case 'FINANCIAL INFORMATION': return renderFinancialInformation();
      case 'AML PLAN': return renderAmlPlan();
      case 'CYBERSECURITY PLAN': return renderCybersecurityPlan();
      case 'OPEN BANKING PLAN': return renderGenericSection('Open Banking Plan');
      case 'RISK MANAGEMENT PLAN': return renderGenericSection('Risk Management Plan');
      case 'TESTING PLAN WHILE IN THE SANDBOX': return renderGenericSection('Testing Plan While in the Sandbox');
      default:
        return (
            <div>
                 <h2 className="text-xl font-semibold text-theme-text-primary mb-6">{activeDetailSection}</h2>
                 <p className="text-theme-text-secondary">Content for {activeDetailSection} is not yet implemented or data is unavailable.</p>
            </div>
        );
    }
  };

  if (isLoading && !application) {
    return <div className="p-6 text-center text-theme-text-secondary text-lg">Loading application details...</div>;
  }

  if (error && !application) {
    return (
      <div className="p-6 text-center">
        <div className="bg-red-900 bg-opacity-30 border border-red-500 text-red-300 px-4 py-3 rounded-md relative" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
        </div>
        {onBackToList && (
          <button
            onClick={onBackToList}
            className="mt-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-colors"
          >
            &larr; Back to Dashboard
          </button>
        )}
      </div>
    );
  }

  if (!headerData && !isLoading) {
     return (
      <div className="p-6 text-center">
         <div className="bg-yellow-900 bg-opacity-30 border border-yellow-500 text-yellow-300 px-4 py-3 rounded-md relative" role="alert">
            <strong className="font-bold">Notice:</strong>
            <span className="block sm:inline"> Essential application details (like Entity or Product information) are missing. The page cannot be fully displayed. Please check the data or try again.</span>
             {error && <span className="block sm:inline mt-1"> Specific error: {error}</span>}
        </div>
         {onBackToList && (
          <button
            onClick={onBackToList}
            className="mt-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-colors"
          >
            &larr; Back to Dashboard
          </button>
        )}
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-theme-bg">
      <div className="bg-theme-bg-secondary shadow-sm sticky top-0 z-20 border-b border-theme-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
             <h1 className="text-xl font-semibold text-theme-text-secondary truncate">
                License Management &gt; <span className="text-theme-text-primary">{headerData?.companyName || applicationId}</span>
             </h1>
             {onBackToList && (
                <button onClick={onBackToList} className="text-sm text-blue-400 hover:text-theme-accent ml-4 flex-shrink-0 focus:outline-none">
                    &larr; Back to Dashboard
                </button>
             )}
          </div>
        </div>
      </div>
      {headerData && (
        <div className="bg-theme-bg-secondary border-b border-theme-border sticky top-[57px] z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-px -mx-px">
                {[
                { label: "Company Name", value: headerData.companyName },
                { label: "Service", value: headerData.service },
                { label: "Product Name", value: headerData.productName },
                { label: "Submitted on", value: headerData.submittedOn },
                { label: "Rating", value: headerData.rating },
                { label: "Duration", value: headerData.duration },
                { label: "App Status", value: <StatusBadge status={headerData.status} /> }
                ].map(item => (
                <div key={item.label} className="py-4 px-2 md:px-3 text-center border-l border-theme-border first:border-l-0">
                    <p className="text-xs text-theme-text-secondary uppercase tracking-wider truncate" title={item.label}>{item.label}</p>
                    <div className="text-sm font-medium text-theme-text-primary mt-1 truncate" title={typeof item.value === 'string' ? item.value : undefined}>
                        {item.value}
                    </div>
                </div>
                ))}
            </div>
            </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RegulatoryUpdateAlert updates={applicableUpdates} />

        {isLoading && application && <div className="p-4 text-center text-theme-text-secondary">Refreshing application data...</div>}
        {error && <div className="p-3 mb-4 text-red-400 bg-red-900 bg-opacity-30 border border-red-500 rounded-md shadow">{error}</div>}

        <div className="mb-6 border-b border-theme-border">
          <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto" aria-label="Tabs">
            {['LICENSE APPLICATION DETAILS', 'FIT AND PROPER CHECK', 'LICENSE APPLICATION REVIEW', 'COMMENTS/NOTES'].map(tabName => (
              <button
                key={tabName}
                onClick={() => setActiveMainTab(tabName)}
                className={`${activeMainTab === tabName ? 'border-theme-accent text-theme-accent' : 'border-transparent text-theme-text-secondary hover:text-theme-text-primary hover:border-gray-500'} whitespace-nowrap py-3 px-2 sm:px-3 border-b-2 font-medium text-sm focus:outline-none`}
                disabled={isProcessingAction}
              >
                {tabName}
              </button>
            ))}
          </nav>
        </div>

        {activeMainTab === 'LICENSE APPLICATION DETAILS' && (
          <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
            <div className="w-full md:w-64 lg:w-1/4 flex-shrink-0">
              <nav className="space-y-1 md:sticky md:top-[125px]" aria-label="Sidebar">
                {detailSections.map(sectionName => (
                  <button
                    key={sectionName}
                    onClick={() => setActiveDetailSection(sectionName)}
                    className={`${activeDetailSection === sectionName ? 'bg-black bg-opacity-20 border-theme-accent text-theme-accent' : 'border-transparent text-theme-text-secondary hover:bg-black hover:bg-opacity-20 hover:text-theme-text-primary'} group flex items-center px-3 py-2.5 text-sm font-medium border-l-4 w-full text-left rounded-r-md focus:outline-none transition-colors duration-150`}
                    disabled={isProcessingAction}
                  >
                    <span className="truncate">{sectionName}</span>
                     {activeDetailSection === sectionName && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-auto text-theme-accent" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                     )}
                  </button>
                ))}
              </nav>
            </div>
            <div className="flex-1 bg-theme-bg-secondary p-6 shadow-lg rounded-lg min-w-0 border border-theme-border">
              {renderContentForDetailSection()}
              <div className="mt-8 pt-5 border-t border-theme-border">
                  <div className="flex justify-end">
                      {!isLastSection && (
                        <button
                            type="button"
                            onClick={handleNextSection}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-bg-secondary focus:ring-blue-500"
                            disabled={isProcessingAction}
                        >
                            Next
                        </button>
                      )}
                  </div>
              </div>
            </div>
          </div>
        )}
        {activeMainTab === 'FIT AND PROPER CHECK' && (
          <div className="bg-theme-bg-secondary p-6 shadow-lg rounded-lg border border-theme-border">
            {renderFitAndProperCheckTab()}
          </div>
        )}
        {activeMainTab === 'LICENSE APPLICATION REVIEW' && (
          <div className="bg-theme-bg-secondary p-6 shadow-lg rounded-lg border border-theme-border">
            {renderLicenseApplicationReviewTab()}
          </div>
        )}
        {activeMainTab === 'COMMENTS/NOTES' && (
          <div className="bg-theme-bg-secondary p-6 shadow-lg rounded-lg border border-theme-border">
            {renderCommentsNotesTab()}
          </div>
        )}
      </div>
      {showKycModal && (
        <KycCheckModal
            targetName={kycTargetName}
            isChecking={isKycChecking}
            kycCheckDisplayData={kycCheckDisplayData}
            onClose={() => {
                setShowKycModal(false);
                setKycTargetName("");
                setIsKycChecking(false);
                setKycCheckDisplayData(null);
            }}
        />
      )}
    </div>
  );
};

ApplicationDetailPage.defaultProps = {
    onBackToList: () => console.warn("onBackToList not provided to ApplicationDetailPage")
};

export default ApplicationDetailPage;