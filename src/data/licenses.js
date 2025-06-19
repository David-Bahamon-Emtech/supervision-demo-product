/**
 * @typedef {Object} License
 * @property {string} licenseId - Unique ID for this license (matches effectiveLicenseId from the application).
 * @property {string} licenseNumber - Official License Number issued.
 * @property {string} productId - Links to Product.productId.
 * @property {string} entityId - Links to Entity.entityId.
 * @property {string} applicationIdGranted - The applicationId that resulted in this license.
 * @property {string} licenseType - The specific type of license granted.
 * @property {string} issueDate - ISO date string (matches decisionDate of the approved application).
 * @property {string} expiryDate - ISO date string.
 * @property {string} [lastRenewalDate] - ISO date string.
 * @property {string} [nextRenewalDueDate] - ISO date string.
 * @property {string} licenseStatus - (e.g., "Active", "Suspended", "Revoked", "Expired", "Pending Renewal").
 * @property {string} [statusReason] - If not "Active".
 *
 * NEW RENEWAL FIELDS:
 * @property {string} [renewalStatus] - (e.g., "Not Started", "Pending Submission", "Submitted", "Under Review", "Renewal Approved", "Renewal Denied", "Requires Clarification").
 * @property {string} [renewalApplicationId] - Optional: If renewal spawns a new application record.
 * @property {string} [renewalSubmissionDate] - ISO date string for the current renewal cycle.
 * @property {string} [renewalLastUpdated] - ISO date string for the last update to renewal info.
 * @property {string[]} [renewalNotes] - Array of notes specific to this renewal cycle.
 * @property {string[]} [renewalDocumentIds] - IDs of documents submitted for this renewal.
 * @property {boolean} [complianceHistoryReviewed] - Flag for compliance history review step.
 */

// This data is now based on the first 12 approved applications
const approvedAppDetails = [
  { appNum: 1,  prodId: 'prod_001', entId: 'ent_001', licType: 'Payment Institution License',          appType: 'New License',     decDate: '2024-03-10', effLicId: 'LIC-2024-001', appId: 'APP-2401-0001' },
  { appNum: 2,  prodId: 'prod_002', entId: 'ent_001', licType: 'Payment Institution License',        appType: 'License Renewal', decDate: '2024-04-15', effLicId: 'LIC-2024-002', appId: 'APP-2402-0002' },
  { appNum: 3,  prodId: 'prod_003', entId: 'ent_002', licType: 'E-Money Institution License', appType: 'New License',     decDate: '2024-05-20', effLicId: 'LIC-2024-003', appId: 'APP-2403-0003' },
  { appNum: 4,  prodId: 'prod_004', entId: 'ent_003', licType: 'E-Money Institution License',            appType: 'New License',     decDate: '2024-02-25', effLicId: 'LIC-2024-004', appId: 'APP-2401-0004' },
  { appNum: 5,  prodId: 'prod_005', entId: 'ent_004', licType: 'Crypto Asset Service Provider License',         appType: 'New License',     decDate: '2024-06-01', effLicId: 'LIC-2024-005', appId: 'APP-2403-0005' },
  { appNum: 6,  prodId: 'prod_006', entId: 'ent_005', licType: 'Crypto Asset Service Provider License',                  appType: 'New License',     decDate: '2024-07-10', effLicId: 'LIC-2024-006', appId: 'APP-2404-0006' },
  { appNum: 7,  prodId: 'prod_007', entId: 'ent_006', licType: 'Investment Firm License',          appType: 'License Renewal', decDate: '2024-08-15', effLicId: 'LIC-2024-007', appId: 'APP-2405-0007' },
  { appNum: 8,  prodId: 'prod_008', entId: 'ent_007', licType: 'Investment Firm License',            appType: 'New License',     decDate: '2024-09-20', effLicId: 'LIC-2024-008', appId: 'APP-2406-0008' },
  { appNum: 9,  prodId: 'prod_009', entId: 'ent_008', licType: 'Credit Institution License',          appType: 'New License',     decDate: '2024-10-01', effLicId: 'LIC-2024-009', appId: 'APP-2407-0009' },
  { appNum: 10, prodId: 'prod_010', entId: 'ent_009', licType: 'Credit Institution License', appType: 'New License',     decDate: '2024-11-05', effLicId: 'LIC-2024-010', appId: 'APP-2408-0010' },
  { appNum: 11, prodId: 'prod_011', entId: 'ent_010', licType: 'PISP/AISP License',            appType: 'New License',     decDate: '2024-12-10', effLicId: 'LIC-2024-011', appId: 'APP-2409-0011' },
  { appNum: 12, prodId: 'prod_012', entId: 'ent_011', licType: 'PISP/AISP License',            appType: 'License Renewal', decDate: '2025-01-15', effLicId: 'LIC-2025-012', appId: 'APP-2410-0012' }
];


