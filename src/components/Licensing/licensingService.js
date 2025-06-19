// src/components/Licensing/licensingService.js

import licenseApplicationsData from '../../data/licenseApplications.js';
import entitiesData from '../../data/entities.js';
import productsData from '../../data/products.js';
import licensesData from '../../data/licenses.js';
import regulatorStaffData from '../../data/regulatorStaff.js';
import documentsData from '../../data/documents.js';
import licenseActionsData from '../../data/licenseActions.js';

const SIMULATED_DELAY = 50; // Milliseconds for simulated API call delay

// --- ID Generation Helpers ---
let nextActionIdSuffix = licenseActionsData.length + 1;
const generateNewActionId = () => {
    const newId = `LCA-${String(nextActionIdSuffix).padStart(3, '0')}`;
    nextActionIdSuffix++;
    return newId;
};

let nextApplicationNumericId = licenseApplicationsData.length + 1;
const generateNewApplicationId = (submissionDateStr) => {
    const date = new Date(submissionDateStr);
    const year = String(date.getFullYear()).slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const numericPart = String(nextApplicationNumericId).padStart(4, '0');
    nextApplicationNumericId++;
    return `APP-${year}${month}-${numericPart}`;
};

let nextLicenseNumericId = licensesData.length + 1;
const generateNewLicenseId = (issueDateObject) => {
    const year = issueDateObject.getFullYear();
    const numericPart = String(nextLicenseNumericId).padStart(4, '0');
    nextLicenseNumericId++;
    return `LIC-${year}-${numericPart}`;
};

const generateNewLicenseNumber = (licenseType, issueDateObject, numericIdPart) => {
    const typePrefix = licenseType.substring(0, 3).toUpperCase();
    const year = issueDateObject.getFullYear();
    const numberPart = String(numericIdPart).padStart(5, '0');
    return `${typePrefix}-${year}-${numberPart}`;
};

let nextEntityNumericId = entitiesData.length + 1;
const generateNewEntityId = () => {
    const numericPart = String(nextEntityNumericId).padStart(3, '0');
    nextEntityNumericId++;
    return `ent_${numericPart}`;
};

let nextPersonNumericId = 0;
entitiesData.forEach(entity => {
    const checkContact = (contact) => {
        if (contact && contact.contactId && contact.contactId.startsWith('person_')) {
            try {
                const num = parseInt(contact.contactId.split('_')[1], 10);
                if (!isNaN(num) && num >= nextPersonNumericId) {
                    nextPersonNumericId = num + 1;
                }
            } catch (e) {
                // console.warn("Could not parse contactId:", contact.contactId, e);
            }
        }
    };
    checkContact(entity.primaryContact);
    (entity.directors || []).forEach(checkContact);
    (entity.ubos || []).forEach(checkContact);
});
if (nextPersonNumericId === 0) nextPersonNumericId = 1; // Default if no person_XXX IDs found

const generateNewPersonContactId = () => {
    const numericPart = String(nextPersonNumericId).padStart(3, '0');
    nextPersonNumericId++;
    return `person_${numericPart}`;
};

let nextDocumentNumericId = documentsData.length + 1;
const generateNewDocumentId = () => {
    const numericPart = String(nextDocumentNumericId).padStart(3, '0');
    nextDocumentNumericId++;
    return `doc_${numericPart}`;
};

// --- API Simulation ---
const simulateApiCall = (dataFunction) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const result = dataFunction();
        resolve(result);
      } catch (error) {
        console.error("Error executing data function in simulateApiCall:", error);
        reject(error);
      }
    }, SIMULATED_DELAY);
  });
};

