/**
 * @typedef {Object} SanctionScreeningDetail
 * @property {string} overallScreeningStatus - (e.g., "Clear", "Pending Review", "Potential Match Found").
 * @property {string} lastScreeningDate - ISO date string.
 * @property {Array<{partyId: string, partyName: string, screeningResult: string, matchDetails?: string, listsChecked: string[]}>} screenedParties - Details for each screened individual.
 * @property {string} [adjudicationNotes] - Notes if a manual review occurred.
 * @property {string} [adjudicatedByStaffId] - Links to RegulatorStaff.staffId.
 */

/**
 * @typedef {Object} CommunicationLogEntry
 * @property {string} logId - Unique ID for the log entry.
 * @property {string} date - ISO date string.
 * @property {string} type - (e.g., "Email", "Call", "Internal Note").
 * @property {string} summary - Summary of the communication.
 * @property {string} loggedByStaffId - Links to RegulatorStaff.staffId.
 */

/**
 * @typedef {Object} LicenseApplication
 * @property {string} applicationId - Unique Application Number.
 * @property {string} productId - Links to Product.productId.
 * @property {string} entityId - Links to Entity.entityId.
 * @property {string} licenseTypeSought - Matches Product.licenseTypeRequired.
 * @property {string} applicationType - (e.g., "New License", "License Renewal").
 * @property {string} submissionDate - ISO date string.
 * @property {string} receivedDate - ISO date string.
 * @property {string} source - (e.g., "Direct Portal", "Sandbox").
 * @property {string} applicationStatus - (e.g., "Approved", "In Review", "Denied", "Submitted", "Initial Review", "Detailed Review", "Awaiting Decision").
 * @property {string} statusLastUpdated - ISO date string.
 * @property {string} assignedReviewerId - Links to RegulatorStaff.staffId (Lead Reviewer).
 * @property {string[]} [additionalReviewerIds] - Array of RegulatorStaff.staffId for other assigned reviewers. Initialize as [] if none.
 * @property {string} reviewTeam - Text (e.g., "Alpha Review Team").
 * @property {string} [reviewDeadlineSLA] - ISO date string.
 * @property {string[]} supportingDocumentIds - Array of Document.documentId.
 * @property {CommunicationLogEntry[]} communicationLog - Array of communication log objects.
 * @property {SanctionScreeningDetail} sanctionScreening - Detailed sanction screening information.
 * @property {string[]} [generalNotes] - Array of general notes strings. // NEW FIELD
 * @property {string} [decision] - ("Approved" or "Denied").
 * @property {string} [decisionDate] - ISO date string.
 * @property {string} [decisionReason] - Text, especially for "Denied".
 * @property {string} [effectiveLicenseId] - If "Approved", links to the License.licenseId.
 */

// Helper function to generate a random date in the past
function getRandomPastDate(startDate, endDate) {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const randomTime = start + Math.random() * (end - start);
  return new Date(randomTime).toISOString().split('T')[0];
}

// Helper function to generate a random date in the future
function getRandomFutureDate(startDate, daysAhead) {
  const start = new Date(startDate).getTime();
  const randomDays = Math.floor(Math.random() * daysAhead) + 1; // 1 to `daysAhead`
  const futureTime = start + randomDays * 24 * 60 * 60 * 1000;
  return new Date(futureTime).toISOString().split('T')[0];
}

const staffIds = ["reg_001", "reg_002", "reg_003", "reg_004", "reg_005", "reg_006", "reg_007", "reg_008"];
const documentIds = ["doc_001", "doc_002", "doc_003", "doc_004", "doc_005", "doc_006", "doc_007", "doc_008", "doc_009", "doc_010", "doc_011", "doc_012"];
const reviewTeams = ["Alpha Review Team", "Beta Review Team", "Gamma Review Team"];
const communicationTypes = ["Email", "Call", "Internal Note"];
const applicationSources = ["Direct Portal", "Sandbox"];
const applicationTypes = ["New License", "License Renewal"];

