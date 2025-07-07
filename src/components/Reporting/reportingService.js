// src/components/Reporting/reportingService.js

import licenseCategoriesData from '../../data/licenseCategories.js';
import reportingMetricsData from '../../data/reportingMetrics.js';
import complianceSubmissionsData from '../../data/complianceSubmissions.js';
import entitiesData from '../../data/entities.js';
import licensesData from '../../data/licenses.js';
import productsData from '../../data/products.js';
import documentsData from '../../data/documents.js';
import regulatorStaffData from '../../data/regulatorStaff.js';
import { getEntityById } from '../Licensing/licensingService.js';

const SIMULATED_DELAY = 50; // Milliseconds for simulated API call delay

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

export const getLicenseCategories = async () => {
  return simulateApiCall(() => licenseCategoriesData);
};

export const getLicenseCategoryById = async (categoryId) => {
  return simulateApiCall(() => licenseCategoriesData.find(cat => cat.id === categoryId) || null);
};

export const getEntitiesByLicenseCategory = async (categoryId) => {
    return simulateApiCall(() => {
        const category = licenseCategoriesData.find(cat => cat.id === categoryId);
        if (!category) return [];
        const relevantLicenseTypes = productsData
            .filter(p => category.name.toLowerCase().includes(p.licenseTypeRequired.split(' ')[0].toLowerCase()))
            .map(p => p.licenseTypeRequired);
        const uniqueRelevantLicenseTypes = [...new Set(relevantLicenseTypes)];
        const licensedEntityIds = licensesData
            .filter(lic => uniqueRelevantLicenseTypes.includes(lic.licenseType) && lic.licenseStatus === 'Active')
            .map(lic => lic.entityId);
        return entitiesData.filter(entity => licensedEntityIds.includes(entity.entityId));
    });
};

export const getEntitiesByLicenseCategoryWithHealth = async (categoryId) => {
    return simulateApiCall(() => {
        const category = licenseCategoriesData.find(cat => cat.id === categoryId);
        if (!category) return { entitiesWithHealth: [], healthStats: {} };

        const licensedEntityIds = licensesData
            .filter(lic => lic.licenseType.toLowerCase().includes(category.name.split(' ')[0].toLowerCase()) && lic.licenseStatus === 'Active')
            .map(lic => lic.entityId);
        const entities = entitiesData.filter(entity => licensedEntityIds.includes(entity.entityId));

        let overdueCount = 0;
        let deficientCount = 0;
        let lowRiskCount = 0;
        let mediumRiskCount = 0;
        let highRiskCount = 0;

        const today = new Date();

        const entitiesWithHealth = entities.map(entity => {
            const submissions = complianceSubmissionsData.filter(s => s.entityId === entity.entityId);
            let complianceStanding = 'On-Time';
            let riskRating = 'Low';
            let hasOverdue = false;
            let hasDeficient = false;

            if (submissions.length === 0) {
                 riskRating = 'Low';
                 lowRiskCount++;
            } else {
                const isOverdue = submissions.some(s => (s.status === 'Pending Submission' || s.status === 'Late Submission') && new Date(s.dueDate) < today);
                const isDeficient = submissions.some(s => s.status === 'Reviewed - Issues Found');

                if (isOverdue) {
                    complianceStanding = 'Overdue';
                    hasOverdue = true;
                }
                if (isDeficient) {
                    complianceStanding = 'Deficient';
                    hasDeficient = true;
                }

                if (hasOverdue && hasDeficient) {
                    riskRating = 'High';
                    highRiskCount++;
                } else if (hasOverdue || hasDeficient) {
                    riskRating = 'Medium';
                    mediumRiskCount++;
                } else {
                    riskRating = 'Low';
                    lowRiskCount++;
                }
            }
            if (hasOverdue) overdueCount++;
            if (hasDeficient) deficientCount++;


            return {
                ...entity,
                complianceStanding,
                riskRating,
            };
        });

        const healthStats = {
            totalEntities: entities.length,
            overdueSubmissions: overdueCount,
            deficientSubmissions: deficientCount,
            fullyCompliant: lowRiskCount,
            lowRisk: lowRiskCount,
            mediumRisk: mediumRiskCount,
            highRisk: highRiskCount,
        };

        return { entitiesWithHealth, healthStats };
    });
};