// --- GETTER FUNCTIONS ---
export const getAllApplications = async () => {
  return simulateApiCall(() => licenseApplicationsData);
};
export const getAllEntities = async () => {
  return simulateApiCall(() => entitiesData);
};
export const getAllProducts = async () => {
  return simulateApiCall(() => productsData);
};
export const getApplicationById = async (applicationId) => {
  return simulateApiCall(() => licenseApplicationsData.find(app => app.applicationId === applicationId) || null);
};
export const getEntityById = async (entityId) => {
  return simulateApiCall(() => entitiesData.find(entity => entity.entityId === entityId) || null);
};
export const getProductById = async (productId) => {
  return simulateApiCall(() => productsData.find(product => product.productId === productId) || null);
};
export const getAllLicenses = async () => {
    return simulateApiCall(() => licensesData);
};
export const getLicenseById = async (licenseId) => {
  return simulateApiCall(() => licensesData.find(license => license.licenseId === licenseId) || null);
};
export const getStaffById = async (staffId) => {
  return simulateApiCall(() => regulatorStaffData.find(staff => staff.staffId === staffId) || null);
};
export const getAllRegulatorStaff = async () => {
  return simulateApiCall(() => regulatorStaffData);
};
export const getDocumentById = async (docId) => {
  return simulateApiCall(() => documentsData.find(doc => doc.documentId === docId) || null);
};

// --- CREATE & UPDATE FUNCTIONS ---

export const uploadDocument = async (fileObject, documentType, uploadedBy = "applicant_system") => {
    return simulateApiCall(() => {
        if (!fileObject || !documentType) {
            throw new Error("File object and document type are required to upload a document.");
        }
        const newDocId = generateNewDocumentId();
        const currentDate = new Date().toISOString().split('T')[0];
        let dummyLink = "/dummy_documents/uploaded_generic_document.txt";
        if (fileObject.type.startsWith("image/")) {
            dummyLink = "/dummy_documents/generic_id_scan.jpeg.txt";
        } else if (fileObject.type === "application/pdf") {
            dummyLink = "/dummy_documents/generic_certificate.pdf.txt";
        }
        const newDocumentMetadata = {
            documentId: newDocId,
            fileName: fileObject.name,
            documentType: documentType,
            version: "1.0",
            uploadDate: currentDate,
            uploadedBy: uploadedBy,
            mimeType: fileObject.type || "application/octet-stream",
            dummyFileContentLink: dummyLink,
            description: `Document uploaded for ${documentType}. Original filename: ${fileObject.name}.`,
        };
        documentsData.push(newDocumentMetadata);
        console.log("Created New Document Metadata:", newDocumentMetadata);
        return newDocId;
    });
};

