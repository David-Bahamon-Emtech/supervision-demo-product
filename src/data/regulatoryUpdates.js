// src/data/regulatoryUpdates.js

/**
 * @typedef {Object} RegulatoryUpdate
 * @property {string} updateId - Unique ID (e.g., "RU-2025-001").
 * @property {string} title - Official title of the update.
 * @property {string} documentId - Links to the master document in documents.js.
 * @property {'Regulation' | 'Guidance' | 'Circular' | 'Policy Note'} type - The nature of the update.
 * @property {'Draft' | 'Published' | 'Superseded' | 'Archived'} status - The lifecycle status of the update.
 * @property {string} issueDate - ISO date string the update was officially issued.
 * @property {string} effectiveDate - ISO date string the rules come into effect.
 * @property {string[]} applicableCategories - Array of licenseCategory.id this update applies to.
 * @property {string} summary - A concise, plain-language summary of the update.
 * @property {string} [promptUsed] - The prompt used to generate the content.
 * @property {string} [textContent] - The full, AI-generated text content of the update.
 * @property {string} createdByStaffId - Links to regulatorStaff.js.
 * @property {string} createdAt - ISO date string of creation.
 * @property {string} lastUpdated - ISO date string of last modification.
 * @property {Array<{entityId: string, acknowledgedAt: string}>} acknowledgments - Tracks entity acknowledgments.
 */

/** @type {RegulatoryUpdate[]} */
const regulatoryUpdates = [
  {
    updateId: "RU-2025-001",
    title: "New Capital Adequacy Requirements for CASPs",
    documentId: "doc_013",
    type: "Regulation",
    status: "Published",
    issueDate: "2025-06-10",
    effectiveDate: "2025-09-01",
    applicableCategories: ["cat_crypto_asset"],
    summary: "This regulation introduces a new tiered capital adequacy framework for all licensed Crypto Asset Service Providers (CASPs) to ensure sufficient capital reserves against market volatility.",
    promptUsed: "Draft a new regulation for Crypto Asset Service Providers (CASPs) outlining a tiered capital adequacy framework. The framework should be based on the volume of assets under custody and the risk profile of the assets. Specify three tiers and the corresponding minimum capital requirements.",
    textContent: `
REGULATION RU-2025-001: Capital Adequacy for Crypto Asset Service Providers (CASPs)

1.  **Introduction & Scope**
    1.1. This regulation establishes the minimum capital adequacy requirements for all entities licensed as Crypto Asset Service Providers (CASPs) within this jurisdiction.
    1.2. This regulation is effective as of September 1, 2025.

2.  **Tiered Capital Framework**
    2.1. CASPs will be categorized into one of three tiers based on their average Assets Under Custody (AUC) over the preceding quarter.
    2.2. **Tier 1 (AUC < $50M USD):** Minimum required capital of $250,000 USD.
    2.3. **Tier 2 (AUC between $50M and $250M USD):** Minimum required capital of $1,000,000 USD.
    2.4. **Tier 3 (AUC > $250M USD):** Minimum required capital of $5,000,000 USD plus 1% of AUC exceeding $250M.

3.  **Reporting & Compliance**
    3.1. All CASPs must report their capital calculations to the regulator on a quarterly basis, in line with the CASP_CapitalAdequacy_Quarterly report.
    3.2. Failure to maintain the required capital will result in supervisory action, which may include suspension of the license.
    `,
    createdByStaffId: "reg_001",
    createdAt: "2025-06-01T10:00:00Z",
    lastUpdated: "2025-06-10T11:00:00Z",
    acknowledgments: [
        { entityId: "ent_002", acknowledgedAt: "2025-06-12T14:00:00Z" }
    ]
  },
  {
    updateId: "RU-2025-002",
    title: "Guidance on AI Usage in Investment Advice",
    documentId: "doc_014",
    type: "Guidance",
    status: "Draft",
    issueDate: null,
    effectiveDate: null,
    applicableCategories: ["cat_investment_firm"],
    summary: "Provides guidance and best practices for investment firms utilizing artificial intelligence and machine learning algorithms for providing financial advice to consumers.",
    promptUsed: "Create a guidance note for investment firms on the use of AI. Focus on the principles of model explainability, fairness, and consumer protection.",
    textContent: `
GUIDANCE NOTE: GN-2025-002 - Responsible Use of AI in Investment Advisory Services

**1. Principle of Explainability:**
Firms utilizing AI models to provide investment advice must be able to provide consumers with a clear, simple explanation of how the AI reached its recommendation. Technical jargon should be avoided. The explanation should cover the primary factors and data points that influenced the outcome.

**2. Fairness and Bias Mitigation:**
Firms must conduct regular testing and validation of their AI models to identify and mitigate any inherent biases (e.g., demographic, behavioral). Records of these tests and any remediation actions must be maintained and made available to the regulator upon request.

**3. Consumer Protection:**
Clear disclosures must be provided to consumers indicating that investment advice is being generated or assisted by an AI system. The final accountability for the investment advice remains with the licensed firm, not the AI model.
    `,
    createdByStaffId: "reg_008",
    createdAt: "2025-05-20T15:00:00Z",
    lastUpdated: "2025-05-22T16:00:00Z",
    acknowledgments: []
  }
];

export default regulatoryUpdates;