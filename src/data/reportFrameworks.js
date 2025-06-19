// src/data/reportFrameworks.js

/**
 * @typedef {Object} ReportField
 * @property {string} fieldId - Unique identifier for the field within the section (e.g., "kyc_policy_doc_ref").
 * @property {string} fieldName - Display name of the field (e.g., "KYC Policy Document Reference").
 * @property {'text' | 'textarea' | 'date' | 'number' | 'currency' | 'select' | 'document_id' | 'boolean'} fieldType - The type of input for this field.
 * @property {boolean} [required=false] - Whether this field is mandatory.
 * @property {string[]} [selectOptions] - Array of strings if fieldType is 'select'.
 * @property {string} [placeholder] - Placeholder text for the input field.
 * @property {string} [validationRule] - (Conceptual) A regex or identifier for a validation rule.
 */

/**
 * @typedef {Object} ReportFrameworkSection
 * @property {string} sectionId - Unique identifier for the section within the framework (e.g., "sec_aml_kyc").
 * @property {string} sectionName - Display name of the report section (e.g., "KYC/CDD Procedures").
 * @property {string} [description] - Optional description of what this section covers.
 * @property {ReportField[]} fields - An array of fields that belong to this section.
 * @property {string} [defaultAssignedDepartment] - Optional: A suggestion for which department typically handles this section.
 */

/**
 * @typedef {Object} ReportFramework
 * @property {string} frameworkId - Unique identifier for the report framework (e.g., "fw_pi_aml_biannual").
 * @property {string} reportTypeName - The identifier for the report type this framework defines (should match relevantComplianceReportTypes in licenseCategories.js, e.g., "PI_AML_Compliance_BiAnnual").
 * @property {string} frameworkName - Display name of the framework (e.g., "Payment Institution AML Bi-Annual Report Framework").
 * @property {string} description - A brief description of this report framework.
 * @property {string} version - Version of this framework (e.g., "1.0").
 * @property {'Active' | 'Draft' | 'Archived'} status - Status of the framework itself.
 * @property {ReportFrameworkSection[]} sections - An array of sections that make up this report framework.
 */