export const createApplication = async (applicationData) => {
  return simulateApiCall(() => { 
    const currentDate = new Date().toISOString();
    const submissionDate = currentDate.split('T')[0];
    let entityIdToUse;
    let createdEntityForApp; 

    if (applicationData.entityData) {
        if (!applicationData.entityData.companyName || !applicationData.entityData.legalName) {
            throw new Error("Company Name and Legal Name are required for the new entity.");
        }
        const primaryContactId = generateNewPersonContactId();
        const newEntity = {
            entityId: generateNewEntityId(),
            companyName: applicationData.entityData.companyName,
            legalName: applicationData.entityData.legalName,
            registrationNumber: applicationData.entityData.registrationNumber || '',
            dateOfIncorporation: applicationData.entityData.dateOfIncorporation || new Date().toISOString().split('T')[0],
            jurisdictionOfIncorporation: applicationData.entityData.jurisdictionOfIncorporation || 'N/A',
            companyType: applicationData.entityData.companyType || 'N/A',
            primaryAddress: applicationData.entityData.primaryAddress || 'N/A',
            website: applicationData.entityData.website || '',
            primaryContact: {
                contactId: primaryContactId,
                fullName: applicationData.entityData.primaryContactFullName || 'N/A',
                email: applicationData.entityData.primaryContactEmail || 'N/A',
                phone: applicationData.entityData.primaryContactPhone || 'N/A',
                position: applicationData.entityData.primaryContactPosition || 'Primary Contact',
                dateOfBirth: '', nationality: '', residentialAddress: '', 
                idDocumentType: '', idDocumentNumber: '', idDocumentExpiry: '', isPEP: false,
            },
            directors: [], 
            ubos: [],     
            assignedOfficerId: regulatorStaffData.length > 0 ? regulatorStaffData[0].staffId : null, 
            internalRiskRating: "Medium", 
            entityStatus: "Applicant", 
        };

        // MODIFICATION START: Process Director and UBO details
        if (applicationData.entityData.directorFullName && applicationData.entityData.directorEmail) {
            const directorContactId = generateNewPersonContactId();
            newEntity.directors.push({
                contactId: directorContactId,
                fullName: applicationData.entityData.directorFullName,
                email: applicationData.entityData.directorEmail,
                phone: applicationData.entityData.directorPhone || '',
                dateOfBirth: applicationData.entityData.directorDOB || '',
                nationality: applicationData.entityData.directorNationality || '',
                residentialAddress: applicationData.entityData.directorResidentialAddress || '',
                idDocumentType: '', idDocumentNumber: '', idDocumentExpiry: '', 
                isPEP: false, // Default, can be updated later
                role: 'Director', 
            });
        }

        if (applicationData.entityData.uboFullName && applicationData.entityData.uboEmail && applicationData.entityData.uboOwnershipPercentage) {
            const uboContactId = generateNewPersonContactId();
            newEntity.ubos.push({
                contactId: uboContactId,
                fullName: applicationData.entityData.uboFullName,
                email: applicationData.entityData.uboEmail,
                phone: applicationData.entityData.uboPhone || '',
                dateOfBirth: applicationData.entityData.uboDOB || '',
                nationality: applicationData.entityData.uboNationality || '',
                residentialAddress: applicationData.entityData.uboResidentialAddress || '',
                idDocumentType: '', idDocumentNumber: '', idDocumentExpiry: '',
                isPEP: false, // Default
                ownershipPercentage: parseFloat(applicationData.entityData.uboOwnershipPercentage) || 0,
            });
        }
        // MODIFICATION END

        entitiesData.push(newEntity);
        console.log("Created New Entity (within createApplication):", newEntity);
        entityIdToUse = newEntity.entityId;
        createdEntityForApp = newEntity; 
    } else if (applicationData.entityId) { 
        entityIdToUse = applicationData.entityId;
        createdEntityForApp = entitiesData.find(e => e.entityId === entityIdToUse);
    }

    if (!entityIdToUse || !applicationData.licenseTypeSought) {
        throw new Error("Entity (either existing ID or new data) and License Type Sought are required.");
    }
    
    if (!createdEntityForApp) {
        throw new Error(`Entity with ID ${entityIdToUse} could not be resolved for the application.`);
    }

    const newApplication = {
      applicationId: generateNewApplicationId(submissionDate),
      productId: null, 
      entityId: entityIdToUse,
      licenseTypeSought: applicationData.licenseTypeSought,
      applicationType: applicationData.applicationType || "New License",
      submissionDate: submissionDate,
      receivedDate: submissionDate, 
      source: "Manual Entry", 
      applicationStatus: "Submitted", 
      statusLastUpdated: currentDate,
      assignedReviewerId: applicationData.assignedReviewerId || null,
      additionalReviewerIds: applicationData.additionalReviewerIds || [],
      reviewTeam: applicationData.reviewTeam || null,
      reviewDeadlineSLA: applicationData.reviewDeadlineSLA || null,
      supportingDocumentIds: applicationData.supportingDocumentIds || [], 
      communicationLog: [], 
      sanctionScreening: { 
        overallScreeningStatus: "Clear", 
        lastScreeningDate: currentDate,
        screenedParties: [
          { 
            partyId: createdEntityForApp.primaryContact.contactId, 
            partyName: createdEntityForApp.primaryContact.fullName, 
            screeningResult: "Clear", 
            listsChecked: ["OFAC", "UN", "EU"] 
          },
          // MODIFICATION: Add director and UBO to dummy sanction screening if they exist
          ...(createdEntityForApp.directors.map(dir => ({
            partyId: dir.contactId,
            partyName: dir.fullName,
            screeningResult: "Clear", // Dummy
            listsChecked: ["OFAC", "UN"]
          }))),
          ...(createdEntityForApp.ubos.map(ubo => ({
            partyId: ubo.contactId,
            partyName: ubo.fullName,
            screeningResult: "Clear", // Dummy
            listsChecked: ["OFAC", "UN"]
          }))),
        ],
        adjudicationNotes: "Initial dummy screening clear for primary contact, director, and UBO.",
        adjudicatedByStaffId: applicationData.assignedReviewerId || (regulatorStaffData.length > 0 ? regulatorStaffData[0].staffId : null),
      },
      generalNotes: applicationData.generalNotes || [],
      decision: undefined,
      decisionDate: undefined,
      decisionReason: undefined,
      effectiveLicenseId: undefined,
    };

    licenseApplicationsData.push(newApplication);
    console.log("Created New License Application:", newApplication);
    return { ...newApplication };
  });
};

