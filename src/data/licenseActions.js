// src/data/licenseActions.js

/**
 * @typedef {Object} LicenseActionInternalNote
 * @property {string} noteId - Unique ID for the note.
 * @property {string} staffId - Links to RegulatorStaff.staffId.
 * @property {string} date - ISO date string.
 * @property {string} text - The content of the note.
 */

/**
 * @typedef {Object} LicenseAction
 * @property {string} actionId - Unique ID for this action (e.g., "LCA-001").
 * @property {string} licenseId - Links to the License.licenseId that is the subject of this action.
 * @property {'Suspend License' | 'Lift Suspension' | 'Revoke License'} actionType - The type of action being proposed/taken.
 * @property {string} creationDate - ISO date string: When the action workflow was initiated.
 * @property {string} initiatingStaffId - RegulatorStaff.staffId who initiated this action.
 * @property {'Draft' | 'Pending Review' | 'Awaiting Decision' | 'Approved' | 'Rejected' | 'Withdrawn'} status - Current status of this action workflow. // Changed 'Denied' to 'Rejected' for action workflow status
 * @property {string} [reasonCategory] - Selected reason from a predefined list.
 * @property {string} [reasonDetails] - Detailed textual explanation for the action.
 * @property {string[]} [supportingDocumentIds] - Array of Document.documentId.
 * @property {LicenseActionInternalNote[]} [internalReviewNotes] - Array of internal notes specific to this action.
 * @property {Object} [internalReviewChecklistData] - Object storing the state of the internal review checklist. // NEW FIELD
 * @property {string} [decision] - The outcome of the review (e.g., "Proceed with Suspension", "Reject Suspension Request").
 * @property {string} [decisionDate] - ISO date string of when the decision was made.
 * @property {string} [decisionByStaffId] - RegulatorStaff.staffId who made the decision.
 * @property {string} [decisionNotes] - Notes accompanying the decision.
 * @property {string} [effectiveDate] - ISO date string: When the license status change becomes effective.
 * @property {string} [originalLicenseStatus] - The status of the license when this action was initiated.
 * @property {string} [lastUpdated] - ISO date string for when the action itself was last updated. // NEW FIELD
 */

/** @type {LicenseAction[]} */
const licenseActionsData = [
  // Example (can be removed or kept for testing):
  /*
  {
    actionId: "LCA-000", // Ensure uniqueness if using
    licenseId: "LIC-2024-001",
    actionType: "Suspend License",
    creationDate: "2025-05-10T10:00:00.000Z",
    initiatingStaffId: "reg_001",
    status: "Draft", // Start as Draft
    reasonCategory: "",
    reasonDetails: "",
    supportingDocumentIds: [],
    internalReviewNotes: [],
    internalReviewChecklistData: { item1: false, item2: false, item3: false, item4: false, item5: false, item6_suspend: false }, // Example initial state
    decision: undefined,
    decisionDate: undefined,
    decisionByStaffId: undefined,
    decisionNotes: undefined,
    effectiveDate: undefined,
    originalLicenseStatus: "Active",
    lastUpdated: "2025-05-10T10:00:00.000Z",
  }
  */
];

export const predefinedSuspensionReasons = [
  "AML/CFT Non-Compliance",
  "Reporting Failure (Regulatory)",
  "Capital Adequacy Breach",
  "Misleading Conduct / Misrepresentation",
  "Sanction Violation",
  "Consumer Protection Violations",
  "Operational Integrity Concerns",
  "Failure to Cooperate with Regulator",
  "Pending Investigation (Serious Concerns)",
  "Non-Payment of Fees",
  "Other (Specify in Details)",
];

export const predefinedLiftSuspensionReasons = [
  "Compliance Issues Rectified",
  "Investigation Concluded - No Adverse Findings",
  "Administrative Error in Suspension",
  "Satisfactory Remediation Plan Implemented",
  "Court Order / Legal Mandate",
  "Other (Specify in Details)",
];

export const predefinedRevocationReasons = [
    "Persistent Non-Compliance Post-Suspension",
    "Severe Sanction Violation (Confirmed)",
    "Insolvency / Bankruptcy",
    "Fraudulent Activity Confirmed",
    "License Holder Request (Voluntary)",
    "Other (Specify in Details)",
];


export default licenseActionsData;