/** @type {ReportFramework[]} */
const reportFrameworks = [
  {
    frameworkId: 'fw_pi_aml_biannual_v1',
    reportTypeName: 'PI_AML_Compliance_BiAnnual',
    frameworkName: 'Payment Institution AML Bi-Annual Framework v1.0',
    description: 'Standard framework for the bi-annual Anti-Money Laundering compliance report required from Payment Institutions.',
    version: "1.0",
    status: "Active",
    sections: [
      {
        sectionId: 'sec_pi_aml_governance',
        sectionName: 'AML Governance & Oversight',
        description: 'Details about the AML governance structure, MLRO appointment, and board oversight.',
        fields: [
          { fieldId: 'gov_mlro_name', fieldName: 'MLRO Name', fieldType: 'text', required: true },
          { fieldId: 'gov_mlro_appointment_doc_id', fieldName: 'MLRO Appointment Document ID', fieldType: 'document_id', placeholder: 'e.g., doc_015' },
          { fieldId: 'gov_board_oversight_summary', fieldName: 'Board Oversight Summary', fieldType: 'textarea', required: true, placeholder: 'Describe board involvement in AML oversight...' }
        ],
        defaultAssignedDepartment: 'Compliance Department'
      },
      {
        sectionId: 'sec_pi_aml_kyc', // Matches sectionId in complianceSubmissions for consistency
        sectionName: 'KYC/CDD Procedures',
        description: 'Assessment of Know Your Customer and Customer Due Diligence processes.',
        fields: [
          { fieldId: 'kyc_policy_doc_id', fieldName: 'KYC/CDD Policy Document ID', fieldType: 'document_id', required: true },
          { fieldId: 'kyc_new_clients_count', fieldName: 'Number of New Clients Onboarded', fieldType: 'number', required: true },
          { fieldId: 'kyc_high_risk_clients_count', fieldName: 'Number of High-Risk Clients Identified', fieldType: 'number' },
          { fieldId: 'kyc_edd_examples_desc', fieldName: 'Enhanced Due Diligence Examples', fieldType: 'textarea', placeholder: 'Provide 2-3 anonymized examples of EDD performed.' }
        ],
        defaultAssignedDepartment: 'Onboarding Team / AML Unit'
      },
      {
        sectionId: 'sec_pi_aml_tm', // Matches sectionId in complianceSubmissions
        sectionName: 'Transaction Monitoring',
        description: 'Details of the transaction monitoring systems and processes.',
        fields: [
          { fieldId: 'tm_system_name', fieldName: 'TM System Used', fieldType: 'text', required: true, placeholder: 'e.g., FlagSys v3, In-house solution' },
          { fieldId: 'tm_rules_config_doc_id', fieldName: 'TM Rules Configuration Document ID', fieldType: 'document_id' },
          { fieldId: 'tm_alerts_generated_count', fieldName: 'Number of Alerts Generated', fieldType: 'number', required: true },
          { fieldId: 'tm_sars_filed_count', fieldName: 'Number of SARs Filed from TM', fieldType: 'number', required: true }
        ],
        defaultAssignedDepartment: 'Financial Crime Unit'
      },
      {
        sectionId: 'sec_pi_aml_training',
        sectionName: 'Staff Training',
        description: 'Information on AML/CFT training provided to staff.',
        fields: [
          { fieldId: 'train_completion_rate', fieldName: 'Staff AML Training Completion Rate (%)', fieldType: 'number', required: true, placeholder: 'e.g., 95' },
          { fieldId: 'train_last_all_staff_date', fieldName: 'Last All-Staff Training Date', fieldType: 'date' },
          { fieldId: 'train_materials_doc_id', fieldName: 'Training Materials Document ID', fieldType: 'document_id' }
        ],
        defaultAssignedDepartment: 'HR / Compliance Training'
      }
    ]
  },
  {
    frameworkId: 'fw_casp_wallet_sec_audit_v1',
    reportTypeName: 'CASP_WalletSecurity_Audit_Annual',
    frameworkName: 'CASP Wallet Security Audit Framework v1.0',
    description: 'Framework for the annual audit of wallet security measures for Crypto Asset Service Providers.',
    version: "1.0",
    status: "Active",
    sections: [
      {
        sectionId: 'sec_casp_audit_scope',
        sectionName: 'Audit Scope and Methodology',
        fields: [
          { fieldId: 'audit_firm_name', fieldName: 'Auditing Firm Name', fieldType: 'text', required: true },
          { fieldId: 'audit_period_covered', fieldName: 'Period Covered by Audit', fieldType: 'text', required: true, placeholder: 'e.g., YYYY-MM-DD to YYYY-MM-DD' },
          { fieldId: 'audit_scope_statement_doc_id', fieldName: 'Audit Scope Statement Document ID', fieldType: 'document_id', required: true }
        ],
        defaultAssignedDepartment: 'Internal Audit / Security Team'
      },
      {
        sectionId: 'sec_casp_key_management',
        sectionName: 'Cryptographic Key Management',
        fields: [
          { fieldId: 'key_gen_process_desc', fieldName: 'Key Generation Process', fieldType: 'textarea', required: true },
          { fieldId: 'key_storage_solution', fieldName: 'Key Storage Solution (e.g., HSM, MPC)', fieldType: 'text', required: true },
          { fieldId: 'key_backup_recovery_doc_id', fieldName: 'Key Backup & Recovery Policy ID', fieldType: 'document_id' }
        ],
        defaultAssignedDepartment: 'Security Operations'
      },
      {
        sectionId: 'sec_casp_findings_remediation',
        sectionName: 'Audit Findings and Remediation',
        fields: [
          { fieldId: 'audit_summary_findings_doc_id', fieldName: 'Audit Summary Report (Findings) ID', fieldType: 'document_id', required: true },
          { fieldId: 'audit_critical_vulns_count', fieldName: 'Number of Critical Vulnerabilities Found', fieldType: 'number', required: true },
          { fieldId: 'audit_remediation_plan_doc_id', fieldName: 'Remediation Plan Document ID', fieldType: 'document_id' },
          { fieldId: 'audit_remediation_status', fieldName: 'Overall Remediation Status', fieldType: 'select', selectOptions: ['Not Started', 'In Progress', 'Completed', 'Partially Completed'] }
        ],
        defaultAssignedDepartment: 'Security Team / Management'
      }
    ]
  },
  // Add more frameworks for other report types as needed...
];

export default reportFrameworks;