export const updateApplicationStatus = async (applicationId, newStatus, decisionReason = "") => {
  return simulateApiCall(() => {
    const appIndex = licenseApplicationsData.findIndex(app => app.applicationId === applicationId);
    if (appIndex === -1) {
      throw new Error(`Application ${applicationId} not found for status update.`);
    }
    
    const application = licenseApplicationsData[appIndex];
    const currentDate = new Date();
    const currentDateISO = currentDate.toISOString();

    application.applicationStatus = newStatus;
    application.statusLastUpdated = currentDateISO;

    if (newStatus === "Approved" || newStatus === "Denied") {
      application.decision = newStatus;
      application.decisionDate = currentDateISO;
      application.decisionReason = decisionReason || (newStatus === "Approved" ? "Application approved." : "Application denied.");
    } else {
      application.decision = undefined;
      application.decisionDate = undefined;
      application.effectiveLicenseId = undefined; 
    }

    if (newStatus === "Approved") {
      let existingLicense = null;
      if (application.effectiveLicenseId) {
        existingLicense = licensesData.find(lic => lic.licenseId === application.effectiveLicenseId);
      }

      if (!existingLicense) {
        const issueDate = new Date(application.decisionDate || currentDateISO); 
        const newLicenseId = generateNewLicenseId(issueDate);
        
        let licenseTermYears = 1; 
        if (application.licenseTypeSought.toLowerCase().includes("credit")) licenseTermYears = 2;
        else if (application.licenseTypeSought.toLowerCase().includes("investment")) licenseTermYears = 3;
        else if (application.licenseTypeSought.toLowerCase().includes("banking")) licenseTermYears = 5;

        const expiryDate = new Date(issueDate);
        expiryDate.setFullYear(issueDate.getFullYear() + licenseTermYears);

        const nextRenewalDueDate = new Date(expiryDate);
        nextRenewalDueDate.setDate(expiryDate.getDate() - 60); 

        const licenseNumericPartOnly = parseInt(newLicenseId.split('-')[2], 10);
        const newLicenseNumber = generateNewLicenseNumber(application.licenseTypeSought, issueDate, licenseNumericPartOnly);

        const newLicense = {
            licenseId: newLicenseId,
            licenseNumber: newLicenseNumber,
            productId: application.productId, 
            entityId: application.entityId,
            applicationIdGranted: application.applicationId,
            licenseType: application.licenseTypeSought,
            issueDate: issueDate.toISOString().split('T')[0],
            expiryDate: expiryDate.toISOString().split('T')[0],
            lastRenewalDate: undefined,
            nextRenewalDueDate: nextRenewalDueDate.toISOString().split('T')[0],
            licenseStatus: "Active",
            statusReason: "License issued upon application approval.",
            renewalStatus: "Not Started",
            renewalApplicationId: undefined,
            renewalSubmissionDate: undefined,
            renewalLastUpdated: undefined,
            renewalNotes: [],
            renewalDocumentIds: [],
            complianceHistoryReviewed: false,
        };
        licensesData.push(newLicense);
        application.effectiveLicenseId = newLicenseId;
        console.log("New license created and linked:", newLicense);
        application.decisionReason = decisionReason || `Application approved and license ${newLicenseNumber} issued.`;
      } else {
        console.log(`Application ${applicationId} already linked to license ${application.effectiveLicenseId}. No new license created.`);
        const linkedLicenseIndex = licensesData.findIndex(l => l.licenseId === application.effectiveLicenseId);
        if(linkedLicenseIndex !== -1 && licensesData[linkedLicenseIndex].licenseStatus !== "Active") {
            licensesData[linkedLicenseIndex].licenseStatus = "Active";
            licensesData[linkedLicenseIndex].statusReason = "License re-activated upon application re-approval (if applicable).";
            licensesData[linkedLicenseIndex].statusLastUpdated = currentDateISO;
        }
         application.decisionReason = decisionReason || `Application approved. Linked to existing license ${application.effectiveLicenseId}.`;
      }
    }
    return { ...application };
  });
};

