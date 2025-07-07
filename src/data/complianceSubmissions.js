// src/data/complianceSubmissions.js

/**
 * @typedef {Object} ComplianceReportSection
 * @property {string} sectionId - Unique identifier for this section within the report (e.g., "sec_aml_kyc").
 * @property {string} sectionName - Display name of the report section (e.g., "KYC/CDD Procedures").
 * @property {'Compliant' | 'Non-Compliant' | 'Partially Compliant' | 'Not Applicable' | 'Pending Review' | 'Under Review'} status - Status of this specific section.
 * @property {string} [assignedReviewerId] - Links to RegulatorStaff.staffId for the person reviewing this section.
 * @property {string} [reviewNotes] - Notes specific to this section's review.
 * @property {string} [reviewDate] - ISO date string of when this section was reviewed.
 * @property {Object.<string, any>} [fieldValues] - Key-value pairs for data fields specific to this section, if using a structured report framework.
 * @property {string[]} [sectionAttachments] - Document IDs specific to this section.
 */

/**
 * @typedef {Object} ComplianceSubmission
 * @property {string} submissionId - Unique identifier for this submission (e.g., "sub_001").
 * @property {string} entityId - Links to Entity.entityId.
 * @property {string} licenseId - Links to License.licenseId that this submission pertains to.
 * @property {string} reportType - Identifier for the type of report (e.g., "PI_AML_Compliance_BiAnnual"). Should align with `relevantComplianceReportTypes` in licenseCategories.js.
 * @property {string} reportingPeriod - The period this report covers (e.g., "2024-H1", "2024-Q3", "2024").
 * @property {string} submissionDate - ISO date string for when the entity submitted the report.
 * @property {string} dueDate - ISO date string for when the report was due.
 * @property {'Pending Submission' | 'Submitted' | 'Under Review' | 'Requires Clarification' | 'Reviewed - Compliant' | 'Reviewed - Issues Found' | 'Late Submission'} status - Overall status of this submission.
 * @property {string} assignedSupervisorId - Links to RegulatorStaff.staffId for the primary supervisor overseeing this submission's review.
 * @property {string} [reviewDueDate] - ISO date string for when the internal review of this submission is due.
 * @property {ComplianceReportSection[]} sections - Array of report sections.
 * @property {string[]} attachments - Array of Document.documentId for general attachments to the submission.
 * @property {string} [overallComplianceNotes] - General notes by the supervisor on the overall submission.
 * @property {string} [finalizedDate] - ISO date string for when the review was finalized.
 * @property {string} [finalizedByStaffId] - StaffId who finalized the review.
 */