/** @type {License[]} */
const licenses = approvedAppDetails.map((app, index) => {
const issueDate = new Date(app.decDate);
const expiryYears = (app.appNum % 3) + 1; // 1, 2, or 3 years for variety
const expiryDate = new Date(issueDate);
expiryDate.setFullYear(issueDate.getFullYear() + expiryYears);

const nextRenewalDueDate = new Date(expiryDate);
nextRenewalDueDate.setDate(expiryDate.getDate() - 60); // 60 days before expiry

let licenseStatus = "Active";
let statusReason = undefined;
const today = new Date("2025-05-14"); // Current date for status check

if (expiryDate < today) {
  licenseStatus = "Expired";
  statusReason = "License period concluded.";
}

// Example: Make one license suspended (e.g., the 5th one, if not already expired)
if (index === 4 && licenseStatus === "Active") {
  licenseStatus = "Suspended";
  statusReason = "Pending investigation into recent operational discrepancies.";
}

let lastRenewalDateValue = undefined;
if (app.appType === "License Renewal") {
    const prevIssue = new Date(issueDate);
    // Assuming renewal term is same as original term for this calculation
    prevIssue.setFullYear(prevIssue.getFullYear() - expiryYears); 
    lastRenewalDateValue = prevIssue.toISOString().split('T')[0];
}

// Initialize new renewal fields
let renewalStatus = "Not Started";
// For demo, let's make a few licenses already in some stage of renewal
if (licenseStatus === "Active" && nextRenewalDueDate <= new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000) && nextRenewalDueDate > today ) { // Within 30 days of due date
    if (app.appNum % 4 === 0) renewalStatus = "Pending Submission";
    else if (app.appNum % 4 === 1) renewalStatus = "Submitted";
}
if (licenseStatus === "Active" && nextRenewalDueDate < today && expiryDate > today) { // Past due but not expired
    renewalStatus = "Pending Submission"; // Or a more urgent status
    licenseStatus = "Pending Renewal"; // Update main license status
}


return {
  licenseId: app.effLicId,
  licenseNumber: `${app.licType.substring(0,3).toUpperCase()}-${issueDate.getFullYear()}-${String(app.appNum).padStart(5, '0')}`,
  productId: app.prodId,
  entityId: app.entId,
  applicationIdGranted: app.appId,
  licenseType: app.licType,
  issueDate: app.decDate,
  expiryDate: expiryDate.toISOString().split('T')[0],
  lastRenewalDate: lastRenewalDateValue,
  nextRenewalDueDate: nextRenewalDueDate.toISOString().split('T')[0],
  licenseStatus: licenseStatus,
  statusReason: statusReason,

  // Initialize NEW RENEWAL FIELDS
  renewalStatus: (licenseStatus === "Active" || licenseStatus === "Pending Renewal") ? renewalStatus : undefined, // Only relevant for active/pending
  renewalApplicationId: undefined, // Assuming no separate app ID for renewal initially
  renewalSubmissionDate: renewalStatus === "Submitted" ? new Date(nextRenewalDueDate.getTime() - (Math.floor(Math.random() * 10) + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined, // if submitted, assume it was a bit before due date
  renewalLastUpdated: renewalStatus !== "Not Started" ? new Date().toISOString() : undefined,
  renewalNotes: [],
  renewalDocumentIds: [],
  complianceHistoryReviewed: renewalStatus === "Submitted" ? (Math.random() < 0.5) : false, // Randomly set for some submitted ones
};
});

// Correct applicationIdGranted to match the dynamic format from licenseApplications.js
licenses.forEach(lic => {
  const appDetail = approvedAppDetails.find(a => a.effLicId === lic.licenseId);
  if(appDetail) {
      // This logic for applicationIdGranted should ideally pull from the actual licenseApplications data
      // For now, we'll keep the existing logic which uses a proxy based on decision date for appNum.
      // If licenseApplications.js is already creating these IDs robustly, this step might be redundant or need adjustment
      // based on how `applicationIdGranted` should truly be sourced if not from the original appDetail directly.
      const subDate = new Date(appDetail.decDate); 
      const originalAppIdSubmissionYear = appDetail.appId.substring(4,6); // Extract YY from APP-YYMM-NNNN
      const originalAppIdSubmissionMonth = appDetail.appId.substring(6,8); // Extract MM
      
      // Attempt to use original APP ID's year/month if available and makes sense, otherwise stick to decision date derived.
      // This part is a bit tricky without directly joining with generated licenseApplications array.
      // For now, let's assume the appDetail.appId is the one we want.
      lic.applicationIdGranted = appDetail.appId;
  }
});


export default licenses;