// ... (rest of the update functions: updateAssignedReviewer, addAdditionalReviewer, etc. remain unchanged) ...
export const updateAssignedReviewer = async (applicationId, newReviewerId) => {
  return simulateApiCall(() => {
    const appIndex = licenseApplicationsData.findIndex(app => app.applicationId === applicationId);
    if (appIndex !== -1) {
      licenseApplicationsData[appIndex].assignedReviewerId = newReviewerId;
      licenseApplicationsData[appIndex].statusLastUpdated = new Date().toISOString();
      return { ...licenseApplicationsData[appIndex] };
    }
    throw new Error(`Application ${applicationId} not found for reviewer update.`);
  });
};

export const addAdditionalReviewer = async (applicationId, additionalReviewerId) => {
  return simulateApiCall(() => {
    const appIndex = licenseApplicationsData.findIndex(app => app.applicationId === applicationId);
    if (appIndex !== -1) {
      if (!licenseApplicationsData[appIndex].additionalReviewerIds) {
        licenseApplicationsData[appIndex].additionalReviewerIds = [];
      }
      if (!licenseApplicationsData[appIndex].additionalReviewerIds.includes(additionalReviewerId)) {
        licenseApplicationsData[appIndex].additionalReviewerIds.push(additionalReviewerId);
        licenseApplicationsData[appIndex].statusLastUpdated = new Date().toISOString();
      }
      return { ...licenseApplicationsData[appIndex] };
    }
    throw new Error(`Application ${applicationId} not found for adding additional reviewer.`);
  });
};

export const removeAdditionalReviewer = async (applicationId, reviewerIdToRemove) => {
  return simulateApiCall(() => {
    const appIndex = licenseApplicationsData.findIndex(app => app.applicationId === applicationId);
    if (appIndex !== -1 && licenseApplicationsData[appIndex].additionalReviewerIds) {
      const initialLength = licenseApplicationsData[appIndex].additionalReviewerIds.length;
      licenseApplicationsData[appIndex].additionalReviewerIds = licenseApplicationsData[appIndex].additionalReviewerIds.filter(id => id !== reviewerIdToRemove);
      if (licenseApplicationsData[appIndex].additionalReviewerIds.length < initialLength) {
        licenseApplicationsData[appIndex].statusLastUpdated = new Date().toISOString();
      }
      return { ...licenseApplicationsData[appIndex] };
    }
    if (appIndex === -1) throw new Error(`Application ${applicationId} not found.`);
    return licenseApplicationsData[appIndex] ? { ...licenseApplicationsData[appIndex] } : null;
  });
};

export const addGeneralNoteToApplication = async (applicationId, noteText) => {
  return simulateApiCall(() => {
    const appIndex = licenseApplicationsData.findIndex(app => app.applicationId === applicationId);
    if (appIndex !== -1) {
      if (!licenseApplicationsData[appIndex].generalNotes) {
        licenseApplicationsData[appIndex].generalNotes = [];
      }
      licenseApplicationsData[appIndex].generalNotes.push(noteText);
      licenseApplicationsData[appIndex].statusLastUpdated = new Date().toISOString();
      return { ...licenseApplicationsData[appIndex] };
    }
    throw new Error(`Application ${applicationId} not found for adding note.`);
  });
};