export const getComplianceSubmissionsForEntity = async (entityId) => {
  return simulateApiCall(() => complianceSubmissionsData.filter(sub => sub.entityId === entityId).sort((a, b) => new Date(b.submissionDate || 0) - new Date(a.submissionDate || 0)));
};

export const getComplianceSubmissionDetail = async (submissionId) => {
  return simulateApiCall(() => complianceSubmissionsData.find(sub => sub.submissionId === submissionId) || null);
};

export const getDocumentById = async (docId) => {
    return simulateApiCall(() => documentsData.find(doc => doc.documentId === docId) || null);
};

export const getStaffById = async (staffId) => {
    return simulateApiCall(() => regulatorStaffData.find(staff => staff.staffId === staffId) || null);
};

export const getOverallComplianceSnapshot = async () => {
    return simulateApiCall(() => {
        const today = new Date();
        const overdueSubmissions = complianceSubmissionsData.filter(s =>
            (s.status === 'Pending Submission' || s.status === 'Late Submission') && new Date(s.dueDate) < today
        );
        const issuesFoundSubmissions = complianceSubmissionsData.filter(s => s.status === 'Reviewed - Issues Found');
        const underReviewSubmissions = complianceSubmissionsData.filter(s => s.status === 'Under Review');

        return {
            overdueCount: overdueSubmissions.length,
            entitiesWithIssuesCount: [...new Set(issuesFoundSubmissions.map(s => s.entityId))].length,
            underReviewCount: underReviewSubmissions.length
        };
    });
};

export const getRecentActivity = async () => {
    return simulateApiCall(() => {
        const today = new Date();
        const getCategoryForLicense = (licenseType) => {
            const cat = licenseCategoriesData.find(c => c.name.toLowerCase().startsWith(licenseType.split(' ')[0].toLowerCase()));
            return cat ? cat.id : null;
        };

        const recentOverdue = complianceSubmissionsData
            .filter(s => (s.status === 'Pending Submission' || s.status === 'Late Submission') && new Date(s.dueDate) < today)
            .sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate))
            .slice(0, 5)
            .map(s => {
                const license = licensesData.find(l => l.licenseId === s.licenseId);
                const entity = entitiesData.find(e => e.entityId === s.entityId);
                return {
                    entity: entity ? entity.companyName : s.entityId,
                    reportType: s.reportType.replace(/_/g, ' '),
                    dueDate: new Date(s.dueDate).toLocaleDateString(),
                    entityId: s.entityId,
                    categoryId: license ? getCategoryForLicense(license.licenseType) : null,
                };
            });

        const recentIssues = complianceSubmissionsData
            .filter(s => s.status === 'Reviewed - Issues Found')
            .sort((a, b) => new Date(b.finalizedDate) - new Date(a.finalizedDate))
            .slice(0, 5)
            .map(s => {
                const license = licensesData.find(l => l.licenseId === s.licenseId);
                const entity = entitiesData.find(e => e.entityId === s.entityId);
                return {
                    entity: entity ? entity.companyName : s.entityId,
                    reportType: s.reportType.replace(/_/g, ' '),
                    finalizedDate: new Date(s.finalizedDate).toLocaleDateString(),
                    entityId: s.entityId,
                    categoryId: license ? getCategoryForLicense(license.licenseType) : null,
                };
            });

        return { recentOverdue, recentIssues };
    });
};


// --- UPDATE FUNCTIONS ---

