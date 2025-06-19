// src/data/licenseCategories.js

/**
 * @typedef {Object} LicenseCategory
 * @property {string} id - Unique identifier for the license category (e.g., "cat_payment_institution").
 * @property {string} name - Display name of the license category (e.g., "Payment Institution Licenses").
 * @property {string} description - A brief description of what this category covers.
 * @property {string[]} relevantComplianceReportTypes - An array of strings identifying report types relevant to this category.
 * These strings could be keys to a more detailed report definition/framework later.
 * (e.g., ["PI_FinancialStatement_Annual", "PI_TransactionMonitoring_Quarterly"])
 */

/** @type {LicenseCategory[]} */
const licenseCategories = [
  {
    id: 'cat_payment_institution',
    name: 'Payment Institution Licenses',
    description: 'Oversees entities providing various payment services, including payment processing, money remittance, and account information services.',
    relevantComplianceReportTypes: [
      'PI_FinancialStatement_Annual',
      'PI_TransactionMonitoring_Quarterly',
      'PI_AML_Compliance_BiAnnual',
      'PI_OperationalRisk_Annual',
      'PI_ConsumerProtection_SemiAnnual'
    ]
  },
  {
    id: 'cat_crypto_asset',
    name: 'Crypto Asset Service Providers (CASPs)',
    description: 'Regulates entities dealing with crypto assets, including exchanges, wallet providers, and token issuers.',
    relevantComplianceReportTypes: [
      'CASP_WalletSecurity_Audit_Annual',
      'CASP_BlockchainAnalytics_Monthly',
      'CASP_AML_Compliance_Quarterly',
      'CASP_Tokenomics_Disclosure_AdHoc',
      'CASP_ProofOfReserves_Quarterly'
    ]
  },
  {
    id: 'cat_credit_institution',
    name: 'Credit Institutions & Lenders',
    description: 'Covers banks, credit unions, and other lending institutions, focusing on solvency, lending practices, and consumer credit protection.',
    relevantComplianceReportTypes: [
      'CI_CapitalAdequacy_Quarterly',
      'CI_LoanPortfolio_Quality_Monthly',
      'CI_LiquidityRisk_Monthly',
      'CI_ConsumerLending_Compliance_Annual'
    ]
  },
  {
    id: 'cat_investment_firm',
    name: 'Investment Firms & Advisors',
    description: 'Supervises investment advisors, brokers, and fund managers, ensuring market integrity and investor protection.',
    relevantComplianceReportTypes: [
      'IF_ClientAsset_Protection_Quarterly',
      'IF_MarketConduct_Annual',
      'IF_Suitability_Review_BiAnnual',
      'IF_BestExecution_Annual'
    ]
  },
  {
    id: 'cat_e_money_institution',
    name: 'E-Money Institutions (EMIs)',
    description: 'Regulates institutions that issue electronic money, focusing on safeguarding client funds and operational resilience.',
    relevantComplianceReportTypes: [
      'EMI_Safeguarding_Arrangements_Quarterly',
      'EMI_FinancialCrime_Report_SemiAnnual',
      'EMI_OperationalResilience_Annual',
      'EMI_CapitalRequirements_SemiAnnual'
    ]
  },
  // Add more categories as needed based on the types of licenses your demo platform handles
  // For example, PISP/AISP could be its own category or part of Payment Institutions
  {
    id: 'cat_aisp_pisp',
    name: 'AISP/PISP Providers',
    description: 'Oversees Account Information Service Providers and Payment Initiation Service Providers.',
    relevantComplianceReportTypes: [
      'AISP_DataSecurity_Report_Annual',
      'PISP_FraudReporting_Quarterly',
      'AISP_PISP_StrongCustomerAuth_SemiAnnual'
    ]
  }
];

export default licenseCategories;