// Product details from products.js (assuming all 24 products are used)
const productDetails = [
    { productId: "prod_001", entityId: "ent_001", licenseTypeRequired: "Payment Institution License" },
    { productId: "prod_002", entityId: "ent_001", licenseTypeRequired: "Payment Institution License" },
    { productId: "prod_003", entityId: "ent_002", licenseTypeRequired: "E-Money Institution License" },
    { productId: "prod_004", entityId: "ent_003", licenseTypeRequired: "E-Money Institution License" },
    { productId: "prod_005", entityId: "ent_004", licenseTypeRequired: "Crypto Asset Service Provider License" },
    { productId: "prod_006", entityId: "ent_005", licenseTypeRequired: "Crypto Asset Service Provider License" },
    { productId: "prod_007", entityId: "ent_006", licenseTypeRequired: "Investment Firm License" },
    { productId: "prod_008", entityId: "ent_007", licenseTypeRequired: "Investment Firm License" },
    { productId: "prod_009", entityId: "ent_008", licenseTypeRequired: "Credit Institution License" },
    { productId: "prod_010", entityId: "ent_009", licenseTypeRequired: "Credit Institution License" },
    { productId: "prod_011", entityId: "ent_010", licenseTypeRequired: "PISP/AISP License" },
    { productId: "prod_012", entityId: "ent_011", licenseTypeRequired: "PISP/AISP License" },
    { productId: "prod_013", entityId: "ent_012", licenseTypeRequired: "Credit Institution License" },
    { productId: "prod_014", entityId: "ent_013", licenseTypeRequired: "Crypto Asset Service Provider License" },
    { productId: "prod_015", entityId: "ent_014", licenseTypeRequired: "Payment Institution License" },
    { productId: "prod_016", entityId: "ent_015", licenseTypeRequired: "E-Money Institution License" },
    { productId: "prod_017", entityId: "ent_016", licenseTypeRequired: "Payment Institution License" },
    { productId: "prod_018", entityId: "ent_017", licenseTypeRequired: "PISP/AISP License" },
    { productId: "prod_019", entityId: "ent_018", licenseTypeRequired: "Investment Firm License" },
    { productId: "prod_020", entityId: "ent_019", licenseTypeRequired: "Crypto Asset Service Provider License" },
    { productId: "prod_021", entityId: "ent_020", licenseTypeRequired: "Crypto Asset Service Provider License" },
    { productId: "prod_022", entityId: "ent_021", licenseTypeRequired: "PISP/AISP License" },
    { productId: "prod_023", entityId: "ent_022", licenseTypeRequired: "Payment Institution License" },
    { productId: "prod_024", entityId: "ent_023", licenseTypeRequired: "Investment Firm License" },
];

/** @type {LicenseApplication[]} */
const licenseApplications = [];

const NUM_APPROVED = 12;
const NUM_IN_REVIEW = 6;
const NUM_DENIED = 6; // Total 24