export const updateComplianceSubmissionStatus = async (submissionId, newStatus, notes = "") => {
  return simulateApiCall(() => {
    const submissionIndex = complianceSubmissionsData.findIndex(sub => sub.submissionId === submissionId);
    if (submissionIndex === -1) {
      throw new Error(`Submission ${submissionId} not found.`);
    }
    complianceSubmissionsData[submissionIndex].status = newStatus;
    if (notes) {
      complianceSubmissionsData[submissionIndex].overallComplianceNotes =
        (complianceSubmissionsData[submissionIndex].overallComplianceNotes ? complianceSubmissionsData[submissionIndex].overallComplianceNotes + "\n" : "") + `Update (${new Date().toLocaleDateString()}): ${notes}`;
    }
    if (newStatus === 'Reviewed - Compliant' || newStatus === 'Reviewed - Issues Found') {
        complianceSubmissionsData[submissionIndex].finalizedDate = new Date().toISOString();
    }
    console.log(`Compliance submission ${submissionId} status updated to ${newStatus}`);
    return { ...complianceSubmissionsData[submissionIndex] };
  });
};

export const assignReportSectionReviewer = async (submissionId, sectionId, reviewerId) => {
  return simulateApiCall(() => {
    const submissionIndex = complianceSubmissionsData.findIndex(sub => sub.submissionId === submissionId);
    if (submissionIndex === -1) {
      throw new Error(`Submission ${submissionId} not found.`);
    }
    const submission = complianceSubmissionsData[submissionIndex];
    const sectionIndex = submission.sections.findIndex(sec => sec.sectionId === sectionId);
    if (sectionIndex === -1) {
      throw new Error(`Section ${sectionId} in submission ${submissionId} not found.`);
    }
    submission.sections[sectionIndex].assignedReviewerId = reviewerId;
    submission.sections[sectionIndex].status = 'Under Review';
    console.log(`Section ${sectionId} in submission ${submissionId} assigned to ${reviewerId}`);
    return { ...submission };
  });
};

export const updateSectionReview = async (submissionId, sectionId, status, reviewNotes, reviewerId) => {
    return simulateApiCall(() => {
        const submissionIndex = complianceSubmissionsData.findIndex(sub => sub.submissionId === submissionId);
        if (submissionIndex === -1) throw new Error(`Submission ${submissionId} not found.`);

        const sectionIndex = complianceSubmissionsData[submissionIndex].sections.findIndex(sec => sec.sectionId === sectionId);
        if (sectionIndex === -1) throw new Error(`Section ${sectionId} not found in submission ${submissionId}.`);

        complianceSubmissionsData[submissionIndex].sections[sectionIndex].status = status;
        complianceSubmissionsData[submissionIndex].sections[sectionIndex].reviewNotes = reviewNotes;
        complianceSubmissionsData[submissionIndex].sections[sectionIndex].assignedReviewerId = reviewerId;
        complianceSubmissionsData[submissionIndex].sections[sectionIndex].reviewDate = new Date().toISOString();

        console.log(`Section ${sectionId} of sub ${submissionId} updated. Status: ${status}`);
        return { ...complianceSubmissionsData[submissionIndex] };
    });
};


export const getAIAssessmentForSubmission = async (submissionId) => {
    const submissionData = await getComplianceSubmissionDetail(submissionId);
    if (!submissionData) {
        throw new Error("Submission not found");
    }
    const entityData = await getEntityById(submissionData.entityId);

    // NEW: Get the actual file objects from document IDs
    const files = [];
    if (submissionData.attachments && submissionData.attachments.length > 0) {
        console.log(`Found ${submissionData.attachments.length} attachments for submission ${submissionId}`);
        for (const docId of submissionData.attachments) {
            try {
                const doc = await getDocumentById(docId);
                if (doc && doc.fileObject) {
                    console.log(`Adding file: ${doc.fileName} (${doc.fileObject.size} bytes)`);
                    files.push(doc.fileObject);
                } else {
                    console.warn(`Document ${docId} found but no fileObject available`);
                }
            } catch (error) {
                console.warn(`Failed to retrieve document ${docId}:`, error);
            }
        }
    }

    // Create FormData to send files + JSON
    const formData = new FormData();
    formData.append('submissionId', submissionId);
    formData.append('submissionData', JSON.stringify(submissionData));
    formData.append('entityData', JSON.stringify(entityData));
    
    // Add files
    files.forEach((file) => {
        formData.append('documents', file);
    });

    console.log(`Sending AI assessment request with ${files.length} files`);

    const response = await fetch('http://localhost:3001/api/reporting/generate-ai-report', {
        method: 'POST',
        // Remove Content-Type header to let browser set it for multipart/form-data
        body: formData,
    });

    if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.error || "Failed to generate AI report from the server.");
    }

    return response.json();
};