// --- LICENSE RENEWAL FUNCTIONS ---
// (These remain unchanged)
export const getLicensesNearingExpiryOrPending = async (daysOut = 90, currentDate = new Date("2025-05-15")) => {
    return simulateApiCall(() => {
        const thresholdDate = new Date(currentDate);
        thresholdDate.setDate(currentDate.getDate() + daysOut);
        return licensesData.filter(lic => {
            if (lic.licenseStatus === "Expired" || lic.licenseStatus === "Revoked" || lic.licenseStatus === "Suspended") return false;
            const nextRenewalDate = lic.nextRenewalDueDate ? new Date(lic.nextRenewalDueDate) : null;
            const expiryDate = new Date(lic.expiryDate);
            const isPendingRenewalOnWorkflow = lic.renewalStatus && lic.renewalStatus !== "Not Started" && lic.renewalStatus !== "Renewal Approved" && lic.renewalStatus !== "Renewal Denied";
            const isNearingExpiryOrDue = lic.licenseStatus === "Active" && nextRenewalDate && nextRenewalDate <= thresholdDate && expiryDate > currentDate;
            const isPastDueActive = lic.licenseStatus === "Active" && nextRenewalDate && nextRenewalDate < currentDate && expiryDate > currentDate;
            const isMarkedPendingRenewalOnLicense = lic.licenseStatus === "Pending Renewal";
            return isPendingRenewalOnWorkflow || isNearingExpiryOrDue || isPastDueActive || isMarkedPendingRenewalOnLicense;
        }).sort((a,b) => (a.nextRenewalDueDate ? new Date(a.nextRenewalDueDate) : new Date(a.expiryDate)) - (b.nextRenewalDueDate ? new Date(b.nextRenewalDueDate) : new Date(b.expiryDate)));
    });
};
export const initiateLicenseRenewal = async (licenseId) => {
    return simulateApiCall(() => {
        const licIndex = licensesData.findIndex(lic => lic.licenseId === licenseId);
        if (licIndex !== -1) {
            if (licensesData[licIndex].licenseStatus === "Active" || licensesData[licIndex].licenseStatus === "Pending Renewal") {
                licensesData[licIndex].renewalStatus = "Pending Submission";
                licensesData[licIndex].renewalLastUpdated = new Date().toISOString();
                licensesData[licIndex].renewalNotes = []; 
                licensesData[licIndex].renewalDocumentIds = []; 
                licensesData[licIndex].complianceHistoryReviewed = false; 
                return { ...licensesData[licIndex] };
            } else {
                throw new Error(`License is not Active or Pending Renewal. Current status: ${licensesData[licIndex].licenseStatus}`);
            }
        }
        throw new Error(`License ${licenseId} not found.`);
    });
};
export const updateLicenseRenewalData = async (licenseId, renewalData) => {
    return simulateApiCall(() => {
        const licIndex = licensesData.findIndex(lic => lic.licenseId === licenseId);
        if (licIndex !== -1) {
            if (licensesData[licIndex].renewalStatus && licensesData[licIndex].renewalStatus !== "Not Started") {
                if (renewalData.renewalNotes && Array.isArray(renewalData.renewalNotes)) {
                    if (!licensesData[licIndex].renewalNotes) licensesData[licIndex].renewalNotes = [];
                    licensesData[licIndex].renewalNotes.push(...renewalData.renewalNotes);
                    delete renewalData.renewalNotes; 
                }
                 if (renewalData.renewalDocumentIds && Array.isArray(renewalData.renewalDocumentIds)) {
                    if (!licensesData[licIndex].renewalDocumentIds) licensesData[licIndex].renewalDocumentIds = [];
                    renewalData.renewalDocumentIds.forEach(docId => {
                        if(!licensesData[licIndex].renewalDocumentIds.includes(docId)) {
                            licensesData[licIndex].renewalDocumentIds.push(docId);
                        }
                    });
                    delete renewalData.renewalDocumentIds; 
                }
                Object.assign(licensesData[licIndex], renewalData);
                licensesData[licIndex].renewalLastUpdated = new Date().toISOString();
                return { ...licensesData[licIndex] };
            } else {
                throw new Error("Renewal process not active for this license or attempting to update a finalized renewal.");
            }
        }
        throw new Error(`License ${licenseId} not found.`);
    });
};
export const processLicenseRenewalDecision = async (licenseId, decision, newExpiryDateISO, reason) => {
    return simulateApiCall(() => {
        const licIndex = licensesData.findIndex(lic => lic.licenseId === licenseId);
        if (licIndex !== -1) {
            const license = licensesData[licIndex];
            license.renewalStatus = decision;
            license.renewalLastUpdated = new Date().toISOString();
            license.statusReason = reason || license.statusReason; 
            if (decision === "Renewal Approved") {
                if (!newExpiryDateISO) throw new Error("New expiry date is required for renewal approval.");
                const oldExpiryDate = license.expiryDate;
                license.expiryDate = newExpiryDateISO;
                license.lastRenewalDate = new Date().toISOString().split('T')[0]; 
                const newIssueD = new Date(oldExpiryDate); 
                newIssueD.setDate(newIssueD.getDate() + 1);
                license.issueDate = newIssueD.toISOString().split('T')[0];
                const newExp = new Date(newExpiryDateISO);
                const newRenewalDue = new Date(newExp);
                newRenewalDue.setDate(newExp.getDate() - 60); 
                license.nextRenewalDueDate = newRenewalDue.toISOString().split('T')[0];
                license.licenseStatus = "Active"; 
                license.statusReason = reason || "License successfully renewed.";
            } else if (decision === "Renewal Denied") {
                license.statusReason = reason || "License renewal denied.";
                if (new Date(license.expiryDate) < new Date(new Date().toDateString())) { 
                    license.licenseStatus = "Expired";
                }
            }
            return { ...license };
        }
        throw new Error(`License ${licenseId} not found for processing renewal decision.`);
    });
};