// Generate Approved Applications
for (let i = 0; i < NUM_APPROVED; i++) {
  const appNum = i + 1;
  const product = productDetails[i];
  const submissionDate = getRandomPastDate("2024-01-01", "2024-09-30");
  const receivedDate = new Date(new Date(submissionDate).getTime() + Math.floor(Math.random() * 3 +1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const decisionDateVal = getRandomPastDate(new Date(new Date(receivedDate).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], "2025-03-31");
  const statusLastUpdated = decisionDateVal;
  const assignedReviewer = staffIds[Math.floor(Math.random() * staffIds.length)];
  const additionalReviewers = [];
  if (Math.random() < 0.3) {
    let addReviewer = staffIds[Math.floor(Math.random() * staffIds.length)];
    if (addReviewer !== assignedReviewer) additionalReviewers.push(addReviewer);
  }

  const communicationLog = [];
  const numLogs = Math.floor(Math.random() * 3) + 1;
  let lastLogDate = receivedDate;
  for (let j = 0; j < numLogs; j++) {
    const logDate = getRandomPastDate(lastLogDate, decisionDateVal);
    communicationLog.push({
      logId: `clog_${appNum}_${j+1}`,
      date: logDate,
      type: communicationTypes[Math.floor(Math.random() * communicationTypes.length)],
      summary: `Log ${j+1}: Discussed [Topic ${j+1}]. Status: Resolved.`,
      loggedByStaffId: staffIds[Math.floor(Math.random() * staffIds.length)],
    });
    lastLogDate = logDate;
  }
  communicationLog.sort((a, b) => new Date(a.date) - new Date(b.date));

  licenseApplications.push({
    applicationId: `APP-${String(new Date(submissionDate).getFullYear()).slice(-2)}${String(new Date(submissionDate).getMonth() + 1).padStart(2, '0')}-${String(appNum).padStart(4, '0')}`,
    productId: product.productId,
    entityId: product.entityId,
    licenseTypeSought: product.licenseTypeRequired,
    applicationType: i % 6 === 0 ? "License Renewal" : "New License",
    submissionDate: submissionDate,
    receivedDate: receivedDate,
    source: applicationSources[Math.floor(Math.random() * applicationSources.length)],
    applicationStatus: "Approved",
    statusLastUpdated: statusLastUpdated,
    assignedReviewerId: assignedReviewer,
    additionalReviewerIds: additionalReviewers,
    reviewTeam: reviewTeams[i % reviewTeams.length],
    supportingDocumentIds: [...new Set(Array.from({length: Math.floor(Math.random() * 5) + 3}, () => documentIds[Math.floor(Math.random() * documentIds.length)]))],
    communicationLog: communicationLog,
    sanctionScreening: {
      overallScreeningStatus: "Clear",
      lastScreeningDate: getRandomPastDate(receivedDate, new Date(new Date(receivedDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] ),
      screenedParties: [
        { partyId: `person_dir_${appNum}`, partyName: `Director ${appNum} Name`, screeningResult: "Clear", listsChecked: ["OFAC", "UN", "EU", "Local List A"] },
        { partyId: `person_ubo_${appNum}`, partyName: `UBO ${appNum} Name`, screeningResult: "Clear", listsChecked: ["OFAC", "UN", "EU", "Local List B"] }
      ],
      adjudicationNotes: "All parties cleared through initial screening.",
      adjudicatedByStaffId: assignedReviewer,
    },
    generalNotes: [], // INITIALIZE NEW FIELD
    decision: "Approved",
    decisionDate: decisionDateVal,
    decisionReason: "The application has successfully met all stipulated regulatory criteria and demonstrated full operational preparedness.",
    effectiveLicenseId: `LIC-${String(new Date(decisionDateVal).getFullYear())}-${String(appNum).padStart(3, '0')}`,
  });
}

// Generate In Review Applications
const inReviewStatuses = ["Initial Review", "Detailed Review", "Awaiting Decision", "Submitted"];
for (let i = 0; i < NUM_IN_REVIEW; i++) {
  const appNum = NUM_APPROVED + i + 1;
  const product = productDetails[NUM_APPROVED + i];
  const submissionDate = getRandomPastDate("2024-11-01", "2025-04-30");
  const receivedDate = new Date(new Date(submissionDate).getTime() + Math.floor(Math.random() * 3+1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const statusLastUpdated = getRandomPastDate(receivedDate, "2025-05-13");
  const assignedReviewer = staffIds[Math.floor(Math.random() * staffIds.length)];
  const currentAppStatus = inReviewStatuses[Math.floor(Math.random() * inReviewStatuses.length)];
  const additionalReviewers = [];
  if (Math.random() < 0.5) {
    let addReviewer1 = staffIds[Math.floor(Math.random() * staffIds.length)];
    if (addReviewer1 !== assignedReviewer) additionalReviewers.push(addReviewer1);
    if (Math.random() < 0.3 && additionalReviewers.length > 0) {
        let addReviewer2 = staffIds[Math.floor(Math.random() * staffIds.length)];
        if (addReviewer2 !== assignedReviewer && !additionalReviewers.includes(addReviewer2)) additionalReviewers.push(addReviewer2);
    }
  }

  const communicationLog = [];
  const numLogs = Math.floor(Math.random() * 2) + 1;
  let lastLogDate = receivedDate;
  for (let j = 0; j < numLogs; j++) {
    const logDate = getRandomPastDate(lastLogDate, statusLastUpdated);
    communicationLog.push({
      logId: `clog_${appNum}_${j+1}`,
      date: logDate,
      type: communicationTypes[Math.floor(Math.random() * communicationTypes.length)],
      summary: `Log ${j+1}: Further information requested on [Topic Area ${j+1}]. Applicant acknowledged.`,
      loggedByStaffId: staffIds[Math.floor(Math.random() * staffIds.length)],
    });
    lastLogDate = logDate;
  }
  communicationLog.sort((a, b) => new Date(a.date) - new Date(b.date));

  const screeningStatusOptions = ["Clear", "Pending Review", "Potential Match Found"];
  const currentScreeningStatus = screeningStatusOptions[Math.floor(Math.random() * screeningStatusOptions.length)];

  licenseApplications.push({
    applicationId: `APP-${String(new Date(submissionDate).getFullYear()).slice(-2)}${String(new Date(submissionDate).getMonth() + 1).padStart(2, '0')}-${String(appNum).padStart(4, '0')}`,
    productId: product.productId,
    entityId: product.entityId,
    licenseTypeSought: product.licenseTypeRequired,
    applicationType: i % 7 === 0 ? "License Renewal" : "New License",
    submissionDate: submissionDate,
    receivedDate: receivedDate,
    source: applicationSources[Math.floor(Math.random() * applicationSources.length)],
    applicationStatus: currentAppStatus,
    statusLastUpdated: statusLastUpdated,
    assignedReviewerId: assignedReviewer,
    additionalReviewerIds: additionalReviewers,
    reviewTeam: reviewTeams[i % reviewTeams.length],
    reviewDeadlineSLA: currentAppStatus !== "Submitted" ? getRandomFutureDate(statusLastUpdated, 75) : undefined,
    supportingDocumentIds: [...new Set(Array.from({length: Math.floor(Math.random() * 6) + 4}, () => documentIds[Math.floor(Math.random() * documentIds.length)]))],
    communicationLog: communicationLog,
    sanctionScreening: {
      overallScreeningStatus: currentScreeningStatus,
      lastScreeningDate: getRandomPastDate(receivedDate, new Date(new Date(receivedDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] ),
      screenedParties: [
        { partyId: `person_dir_${appNum}`, partyName: `Director ${appNum} Name`, screeningResult: currentScreeningStatus === "Potential Match Found" ? "Potential Match Found" : "Clear", matchDetails: currentScreeningStatus === "Potential Match Found" ? "Possible link to individual on Watchlist C." : undefined, listsChecked: ["OFAC", "UN", "EU", "Local List A", "Interpol Watch"] },
        { partyId: `person_ubo_${appNum}`, partyName: `UBO ${appNum} Name`, screeningResult: "Clear", listsChecked: ["OFAC", "UN", "EU", "Local List B"] }
      ],
      adjudicationNotes: currentScreeningStatus === "Potential Match Found" ? "MLRO notified. Awaiting further review and potential EDD." : (currentScreeningStatus === "Pending Review" ? "Automated screening pending completion or manual check." : undefined),
      adjudicatedByStaffId: currentScreeningStatus === "Clear" ? assignedReviewer : undefined,
    },
    generalNotes: [], // INITIALIZE NEW FIELD
    decision: undefined,
    decisionDate: undefined,
    decisionReason: undefined,
    effectiveLicenseId: undefined,
  });
}

// Generate Denied Applications
const denialReasons = [
  "Submitted documentation was found to be insufficient and incomplete despite follow-up requests.",
  "The applicant failed to adequately demonstrate compliance with minimum capital adequacy requirements.",
  "Significant concerns were identified regarding the viability of the proposed business model and associated risk management framework.",
  "The AML/CFT controls and procedures outlined by the applicant were deemed unsatisfactory and not robust enough.",
  "A key individual named in the application did not pass the fit and proper assessment due to adverse findings in sanction screening.",
  "The business plan submitted lacked essential details and contained unrealistic financial projections.",
  "The proposed technological infrastructure was assessed as inadequate to support the scale and nature of the intended services.",
  "The applicant did not demonstrate a sufficient understanding of, or commitment to, ongoing regulatory obligations.",
  "Identified operational risks were significant, and the proposed mitigation strategies were found to be inadequate.",
  "Sanction screening processes revealed confirmed adverse information concerning key controllers or beneficial owners."
];
for (let i = 0; i < NUM_DENIED; i++) {
  const appNum = NUM_APPROVED + NUM_IN_REVIEW + i + 1;
  const product = productDetails[NUM_APPROVED + NUM_IN_REVIEW + i];
  const submissionDate = getRandomPastDate("2024-03-01", "2024-12-31");
  const receivedDate = new Date(new Date(submissionDate).getTime() + Math.floor(Math.random() * 3+1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const decisionDateVal = getRandomPastDate(new Date(new Date(receivedDate).getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], "2025-04-30");
  const statusLastUpdated = decisionDateVal;
  const assignedReviewer = staffIds[Math.floor(Math.random() * staffIds.length)];
  const additionalReviewers = [];
    if (Math.random() < 0.1) {
        let addReviewer = staffIds[Math.floor(Math.random() * staffIds.length)];
        if (addReviewer !== assignedReviewer) additionalReviewers.push(addReviewer);
    }

  const communicationLog = [];
  const numLogs = Math.floor(Math.random() * 2) + 2;
  let lastLogDate = receivedDate;
  for (let j = 0; j < numLogs; j++) {
    const logDate = getRandomPastDate(lastLogDate, decisionDateVal);
    communicationLog.push({
      logId: `clog_${appNum}_${j+1}`,
      date: logDate,
      type: communicationTypes[Math.floor(Math.random() * communicationTypes.length)],
      summary: `Log ${j+1}: Final request for [Missing Document ${j+1}] not fulfilled. Concerns raised about [Concern Area ${j+1}].`,
      loggedByStaffId: staffIds[Math.floor(Math.random() * staffIds.length)],
    });
    lastLogDate = logDate;
  }
  communicationLog.sort((a, b) => new Date(a.date) - new Date(b.date));

  const screeningStatusOptions = ["Clear", "Potential Match Found"];
  const currentScreeningStatus = i < 3 ? screeningStatusOptions[1] : screeningStatusOptions[0];

  licenseApplications.push({
    applicationId: `APP-${String(new Date(submissionDate).getFullYear()).slice(-2)}${String(new Date(submissionDate).getMonth() + 1).padStart(2, '0')}-${String(appNum).padStart(4, '0')}`,
    productId: product.productId,
    entityId: product.entityId,
    licenseTypeSought: product.licenseTypeRequired,
    applicationType: "New License",
    submissionDate: submissionDate,
    receivedDate: receivedDate,
    source: applicationSources[Math.floor(Math.random() * applicationSources.length)],
    applicationStatus: "Denied",
    statusLastUpdated: statusLastUpdated,
    assignedReviewerId: assignedReviewer,
    additionalReviewerIds: additionalReviewers,
    reviewTeam: reviewTeams[i % reviewTeams.length],
    supportingDocumentIds: [...new Set(Array.from({length: Math.floor(Math.random() * 4) + 2}, () => documentIds[Math.floor(Math.random() * documentIds.length)]))],
    communicationLog: communicationLog,
    sanctionScreening: {
      overallScreeningStatus: currentScreeningStatus,
      lastScreeningDate: getRandomPastDate(receivedDate, new Date(new Date(receivedDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] ),
      screenedParties: [
        { partyId: `person_dir_${appNum}`, partyName: `Director ${appNum} Name`, screeningResult: "Clear", listsChecked: ["OFAC", "UN", "EU"] },
        { partyId: `person_ubo_${appNum}`, partyName: `UBO ${appNum} Name`, screeningResult: currentScreeningStatus === "Potential Match Found" ? "Potential Match Found" : "Clear", matchDetails: currentScreeningStatus === "Potential Match Found" ? "Direct match on Sanction List Z for UBO." : undefined, listsChecked: ["OFAC", "UN", "EU", "National Sanctions List", "Global PEP"] }
      ],
      adjudicationNotes: currentScreeningStatus === "Potential Match Found" ? "Adverse finding confirmed for UBO. Denial recommended and processed based on this and other factors." : "Screening clear. Denial based on other application deficiencies.",
      adjudicatedByStaffId: staffIds[Math.floor(Math.random() * staffIds.length)],
    },
    generalNotes: [], // INITIALIZE NEW FIELD
    decision: "Denied",
    decisionDate: decisionDateVal,
    decisionReason: denialReasons[i % denialReasons.length],
    effectiveLicenseId: undefined,
  });
}

export default licenseApplications;