// --- NEW FUNCTIONS FOR REPORT SUBMISSION ---

let nextDocId = documentsData.length + 1;
const generateNewDocumentId = () => `doc_${String(nextDocId++).padStart(3, '0')}`;

const uploadDocument = (fileObject, documentType, uploadedBy) => {
    if (!fileObject || !documentType) {
        throw new Error("File object and document type are required.");
    }
    const newDocId = generateNewDocumentId();
    const newDocument = {
        documentId: newDocId,
        fileName: fileObject.name,
        documentType: documentType,
        version: "1.0",
        uploadDate: new Date().toISOString().split('T')[0],
        uploadedBy: uploadedBy,
        mimeType: fileObject.type,
        fileObject: fileObject, // Store the actual File object for downloads
        dummyFileContentLink: "/dummy_documents/generic_text_document.txt", // Placeholder link (fallback)
        description: `Document submitted for ${documentType} by ${uploadedBy}.`
    };
    documentsData.push(newDocument);
    console.log("Uploaded new document:", newDocument);
    return newDocId;
};

let nextSubmissionId = complianceSubmissionsData.length + 9000; // Start high to avoid collision
const generateNewSubmissionId = () => `sub_${nextSubmissionId++}`;

export const createComplianceSubmission = async (submissionPayload) => {
    return simulateApiCall(async () => {
        const { entityDetails, reportDetails, files } = submissionPayload;

        // 1. Upload all documents and collect their IDs
        const attachmentIds = [];
        for (const fileKey in files) {
            const fileOrFiles = files[fileKey];
            if (fileOrFiles) {
                if (Array.isArray(fileOrFiles)) { // Handle multi-file uploads
                    for (const file of fileOrFiles) {
                        const docId = uploadDocument(file, 'Supporting Document', entityDetails.reportingOfficer);
                        attachmentIds.push(docId);
                    }
                } else { // Handle single file uploads
                    const docId = uploadDocument(fileOrFiles, reportDetails.reportType, entityDetails.reportingOfficer);
                    attachmentIds.push(docId);
                }
            }
        }

        // 2. Find the relevant license for the entity
        const entityLicense = licensesData.find(lic => lic.entityId === entityDetails.entityId && lic.licenseStatus === 'Active');
        if (!entityLicense) {
            // In a real app, you might find the entity by license number instead
            console.warn(`No active license found for entity ${entityDetails.entityId}. Submission will not be linked to a license.`);
        }
        
        // 3. Create the new submission object
        const newSubmission = {
            submissionId: generateNewSubmissionId(),
            entityId: entityDetails.entityId,
            licenseId: entityLicense ? entityLicense.licenseId : null,
            reportType: reportDetails.reportType,
            reportingPeriod: reportDetails.reportingPeriod,
            submissionDate: new Date().toISOString().split('T')[0],
            dueDate: reportDetails.submissionDeadline || new Date().toISOString().split('T')[0],
            status: 'Submitted',
            assignedSupervisorId: 'reg_001', // Default assignment
            reviewDueDate: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
            sections: [
                {
                    sectionId: `sec_main_${Date.now()}`,
                    sectionName: 'Primary Report Content',
                    status: 'Pending Review',
                    fieldValues: submissionPayload.businessMetrics,
                }
            ],
            attachments: attachmentIds,
            overallComplianceNotes: `Submitted by ${entityDetails.reportingOfficer}.`,
        };

        complianceSubmissionsData.push(newSubmission);
        console.log("Created new compliance submission:", newSubmission);
        return newSubmission;
    });
};