// --- UPDATE FUNCTIONS (LICENSES - General Status) ---
export const updateLicenseStatus = async (licenseId, newStatus, statusReason = "") => {
  return simulateApiCall(() => {
    const licIndex = licensesData.findIndex(lic => lic.licenseId === licenseId);
    if (licIndex !== -1) {
      const license = licensesData[licIndex];
      license.licenseStatus = newStatus;
      license.statusReason = statusReason;
      license.statusLastUpdated = new Date().toISOString(); 
      console.log(`License ${licenseId} status updated to ${newStatus}. Reason: ${statusReason}`);
      return { ...license };
    }
    throw new Error(`License ${licenseId} not found for status update.`);
  });
};

// --- LICENSE ACTION WORKFLOW FUNCTIONS ---
export const createLicenseAction = async (actionData) => {
  return simulateApiCall(() => {
    if (!actionData.licenseId || !actionData.actionType || !actionData.initiatingStaffId) {
      throw new Error("License ID, Action Type, and Initiating Staff ID are required to create a license action.");
    }
    const currentTime = new Date().toISOString();
    const newAction = {
      actionId: generateNewActionId(),
      supportingDocumentIds: actionData.supportingDocumentIds || [], 
      internalReviewNotes: actionData.internalReviewNotes || [],   
      internalReviewChecklistData: actionData.internalReviewChecklistData || {}, 
      ...actionData, 
      status: 'Draft',           
      creationDate: currentTime,
      lastUpdated: currentTime,  
    };
    licenseActionsData.push(newAction);
    console.log("Created License Action:", newAction);
    return { ...newAction };
  });
};
export const getLicenseActionById = async (actionId) => {
  return simulateApiCall(() => licenseActionsData.find(action => action.actionId === actionId) || null);
};
export const getLicenseActionsByLicenseId = async (licenseId) => {
  return simulateApiCall(() => licenseActionsData.filter(action => action.licenseId === licenseId).sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate)));
};
export const updateLicenseAction = async (actionId, updatedData) => {
  return simulateApiCall(() => {
    const actionIndex = licenseActionsData.findIndex(action => action.actionId === actionId);
    if (actionIndex !== -1) {
      const { actionId: _, creationDate: __, initiatingStaffId: ___, licenseId: ____, originalLicenseStatus: _____, ...dataToUpdate } = updatedData; 
      licenseActionsData[actionIndex] = {
        ...licenseActionsData[actionIndex], 
        ...dataToUpdate,                   
        lastUpdated: new Date().toISOString(), 
      };
      console.log("Updated License Action:", licenseActionsData[actionIndex]);
      return { ...licenseActionsData[actionIndex] };
    }
    throw new Error(`License action with ID ${actionId} not found for update.`);
  });
};
