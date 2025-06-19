/**
 * @typedef {Object} DocumentMetadata
 * @property {string} documentId - Unique identifier for the document (e.g., "doc_001").
 * @property {string} fileName - Descriptive file name, including a dummy extension (e.g., "Business_Plan_MainCo_v1.pdf").
 * @property {string} documentType - Category of the document (e.g., "Business Plan", "AML/CFT Policy", "Financial Statements", "Certificate of Incorporation", "Director ID Scan", "Proof of Address", "System Architecture Diagram").
 * @property {string} version - Version number of the document (e.g., "1.0", "2.1 Final").
 * @property {string} uploadDate - ISO date string for when the document was "uploaded" (e.g., "2024-03-15").
 * @property {string} uploadedBy - Name or ID of the person/entity that "uploaded" it (e.g., "John Doe", "applicant_contact_001").
 * @property {string} mimeType - The supposed MIME type of the file (e.g., "application/pdf", "image/jpeg", "text/plain", "application/vnd.ms-excel").
 * @property {string} dummyFileContentLink - Path to a generic placeholder file in the public directory (e.g., "/dummy_documents/generic_text_document.txt").
 * @property {string} description - Optional brief description of the document.
 */

/**
 * @type {DocumentMetadata[]}
 */
const documents = [
  {
    documentId: "doc_001",
    fileName: "AlphaCorp_Business_Plan_v2.1.pdf",
    documentType: "Business Plan",
    version: "2.1",
    uploadDate: "2024-01-10",
    uploadedBy: "contact_alpha_ceo",
    mimeType: "application/pdf",
    dummyFileContentLink: "/dummy_documents/generic_business_plan.txt",
    description: "Comprehensive business plan for AlphaCorp's new payment service.",
  },
  {
    documentId: "doc_002",
    fileName: "AlphaCorp_AML_CFT_Policy_v1.5.docx",
    documentType: "AML/CFT Policy",
    version: "1.5",
    uploadDate: "2024-01-10",
    uploadedBy: "contact_alpha_compliance",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    dummyFileContentLink: "/dummy_documents/generic_aml_policy.txt",
    description: "Anti-Money Laundering and Counter-Financing of Terrorism policy.",
  },
  {
    documentId: "doc_003",
    fileName: "AlphaCorp_Financial_Projections_2024-2026.xlsx",
    documentType: "Financial Projections",
    version: "1.0",
    uploadDate: "2024-01-15",
    uploadedBy: "contact_alpha_cfo",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    dummyFileContentLink: "/dummy_documents/generic_financials.xlsx.txt", // using .txt for simplicity of dummy file
    description: "3-year financial projections for AlphaCorp.",
  },
  {
    documentId: "doc_004",
    fileName: "BetaSolutions_Incorporation_Certificate.pdf",
    documentType: "Certificate of Incorporation",
    version: "1.0",
    uploadDate: "2024-02-01",
    uploadedBy: "contact_beta_legal",
    mimeType: "application/pdf",
    dummyFileContentLink: "/dummy_documents/generic_certificate.pdf.txt",
    description: "Official certificate of incorporation for BetaSolutions LLC.",
  },
  {
    documentId: "doc_005",
    fileName: "Director_Smith_Passport_Scan.jpeg",
    documentType: "Director ID Scan",
    version: "1.0",
    uploadDate: "2024-01-10",
    uploadedBy: "contact_alpha_ceo",
    mimeType: "image/jpeg",
    dummyFileContentLink: "/dummy_documents/generic_id_scan.jpeg.txt",
    description: "Passport scan for Director John Smith of AlphaCorp.",
  },
  {
    documentId: "doc_006",
    fileName: "GammaPay_System_Architecture.pdf",
    documentType: "System Architecture Diagram",
    version: "1.0",
    uploadDate: "2024-03-05",
    uploadedBy: "contact_gamma_cto",
    mimeType: "application/pdf",
    dummyFileContentLink: "/dummy_documents/generic_diagram.pdf.txt",
    description: "System architecture overview for the GammaPay platform.",
  },
  {
    documentId: "doc_007",
    fileName: "GammaPay_Proof_Of_Funds.pdf",
    documentType: "Proof of Funds",
    version: "1.0",
    uploadDate: "2024-03-05",
    uploadedBy: "contact_gamma_cfo",
    mimeType: "application/pdf",
    dummyFileContentLink: "/dummy_documents/generic_bank_statement.pdf.txt",
    description: "Bank statement showing proof of capital for GammaPay.",
  },
  {
    documentId: "doc_008",
    fileName: "Director_Jones_Utility_Bill_Proof_of_Address.pdf",
    documentType: "Proof of Address",
    version: "1.0",
    uploadDate: "2024-02-01",
    uploadedBy: "contact_beta_legal",
    mimeType: "application/pdf",
    dummyFileContentLink: "/dummy_documents/generic_utility_bill.pdf.txt",
    description: "Utility bill for Director Emily Jones of BetaSolutions.",
  },
  {
    documentId: "doc_009",
    fileName: "DeltaSecure_Incident_Response_Plan_v1.1.pdf",
    documentType: "Incident Response Plan",
    version: "1.1",
    uploadDate: "2024-04-10",
    uploadedBy: "contact_delta_ciso",
    mimeType: "application/pdf",
    dummyFileContentLink: "/dummy_documents/generic_security_plan.txt",
    description: "Plan for handling security incidents at DeltaSecure.",
  },
  {
    documentId: "doc_010",
    fileName: "DeltaSecure_Data_Privacy_Policy_v2.0.pdf",
    documentType: "Data Privacy Policy",
    version: "2.0",
    uploadDate: "2024-04-10",
    uploadedBy: "contact_delta_dpo",
    mimeType: "application/pdf",
    dummyFileContentLink: "/dummy_documents/generic_privacy_policy.txt",
    description: "DeltaSecure's policy on data privacy and protection.",
  },
  {
    documentId: "doc_011",
    fileName: "EpsilonWallet_Pitch_Deck.pptx",
    documentType: "Pitch Deck",
    version: "3.0",
    uploadDate: "2024-05-01",
    uploadedBy: "contact_epsilon_founder",
    mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    dummyFileContentLink: "/dummy_documents/generic_presentation.pptx.txt",
    description: "Investor pitch deck for EpsilonWallet.",
  },
  {
    documentId: "doc_012",
    fileName: "EpsilonWallet_User_Agreement_Template.docx",
    documentType: "User Agreement Template",
    version: "1.0",
    uploadDate: "2024-05-01",
    uploadedBy: "contact_epsilon_legal",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    dummyFileContentLink: "/dummy_documents/generic_terms_of_service.txt",
    description: "Template for EpsilonWallet user terms and conditions.",
  },
  {
    documentId: "doc_013",
    fileName: "Circular_2025-06-10_CASP_Capital_Adequacy.pdf",
    documentType: "Regulatory Circular",
    version: "1.0",
    uploadDate: "2025-06-10",
    uploadedBy: "reg_001",
    mimeType: "application/pdf",
    dummyFileContentLink: "/dummy_documents/generic_policy_document.txt",
    description: "Official circular detailing new capital adequacy requirements for Crypto Asset Service Providers.",
  },
  {
    documentId: "doc_014",
    fileName: "Guidance_Note_AI_in_Advisory.pdf",
    documentType: "Guidance Note",
    version: "1.0",
    uploadDate: "2025-05-20",
    uploadedBy: "reg_008",
    mimeType: "application/pdf",
    dummyFileContentLink: "/dummy_documents/generic_policy_document.txt",
    description: "Guidance for investment firms on the use of AI in providing financial advice.",
  }
];

export default documents;