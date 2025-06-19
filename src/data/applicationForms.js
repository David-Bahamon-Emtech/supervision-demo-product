// src/data/applicationForms.js

/**
 * @typedef {Object} FormField
 * @property {string} id - Unique ID for the field (e.g., "field_company_name").
 * @property {string} label - User-friendly label (e.g., "Company Legal Name").
 * @property {'text' | 'textarea' | 'select' | 'date' | 'number' | 'file' | 'checkbox' | 'radio'} type - Type of input.
 * @property {boolean} required - Is this field mandatory?
 * @property {string[]} [options] - If type is 'select', the options.
 * @property {string} [placeholder] - Placeholder text for input.
 * @property {string} [defaultValue] - Default value for the field.
 * @property {string} [helpText] - Explanatory text for the field.
 */

/**
 * @typedef {Object} FormSection
 * @property {string} id - Unique ID for the section (e.g., "section_entity_info").
 * @property {string} title - Title for the section (e.g., "Applicant Entity Information").
 * @property {FormField[]} fields - Array of fields in this section.
 * @property {string} [description] - Optional description for the section.
 */

/**
 * @typedef {Object} ApplicationFormDefinition
 * @property {string} id - Unique ID for the form (e.g., "form_pi_new_v1").
 * @property {string} name - Name of the form (e.g., "Payment Institution New License Application").
 * @property {string} description - A brief description of the form's purpose.
 * @property {string} version - Version number of the form (e.g., "1.0", "2.1 Draft").
 * @property {'Draft' | 'Published' | 'Archived'} status - Lifecycle status of the form.
 * @property {string} targetLicenseCategory - Links to `LicenseCategory.id` (e.g., "cat_payment_institution").
 * @property {string} createdAt - ISO date string of creation.
 * @property {string} lastUpdated - ISO date string of last modification.
 * @property {FormSection[]} sections - An array of sections that make up this form.
 */

/** @type {ApplicationFormDefinition[]} */
export const initialApplicationForms = [
  {
    id: "form_pi_new_v1",
    name: "Payment Institution New License Application",
    description: "Standard application form for new Payment Institution licenses.",
    version: "1.0",
    status: "Published",
    targetLicenseCategory: "cat_payment_institution",
    createdAt: "2024-01-01T10:00:00Z",
    lastUpdated: "2024-03-15T14:30:00Z",
    sections: [
      {
        id: "section_entity_info",
        title: "Applicant Entity Information",
        description: "Details about the applying company and its primary contact.",
        fields: [
          { id: "field_company_name", label: "Company Legal Name", type: "text", required: true, placeholder: "e.g., FinTech Innovations Ltd." },
          { id: "field_reg_number", label: "Registration Number", type: "text", required: true, placeholder: "e.g., 123456789" },
          { id: "field_incorp_date", label: "Date of Incorporation", type: "date", required: true },
          { id: "field_primary_address", label: "Primary Business Address", type: "textarea", required: true },
          { id: "field_primary_contact_name", label: "Primary Contact Full Name", type: "text", required: true },
          { id: "field_primary_contact_email", label: "Primary Contact Email", type: "text", required: true, placeholder: "contact@example.com" },
        ],
      },
      {
        id: "section_business_model",
        title: "Business Model & Services",
        description: "Information about the payment services to be offered.",
        fields: [
          { id: "field_service_type", label: "Type of Payment Service(s)", type: "select", required: true, options: ["Money Remittance", "Payment Processing", "Account Information Service", "Payment Initiation Service", "Issuing Payment Instruments", "Acquiring Payment Transactions"], helpText: "Select all applicable services." },
          { id: "field_target_market", label: "Target Market", type: "textarea", required: false, placeholder: "Describe your target customer base and geographical reach." },
          { id: "field_revenue_model", label: "Revenue Model Overview", type: "textarea", required: true, placeholder: "Explain how your business will generate revenue." },
        ],
      },
      {
        id: "section_financials",
        title: "Financial Information",
        description: "Upload financial statements and projections.",
        fields: [
          { id: "field_fin_statements_doc", label: "Latest Audited Financial Statements", type: "file", required: true, helpText: "Upload your most recent audited financial statements (PDF)." },
          { id: "field_fin_projections_doc", label: "Financial Projections (3 Years)", type: "file", required: true, helpText: "Upload detailed financial projections for the next 3 years (PDF/Excel)." },
          { id: "field_initial_capital", label: "Initial Capital Amount (USD)", type: "number", required: true, placeholder: "e.g., 250000" },
        ],
      },
    ],
  },
  {
    id: "form_casp_new_v1",
    name: "Crypto Asset Service Provider New License Application",
    description: "Application form for new Crypto Asset Service Provider licenses.",
    version: "1.0",
    status: "Draft", // This one is a draft
    targetLicenseCategory: "cat_crypto_asset",
    createdAt: "2024-05-01T09:00:00Z",
    lastUpdated: "2024-05-01T09:00:00Z",
    sections: [
      {
        id: "section_casp_entity_info",
        title: "CASP Entity Details",
        description: "Basic information about the crypto asset service provider.",
        fields: [
          { id: "field_casp_company_name", label: "Company Name", type: "text", required: true },
          { id: "field_casp_website", label: "Company Website", type: "text", required: true, placeholder: "https://www.yourcasp.com" },
        ],
      },
      {
        id: "section_casp_tech_security",
        title: "Technology & Security Infrastructure",
        description: "Details on wallet management, cybersecurity, and blockchain integration.",
        fields: [
          { id: "field_wallet_management", label: "Wallet Management Solution", type: "textarea", required: true, placeholder: "Describe your hot/cold wallet strategy and key management practices." },
          { id: "field_cyber_policy_doc", label: "Cybersecurity Policy Document", type: "file", required: true, helpText: "Upload your comprehensive cybersecurity policy." },
          { id: "field_blockchain_analytics_tool", label: "Blockchain Analytics Tool Used", type: "text", required: false, placeholder: "e.g., Chainalysis, Elliptic" },
        ],
      },
    ],
  },
  {
    id: "form_emi_renewal_v2",
    name: "E-Money Institution License Renewal Form",
    description: "Form for renewing existing E-Money Institution licenses. Updated for 2025 regulations.",
    version: "2.0",
    status: "Archived", // This one is archived
    targetLicenseCategory: "cat_e_money_institution",
    createdAt: "2023-11-01T11:00:00Z",
    lastUpdated: "2024-01-20T10:00:00Z",
    sections: [
      {
        id: "section_emi_renewal_compliance",
        title: "Compliance Attestation",
        description: "Attestation of ongoing compliance with EMI regulations.",
        fields: [
          { id: "field_safeguarding_attest", label: "Safeguarding Attestation (Annual)", type: "file", required: true, helpText: "Upload your latest safeguarding audit report." },
          { id: "field_aml_cft_attest", label: "AML/CFT Compliance Attestation", type: "checkbox", required: true, helpText: "Confirm ongoing adherence to AML/CFT requirements." },
        ],
      },
      {
        id: "section_emi_renewal_activity",
        title: "Operational Activity Summary",
        description: "Summary of e-money issuance and redemption activities.",
        fields: [
          { id: "field_e_money_issued_value", label: "Total E-Money Issued (Last 12 Months)", type: "number", required: true, placeholder: "e.g., 10000000" },
          { id: "field_customer_count", label: "Active Customer Count", type: "number", required: true },
        ],
      },
    ],
  },
];

export default initialApplicationForms;