// src/data/documents.js

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

// --- Original Documents ---
const originalDocuments = [
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

// --- Helper function to generate new documents from submission history ---
const generatedDocuments = [];
const submissions = []; // In a real scenario, this would be imported from complianceSubmissions.js

// This is a simplified recreation of the logic from the previous step to get submission details
let subCounter = 1;
const licenses = [
  { licenseId: 'LIC-2024-001', entityId: 'ent_001', licenseType: 'Payment Institution License' },
  { licenseId: 'LIC-2024-002', entityId: 'ent_001', licenseType: 'Payment Institution License' },
  { licenseId: 'LIC-2024-003', entityId: 'ent_002', licenseType: 'E-Money Institution License' },
  { licenseId: 'LIC-2024-004', entityId: 'ent_003', licenseType: 'E-Money Institution License' },
  { licenseId: 'LIC-2024-005', entityId: 'ent_004', licenseType: 'Crypto Asset Service Provider License' },
  { licenseId: 'LIC-2024-006', entityId: 'ent_005', licenseType: 'Crypto Asset Service Provider License' },
  { licenseId: 'LIC-2024-007', entityId: 'ent_006', licenseType: 'Investment Firm License' },
  { licenseId: 'LIC-2024-008', entityId: 'ent_007', licenseType: 'Investment Firm License' },
  { licenseId: 'LIC-2024-009', entityId: 'ent_008', licenseType: 'Credit Institution License' },
  { licenseId: 'LIC-2024-010', entityId: 'ent_009', licenseType: 'Credit Institution License' },
  { licenseId: 'LIC-2024-011', entityId: 'ent_010', licenseType: 'PISP/AISP License' },
  { licenseId: 'LIC-2025-012', entityId: 'ent_011', licenseType: 'PISP/AISP License' }
];

const licenseCategories = {
    'Payment Institution License': ['PI_FinancialStatement_Annual', 'PI_TransactionMonitoring_Quarterly'],
    'E-Money Institution License': ['EMI_Safeguarding_Arrangements_Quarterly', 'EMI_CapitalRequirements_SemiAnnual'],
    'Crypto Asset Service Provider License': ['CASP_WalletSecurity_Audit_Annual', 'CASP_ProofOfReserves_Quarterly'],
    'Investment Firm License': ['IF_ClientAsset_Protection_Quarterly', 'IF_BestExecution_Annual'],
    'Credit Institution License': ['CI_CapitalAdequacy_Quarterly', 'CI_LoanPortfolio_Quality_Monthly'],
    'PISP/AISP License': ['AISP_DataSecurity_Report_Annual', 'PISP_FraudReporting_Quarterly']
};
const today = new Date('2025-06-25');


licenses.forEach(license => {
    const relevantReports = licenseCategories[license.licenseType] || [];
    relevantReports.forEach(reportType => {
        const isAnnual = reportType.toLowerCase().includes('annual');
        const periods = isAnnual ? 2 : 2;
        for (let i = 0; i < periods; i++) {
            const year = today.getFullYear() - 1 - i;
            const period = isAnnual ? `${year}` : `${year}-Q4`;
            const mainDocId = `doc_gen_${subCounter}_main.pdf`;
            const attachmentId = `doc_gen_${subCounter}_attachment.pdf`;
            
            generatedDocuments.push({
                 documentId: mainDocId,
                 fileName: `${license.entityId}_${reportType}_${period}_main.pdf`,
                 documentType: "Submitted Report",
                 version: "1.0",
                 uploadDate: new Date(year, 11, 20).toISOString().split('T')[0],
                 uploadedBy: license.entityId,
                 mimeType: "application/pdf",
                 dummyFileContentLink: "/dummy_documents/generic_text_document.txt",
                 description: `Main submission document for ${reportType} covering ${period} for ${license.entityId}.`
            });
             generatedDocuments.push({
                 documentId: attachmentId,
                 fileName: `${license.entityId}_${reportType}_${period}_supporting_evidence.zip`,
                 documentType: "Supporting Evidence",
                 version: "1.0",
                 uploadDate: new Date(year, 11, 20).toISOString().split('T')[0],
                 uploadedBy: license.entityId,
                 mimeType: "application/zip",
                 dummyFileContentLink: "/dummy_documents/generic_archive.zip.txt",
                 description: `Supporting evidence for section of ${reportType} covering ${period} for ${license.entityId}.`
            });
            subCounter++;
        }
    });

    const dataFeedTypes = ['TRANSACTION_DATA_MONTHLY', 'KYC_DATA_MONTHLY'];
    dataFeedTypes.forEach(reportType => {
        for (let i = 0; i < 12; i++) {
            let monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const year = monthDate.getFullYear();
            const month = monthDate.getMonth() + 1;
            const period = `${year}-${String(month).padStart(2, '0')}`;
            const docId = `doc_gen_${subCounter}_${reportType.toLowerCase()}_${period}.csv.zip`;

             generatedDocuments.push({
                 documentId: docId,
                 fileName: `${license.entityId}_${reportType}_${period}.csv.zip`,
                 documentType: "Data Feed",
                 version: "1.0",
                 uploadDate: new Date(year, month, 3).toISOString().split('T')[0],
                 uploadedBy: license.entityId,
                 mimeType: "application/zip",
                 dummyFileContentLink: "/dummy_documents/generic_csv.csv.txt",
                 description: `Monthly ${reportType.replace(/_/g, ' ')} data feed for ${period} from ${license.entityId}.`
            });
            subCounter++;
        }
    });
});


/** @type {DocumentMetadata[]} */
const documents = [...originalDocuments, ...generatedDocuments];

export default documents;