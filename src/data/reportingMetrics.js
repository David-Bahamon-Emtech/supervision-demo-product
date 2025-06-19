// src/data/reportingMetrics.js

/**
 * @typedef {Object} ReportingMetric
 * @property {string} id - Unique identifier for the metric (e.g., "metric_pi_aml_overdue").
 * @property {string} licenseCategoryId - Links to the LicenseCategory.id this metric is relevant for.
 * @property {string} name - Display name of the metric (e.g., "Overdue AML Reports").
 * @property {'count' | 'percentage' | 'currency' | 'days' | 'rating_scale_5' | 'boolean_summary'} dataType - The type of data this metric represents.
 * @property {string} description - A brief explanation of what the metric measures.
 * @property {string} calculationSource - A hint to where the data for this metric might originate (e.g., "complianceSubmissions", "entityReportedData", "incidentReports", "supervisoryActions").
 * @property {string | number | null} [targetValue] - An optional target or benchmark for this metric.
 * @property {string} [interpretationNote] - Optional note on how to interpret the metric (e.g., "Lower is better", "Higher indicates better compliance").
 */

/** @type {ReportingMetric[]} */
const reportingMetrics = [
  // --- Metrics for Payment Institutions (cat_payment_institution) ---
  {
    id: 'metric_pi_aml_overdue',
    licenseCategoryId: 'cat_payment_institution',
    name: 'Overdue AML Reports',
    dataType: 'count',
    description: 'Number of entities with overdue AML/CFT compliance reports in the current reporting cycle.',
    calculationSource: 'complianceSubmissions',
    targetValue: 0,
    interpretationNote: 'Lower is better. Indicates efficiency in regulatory reporting.'
  },
  {
    id: 'metric_pi_trans_volume_total',
    licenseCategoryId: 'cat_payment_institution',
    name: 'Total Transaction Volume (Last Quarter)',
    dataType: 'currency',
    description: 'Aggregated transaction volume processed by all licensed payment institutions in the previous quarter.',
    calculationSource: 'entityReportedData',
    targetValue: null,
    interpretationNote: 'Provides insight into market size and activity.'
  },
  {
    id: 'metric_pi_oprisk_incidents',
    licenseCategoryId: 'cat_payment_institution',
    name: 'Significant Operational Risk Incidents',
    dataType: 'count',
    description: 'Number of significant operational risk incidents reported by payment institutions.',
    calculationSource: 'incidentReports',
    targetValue: '<5',
    interpretationNote: 'Lower indicates better operational stability.'
  },
  {
    id: 'metric_pi_consumer_complaints_high',
    licenseCategoryId: 'cat_payment_institution',
    name: 'High-Severity Consumer Complaints',
    dataType: 'count',
    description: 'Number of unresolved high-severity consumer complaints against payment institutions.',
    calculationSource: 'entityReportedData', // Or a dedicated complaints module
    targetValue: 0,
    interpretationNote: 'Indicates consumer protection effectiveness.'
  },

  // --- Metrics for Crypto Asset Service Providers (cat_crypto_asset) ---
  {
    id: 'metric_casp_sec_breaches',
    licenseCategoryId: 'cat_crypto_asset',
    name: 'Security Breaches Reported (Last Year)',
    dataType: 'count',
    description: 'Total number of security breaches involving loss of funds or data reported by CASPs in the last 12 months.',
    calculationSource: 'incidentReports',
    targetValue: 0,
    interpretationNote: 'Lower is better. Key indicator of cybersecurity robustness.'
  },
  {
    id: 'metric_casp_unverified_wallets',
    licenseCategoryId: 'cat_crypto_asset',
    name: 'Percentage of Unverified High-Risk Wallets',
    dataType: 'percentage',
    description: 'Proportion of hosted wallets flagged as high-risk that remain unverified beyond the allowed timeframe.',
    calculationSource: 'entityReportedData',
    targetValue: '<2%',
    interpretationNote: 'Measures effectiveness of KYC/CDD on high-risk crypto accounts.'
  },
  {
    id: 'metric_casp_por_coverage',
    licenseCategoryId: 'cat_crypto_asset',
    name: 'Proof of Reserves Coverage Ratio',
    dataType: 'percentage',
    description: 'Average reported coverage ratio from Proof of Reserves attestations (Assets / Liabilities).',
    calculationSource: 'complianceSubmissions', // Assuming PoR reports are submitted
    targetValue: '>100%',
    interpretationNote: 'Higher indicates better solvency and customer fund protection.'
  },

  // --- Metrics for Credit Institutions (cat_credit_institution) ---
  {
    id: 'metric_ci_car_avg',
    licenseCategoryId: 'cat_credit_institution',
    name: 'Average Capital Adequacy Ratio (CAR)',
    dataType: 'percentage',
    description: 'Average CAR reported by all credit institutions.',
    calculationSource: 'complianceSubmissions',
    targetValue: '>12%', // Example target
    interpretationNote: 'Higher generally indicates better financial health.'
  },
  {
    id: 'metric_ci_npl_ratio_avg',
    licenseCategoryId: 'cat_credit_institution',
    name: 'Average Non-Performing Loan (NPL) Ratio',
    dataType: 'percentage',
    description: 'Average NPL ratio across all credit institutions.',
    calculationSource: 'entityReportedData',
    targetValue: '<5%',
    interpretationNote: 'Lower indicates better loan portfolio quality.'
  },

  // --- Metrics for Investment Firms (cat_investment_firm) ---
  {
    id: 'metric_if_client_asset_discrepancies',
    licenseCategoryId: 'cat_investment_firm',
    name: 'Client Asset Discrepancies',
    dataType: 'count',
    description: 'Number of reported discrepancies in client asset reconciliations.',
    calculationSource: 'complianceSubmissions',
    targetValue: 0,
    interpretationNote: 'Indicates effectiveness of client asset protection measures.'
  },
  {
    id: 'metric_if_suitability_breaches',
    licenseCategoryId: 'cat_investment_firm',
    name: 'Suitability Rule Breaches',
    dataType: 'count',
    description: 'Number of identified breaches of investment suitability rules.',
    calculationSource: 'supervisoryActions', // Or specific reports
    targetValue: 0,
    interpretationNote: 'Lower indicates better investor protection.'
  },

  // --- Metrics for E-Money Institutions (cat_e_money_institution) ---
  {
    id: 'metric_emi_safeguarding_compliance_rate',
    licenseCategoryId: 'cat_e_money_institution',
    name: 'Safeguarding Compliance Rate',
    dataType: 'percentage',
    description: 'Percentage of EMIs fully compliant with fund safeguarding requirements based on latest attestations.',
    calculationSource: 'complianceSubmissions',
    targetValue: '100%',
    interpretationNote: 'Indicates adherence to critical regulatory requirement.'
  },
  {
    id: 'metric_emi_system_downtime_avg',
    licenseCategoryId: 'cat_e_money_institution',
    name: 'Average System Downtime (Hours/Month)',
    dataType: 'count', // Representing hours
    description: 'Average unscheduled system downtime in hours per month reported by EMIs.',
    calculationSource: 'entityReportedData',
    targetValue: '<1 hour',
    interpretationNote: 'Lower indicates better operational resilience.'
  },

  // --- Metrics for AISP/PISP (cat_aisp_pisp) ---
  {
    id: 'metric_aisp_pisp_sca_failures',
    licenseCategoryId: 'cat_aisp_pisp',
    name: 'Strong Customer Authentication (SCA) Failure Rate',
    dataType: 'percentage',
    description: 'Average reported failure rate for SCA attempts by AISPs/PISPs.',
    calculationSource: 'entityReportedData',
    targetValue: '<1%',
    interpretationNote: 'Lower indicates more robust and user-friendly authentication.'
  },
  {
    id: 'metric_aisp_consent_violations',
    licenseCategoryId: 'cat_aisp_pisp',
    name: 'Data Consent Violations Reported',
    dataType: 'count',
    description: 'Number of confirmed data consent violations by AISPs.',
    calculationSource: 'supervisoryActions', // Or incident reports
    targetValue: 0,
    interpretationNote: 'Critical for data privacy compliance.'
  }
];

export default reportingMetrics;