/** @type {ComplianceSubmission[]} */
const complianceSubmissions = [
    // --- NEW OVERDUE SUBMISSIONS (Added for Demo) ---
    {
      submissionId: 'sub_9001',
      entityId: 'ent_002', // Pinnacle Stone Investments
      licenseId: 'LIC-2024-003',
      reportType: 'EMI_FinancialCrime_Report_SemiAnnual',
      reportingPeriod: '2024-H2',
      submissionDate: null,
      dueDate: '2025-05-31', // Past due
      status: 'Pending Submission',
      assignedSupervisorId: 'reg_003',
      reviewDueDate: '2025-06-30',
      sections: [{ sectionId: 'sec_emi_fc_9001', sectionName: 'Semi-Annual Financial Crime Report', status: 'Pending Review' }],
      attachments: [],
      overallComplianceNotes: 'Submission is currently overdue.',
    },
    {
      submissionId: 'sub_9002',
      entityId: 'ent_003', // Ironclad Asset Partners
      licenseId: 'LIC-2024-004',
      reportType: 'EMI_Safeguarding_Arrangements_Quarterly',
      reportingPeriod: '2025-Q1',
      submissionDate: null,
      dueDate: '2025-04-15', // Past due
      status: 'Pending Submission',
      assignedSupervisorId: 'reg_007',
      reviewDueDate: '2025-05-15',
      sections: [{ sectionId: 'sec_emi_safeguard_9002', sectionName: 'Q1 Safeguarding Arrangements', status: 'Pending Review' }],
      attachments: [],
      overallComplianceNotes: 'Submission is currently overdue.',
    },
  
    // --- NEW RECENTLY FLAGGED SUBMISSIONS (Added for Demo) ---
    {
      submissionId: 'sub_9003',
      entityId: 'ent_004', // Bluehaven Wealth Advisors
      licenseId: 'LIC-2024-005',
      reportType: 'CASP_AML_Compliance_Quarterly',
      reportingPeriod: '2025-Q1',
      submissionDate: '2025-04-10',
      dueDate: '2025-04-15',
      status: 'Reviewed - Issues Found',
      assignedSupervisorId: 'reg_004',
      reviewDueDate: '2025-05-10',
      sections: [
        { sectionId: 'sec_casp_aml_9003', sectionName: 'AML Compliance Q1', status: 'Non-Compliant', assignedReviewerId: 'reg_004', reviewNotes: 'Identified several large-value transactions to unverified wallets that were not flagged by the TM system.', reviewDate: '2025-06-15' }
      ],
      attachments: ['doc_009'],
      overallComplianceNotes: 'Serious deficiencies found in transaction monitoring. Follow-up action required.',
      finalizedDate: '2025-06-20', // Recent
      finalizedByStaffId: 'reg_004'
    },
      {
      submissionId: 'sub_9004',
      entityId: 'ent_005', // TruNorth Equity
      licenseId: 'LIC-2024-006',
      reportType: 'CASP_ProofOfReserves_Quarterly',
      reportingPeriod: '2025-Q1',
      submissionDate: '2025-04-14',
      dueDate: '2025-04-15',
      status: 'Reviewed - Issues Found',
      assignedSupervisorId: 'reg_005',
      reviewDueDate: '2025-05-14',
      sections: [
        { sectionId: 'sec_casp_por_9004', sectionName: 'Proof of Reserves Q1', status: 'Partially Compliant', assignedReviewerId: 'reg_005', reviewNotes: 'The attestation report from the third-party auditor was not signed. Please provide the executed copy.', reviewDate: '2025-06-18' }
      ],
      attachments: [],
      overallComplianceNotes: 'Minor administrative issue found. Awaiting resubmission of signed document from the entity.',
      finalizedDate: '2025-06-22', // Recent
      finalizedByStaffId: 'reg_005'
    },
  
  
    // --- Existing Submissions ---
    {
      submissionId: 'sub_001',
      entityId: 'ent_001',
      licenseId: 'LIC-2024-001',
      reportType: 'PI_AML_Compliance_BiAnnual',
      reportingPeriod: '2024-H2',
      submissionDate: '2025-01-12',
      dueDate: '2025-01-15',
      status: 'Reviewed - Compliant',
      assignedSupervisorId: 'reg_002',
      reviewDueDate: '2025-02-12',
      sections: [
        { sectionId: 'sec_pi_aml_kyc_1', sectionName: 'KYC/CDD Procedures', status: 'Compliant', assignedReviewerId: 'reg_003', reviewNotes: 'Procedures are well-documented and align with new regulations.', reviewDate: '2025-01-20', sectionAttachments: ['doc_002'] },
        { sectionId: 'sec_pi_aml_tm_1', sectionName: 'Transaction Monitoring', status: 'Compliant', assignedReviewerId: 'reg_002', reviewNotes: 'Transaction monitoring system details provided. Thresholds seem appropriate.', reviewDate: '2025-01-22' },
      ],
      attachments: ['doc_001'],
      overallComplianceNotes: 'Overall good submission. No issues found.',
      finalizedDate: '2025-01-25',
      finalizedByStaffId: 'reg_002'
    },
    {
      submissionId: 'sub_002',
      entityId: 'ent_001',
      licenseId: 'LIC-2024-001',
      reportType: 'PI_FinancialStatement_Annual',
      reportingPeriod: '2024',
      submissionDate: '2025-03-10',
      dueDate: '2025-03-31',
      status: 'Under Review',
      assignedSupervisorId: 'reg_002',
      reviewDueDate: '2025-04-10',
      sections: [
        { sectionId: 'sec_pi_fs_2', sectionName: 'Audited Financials 2024', status: 'Pending Review', assignedReviewerId: 'reg_002', reviewNotes: '', reviewDate: '' }
      ],
      attachments: ['doc_003'],
      overallComplianceNotes: 'Initial submission received. Review in progress.',
    },
    {
      submissionId: 'sub_003',
      entityId: 'ent_001',
      licenseId: 'LIC-2024-002',
      reportType: 'PI_TransactionMonitoring_Quarterly',
      reportingPeriod: '2025-Q1',
      submissionDate: '2025-04-10',
      dueDate: '2025-04-15',
      status: 'Submitted',
      assignedSupervisorId: 'reg_002',
      reviewDueDate: '2025-05-10',
      sections: [{ sectionId: 'sec_pi_tm_q1_3', sectionName: 'Q1 2025 TM Report', status: 'Pending Review' }],
      attachments: [],
      overallComplianceNotes: 'Awaiting review.',
    },
    {
      submissionId: 'sub_004',
      entityId: 'ent_002',
      licenseId: 'LIC-2024-003',
      reportType: 'EMI_Safeguarding_Arrangements_Quarterly',
      reportingPeriod: '2025-Q1',
      submissionDate: '2025-04-12',
      dueDate: '2025-04-15',
      status: 'Reviewed - Compliant',
      assignedSupervisorId: 'reg_003',
      reviewDueDate: '2025-05-12',
      sections: [
        { sectionId: 'sec_emi_safeguard_4', sectionName: 'Safeguarding Audit', status: 'Compliant', assignedReviewerId: 'reg_004', reviewNotes: 'Initial concerns were clarified by the entity and found to be satisfactory.', reviewDate: '2025-04-20' }
      ],
      attachments: ['doc_004'],
      overallComplianceNotes: 'No issues found after clarification.',
      finalizedDate: '2025-04-25',
      finalizedByStaffId: 'reg_003'
    },
    {
      submissionId: 'sub_007',
      entityId: 'ent_005',
      licenseId: 'LIC-2024-006',
      reportType: 'CASP_AML_Compliance_Quarterly',
      reportingPeriod: '2025-Q1',
      submissionDate: '2025-04-18',
      dueDate: '2025-04-15',
      status: 'Late Submission',
      assignedSupervisorId: 'reg_005',
      reviewDueDate: '2025-05-18',
      sections: [
        { sectionId: 'sec_casp_aml_7', sectionName: 'AML Compliance Report Q1', status: 'Pending Review' }
      ],
      attachments: [],
      overallComplianceNotes: 'Submission was 3 days late. Awaiting review.',
    },
    {
      submissionId: 'sub_009',
      entityId: 'ent_007',
      licenseId: 'LIC-2024-008',
      reportType: 'IF_MarketConduct_Annual',
      reportingPeriod: '2024',
      submissionDate: null,
      dueDate: '2025-01-31',
      status: 'Pending Submission',
      assignedSupervisorId: 'reg_008',
      reviewDueDate: '2025-02-28',
      sections: [
          { sectionId: 'sec_if_mc_9', sectionName: 'Annual Market Conduct Report', status: 'Pending Review' }
      ],
      attachments: [],
      overallComplianceNotes: 'Awaiting submission.',
    },
  ];
  
  export default complianceSubmissions;