// src/data/enforcementData.js

/**
 * @typedef {Object} EnforcementCase
 * @property {string} id - Unique ID for the case.
 * @property {string} institution - The name of the institution.
 * @property {string} institutionId - The ID of the institution, linking to entities.js.
 * @property {string} breachSummary - A summary of the violation.
 * @property {string} trigger - What initiated the case.
 * @property {'New' | 'Investigation' | 'Management Approval' | 'Sanction Fulfillment' | 'Resolved'} status - The current status of the case.
 * @property {string} assignedOfficer - The name of the lead officer.
 * @property {string} caseOpened - ISO date string.
 * @property {string[]} evidence - Array of document IDs or evidence names.
 * @property {Object[]} actionLog - A log of actions taken on the case.
 * @property {Object} [sanction] - Details of any sanction applied.
 */

/** @type {EnforcementCase[]} */
export const mockEnforcementCases = [
    { id: 'ENF-2025-001', institution: 'Pioneer Holdings', institutionId: 'ent_024', breachSummary: 'Failure to report suspicious transactions within the required timeframe.', trigger: 'High-severity finding in Examination EXAM-2024-008', status: 'Investigation', assignedOfficer: 'Frank Castle', caseOpened: '2025-06-15', evidence: ['EXAM-2024-008-Finding-03', 'TransactionLogs-May2025.csv'], actionLog: [{ date: '2025-06-15', action: 'Case initiated and assigned.'}, { date: '2025-06-20', action: 'Show Cause notice issued to entity.' }] },
    { id: 'ENF-2025-002', institution: 'Lighthouse Financial Services', institutionId: 'ent_013', breachSummary: 'Misleading advertising claiming "guaranteed returns".', trigger: 'Market Conduct module flag on public advertisement.', status: 'Sanction Fulfillment', assignedOfficer: 'Carol Danvers', caseOpened: '2025-05-10', evidence: ['Ad-Screenshot-2025-05-09.png'], actionLog: [{ date: '2025-05-10', action: 'Case initiated.' }, { date: '2025-05-25', action: 'Management approved sanction.'}, {date: '2025-06-01', action: 'Monetary penalty of $50,000 issued.'}], sanction: { type: 'Monetary Penalty', amount: '$50,000', status: 'Payment Overdue'} },
    { id: 'ENF-2025-003', institution: 'Pinnacle Stone Investments', institutionId: 'ent_002', breachSummary: 'Critical failure of AML/CFT controls.', trigger: 'Risk Assessment module score downgrade.', status: 'Management Approval', assignedOfficer: 'Frank Castle', caseOpened: '2025-06-01', evidence: ['Risk-Assessment-Report-Q2-2025.pdf'], actionLog: [{ date: '2025-06-01', action: 'Case initiated.' }, { date: '2025-06-18', action: 'Legal review completed.'}, { date: '2025-06-22', action: 'Case escalated for management approval.'}] },
];

/**
 * @typedef {Object} Sanction
 * @property {string} type - The type of sanction.
 * @property {string} [range] - Monetary range, if applicable.
 * @property {string} [description] - Description of the sanction.
 */

/** @type {Sanction[]} */
export const mockSanctionsLibrary = [
    { type: 'Monetary Penalty', range: '$5,000 - $1,000,000' },
    { type: 'Public Reprimand', description: 'Official public statement of non-compliance.' },
    { type: 'Business Restriction', description: 'Prohibition on offering specific products or services.' },
    { type: 'License Suspension', description: 'Temporary suspension of the operating license.' },
    { type: 'License Revocation', description: 'Permanent revocation of the operating license.' },
];

/**
 * @typedef {Object} AnalyticsData
 * @property {Object[]} caseTrend - Data for case trend chart.
 * @property {Object[]} violationTypes - Data for violation types chart.
 */

/** @type {AnalyticsData} */
export const mockAnalyticsData = {
    caseTrend: [
        { month: 'Jan', cases: 5 }, { month: 'Feb', cases: 4 }, { month: 'Mar', cases: 6 },
        { month: 'Apr', cases: 8 }, { month: 'May', cases: 7 }, { month: 'Jun', cases: 9 },
    ],
    violationTypes: [
        { type: 'AML/CFT', count: 12 }, { type: 'Misleading Ads', count: 8 }, { type: 'Prudential Breach', count: 5 },
        { type: 'Consumer Harm', count: 4 }, { type: 'Reporting Failure', count: 3 },
    ]
};