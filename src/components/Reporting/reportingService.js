// src/components/Reporting/reportingService.js

import licenseCategoriesData from '../../data/licenseCategories.js';
import reportingMetricsData from '../../data/reportingMetrics.js';
import complianceSubmissionsData from '../../data/complianceSubmissions.js';
import entitiesData from '../../data/entities.js';
import licensesData from '../../data/licenses.js';
import productsData from '../../data/products.js';
import documentsData from '../../data/documents.js';
import regulatorStaffData from '../../data/regulatorStaff.js';
// import reportFrameworksData from '../../data/reportFrameworks'; // Uncomment if you implement reportFrameworks.js

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

export const getMetricsByLicenseCategory = async (categoryId) => {
  return simulateApiCall(() => reportingMetricsData.filter(metric => metric.licenseCategoryId === categoryId));
};

export const getEntitiesByLicenseCategory = async (categoryId) => {
  return simulateApiCall(() => {
    const category = licenseCategoriesData.find(cat => cat.id === categoryId);
    if (!category) return [];

    // Find all license types that fall under this category.
    // This is a simplified assumption; a more robust system might have a direct mapping
    // or look at product license types that match category names.
    // For now, we'll assume licenseTypeRequired in products directly relates to category names or keywords.
    const relevantLicenseTypes = productsData
        .filter(p => category.name.toLowerCase().includes(p.licenseTypeRequired.split(' ')[0].toLowerCase())) // Rough match
        .map(p => p.licenseTypeRequired);

    const uniqueRelevantLicenseTypes = [...new Set(relevantLicenseTypes)];

    const licensedEntityIds = licensesData
      .filter(lic => uniqueRelevantLicenseTypes.includes(lic.licenseType) && (lic.licenseStatus === 'Active' || lic.licenseStatus === 'Pending Renewal' || lic.licenseStatus === 'Suspended'))
      .map(lic => lic.entityId);

    return entitiesData.filter(entity => licensedEntityIds.includes(entity.entityId));
  });
};

export const getComplianceSubmissionsForEntity = async (entityId) => {
  return simulateApiCall(() => complianceSubmissionsData.filter(sub => sub.entityId === entityId).sort((a, b) => new Date(b.submissionDate || 0) - new Date(a.submissionDate || 0)));
};

export const getComplianceSubmissionDetail = async (submissionId) => {
  return simulateApiCall(() => complianceSubmissionsData.find(sub => sub.submissionId === submissionId) || null);
};

export const getDocumentById = async (docId) => { // Re-added from licensingService for convenience if needed directly
    return simulateApiCall(() => documentsData.find(doc => doc.documentId === docId) || null);
};

export const getStaffById = async (staffId) => { // Re-added from licensingService
    return simulateApiCall(() => regulatorStaffData.find(staff => staff.staffId === staffId) || null);
};

// --- UPDATE FUNCTIONS (Simulated) ---

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
        // finalizedByStaffId would be set based on logged-in user in a real app
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
    submission.sections[sectionIndex].status = 'Under Review'; // Or 'Pending Review'
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
        complianceSubmissionsData[submissionIndex].sections[sectionIndex].assignedReviewerId = reviewerId; // Ensure reviewer is logged
        complianceSubmissionsData[submissionIndex].sections[sectionIndex].reviewDate = new Date().toISOString();

        console.log(`Section ${sectionId} of sub ${submissionId} updated. Status: ${status}`);
        return { ...complianceSubmissionsData[submissionIndex] };
    });
};


export const addAttachmentToSubmission = async (submissionId, documentId) => {
  return simulateApiCall(() => {
    const submissionIndex = complianceSubmissionsData.findIndex(sub => sub.submissionId === submissionId);
    if (submissionIndex === -1) {
      throw new Error(`Submission ${submissionId} not found.`);
    }
    if (!complianceSubmissionsData[submissionIndex].attachments.includes(documentId)) {
      complianceSubmissionsData[submissionIndex].attachments.push(documentId);
    }
    console.log(`Document ${documentId} added to submission ${submissionId}`);
    return { ...complianceSubmissionsData[submissionIndex] };
  });
};

export const updateEntityComplianceReadiness = async (entityId, newStatus) => {
    return simulateApiCall(() => {
        const entityIndex = entitiesData.findIndex(e => e.entityId === entityId);
        if (entityIndex === -1) {
            throw new Error(`Entity ${entityId} not found.`);
        }
        entitiesData[entityIndex].complianceReadinessStatus = newStatus;
        console.log(`Entity ${entityId} complianceReadinessStatus updated to ${newStatus}`);
        return { ...entitiesData[entityIndex] };
    });
};


// --- Functions for Report Frameworks (if implemented later) ---
// export const getReportFramework = async (reportTypeName) => {
//   return simulateApiCall(() => reportFrameworksData.find(rf => rf.reportTypeName === reportTypeName) || null);
// };

// Add more service functions as needed for creating, updating, deleting report-related data.