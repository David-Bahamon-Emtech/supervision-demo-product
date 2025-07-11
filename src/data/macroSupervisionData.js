// src/data/macroSupervisionData.js

/**
 * @typedef {Object} SystemicRiskMetric
 * @property {string} name - Name of the indicator.
 * @property {string} value - The current value of the metric.
 * @property {'up' | 'down' | 'stable'} trend - The recent trend of the metric.
 * @property {'normal' | 'warning' | 'critical'} status - The current status based on thresholds.
 * @property {string} category - Category of risk (e.g., 'Capital Adequacy', 'Asset Quality').
 */

/** @type {SystemicRiskMetric[]} */
export const systemicRiskIndicators = [
  // --- Capital Adequacy ---
  { name: 'System-wide CAR', value: '14.8%', trend: 'down', status: 'normal', category: 'Capital Adequacy' },
  { name: 'Tier 1 Capital Ratio', value: '12.5%', trend: 'stable', status: 'normal', category: 'Capital Adequacy' },
  { name: 'Leverage Ratio', value: '7.2%', trend: 'stable', status: 'normal', category: 'Capital Adequacy' },
  { name: 'Capital Conservation Buffer', value: '2.8%', trend: 'stable', status: 'normal', category: 'Capital Adequacy' },
  { name: 'Counter-Cyclical Buffer', value: '0.5%', trend: 'up', status: 'normal', category: 'Capital Adequacy' },

  // --- Asset Quality ---
  { name: 'System-wide NPL Ratio', value: '3.9%', trend: 'up', status: 'warning', category: 'Asset Quality' },
  { name: 'NPL Provisions Coverage', value: '65%', trend: 'down', status: 'warning', category: 'Asset Quality' },
  { name: 'Loan Growth (Annualized)', value: '8.2%', trend: 'stable', status: 'normal', category: 'Asset Quality' },
  { name: 'Restructured Loans Ratio', value: '2.1%', trend: 'up', status: 'normal', category: 'Asset Quality' },

  // --- Liquidity Risk ---
  { name: 'Liquidity Coverage Ratio (LCR)', value: '135%', trend: 'stable', status: 'normal', category: 'Liquidity Risk' },
  { name: 'Net Stable Funding Ratio (NSFR)', value: '108%', trend: 'stable', status: 'normal', category: 'Liquidity Risk' },
  { name: 'Loan-to-Deposit Ratio', value: '88%', trend: 'up', status: 'normal', category: 'Liquidity Risk' },
  { name: 'Wholesale Funding Dependence', value: '22%', trend: 'stable', status: 'normal', category: 'Liquidity Risk' },
  
  // --- Market Risk ---
  { name: 'System-wide VaR (10-day)', value: '$1.2B', trend: 'up', status: 'warning', category: 'Market Risk' },
  { name: 'Foreign Exchange Exposure', value: '$8.5B', trend: 'stable', status: 'normal', category: 'Market Risk' },
  { name: 'Market Volatility Index (VIX)', value: '21.5', trend: 'up', status: 'warning', category: 'Market Risk' },
  { name: 'Interest Rate Sensitivity (Duration)', value: '3.2 years', trend: 'stable', status: 'normal', category: 'Market Risk' },

  // --- Profitability ---
  { name: 'Return on Assets (ROA)', value: '1.1%', trend: 'down', status: 'normal', category: 'Profitability' },
  { name: 'Return on Equity (ROE)', value: '9.8%', trend: 'down', status: 'normal', category: 'Profitability' },
  { name: 'Net Interest Margin (NIM)', value: '2.9%', trend: 'down', status: 'warning', category: 'Profitability' },
];

/**
 * @typedef {Object} InterconnectednessLink
 * @property {string} source - The entityId of the source institution.
 * @property {string} target - The entityId of the target institution.
 * @property {number} value - The value of the exposure in millions USD.
 * @property {'lending' | 'derivatives' | 'securities'} type - The type of exposure.
 */

/** @type {InterconnectednessLink[]} */
export const interconnectednessMatrix = [
  { source: 'ent_001', target: 'ent_002', value: 500, type: 'lending' },
  { source: 'ent_001', target: 'ent_008', value: 350, type: 'lending' },
  { source: 'ent_002', target: 'ent_009', value: 750, type: 'lending' },
  { source: 'ent_008', target: 'ent_009', value: 200, type: 'derivatives' },
  { source: 'ent_003', target: 'ent_001', value: 150, type: 'securities' },
  { source: 'ent_004', target: 'ent_008', value: 400, type: 'lending' },
  { source: 'ent_009', target: 'ent_001', value: 600, type: 'derivatives' },
  { source: 'ent_006', target: 'ent_007', value: 250, type: 'lending' },
  { source: 'ent_010', target: 'ent_003', value: 300, type: 'securities' },
  { source: 'ent_001', target: 'ent_004', value: 100, type: 'derivatives' },
];

/**
 * @typedef {Object} SectorConcentration
 * @property {string} sector - The name of the economic sector.
 * @property {number} percentage - The percentage of total system credit exposed to this sector.
 */

/** @type {SectorConcentration[]} */
export const sectorConcentrationData = [
  { sector: 'Commercial Real Estate', percentage: 28 },
  { sector: 'Consumer Lending', percentage: 22 },
  { sector: 'Energy Sector', percentage: 18 },
  { sector: 'Tourism & Hospitality', percentage: 12 },
  { sector: 'Manufacturing', percentage: 10 },
  { sector: 'Agriculture', percentage: 5 },
  { sector: 'Other', percentage: 5 },
];

/**
 * @typedef {Object} CrossBorderExposure
 * @property {string} country - The target country of the exposure.
 * @property {number} exposureValue - The value of the exposure in billions USD.
 * @property {'normal' | 'elevated' | 'high'} riskLevel - The assessed risk level for this exposure.
 */

/** @type {CrossBorderExposure[]} */
export const crossBorderExposures = [
  { country: 'United States', exposureValue: 25.5, riskLevel: 'normal' },
  { country: 'United Kingdom', exposureValue: 18.2, riskLevel: 'normal' },
  { country: 'China', exposureValue: 12.8, riskLevel: 'elevated' },
  { country: 'Eurozone', exposureValue: 22.1, riskLevel: 'normal' },
  { country: 'Offshore Financial Centers', exposureValue: 9.5, riskLevel: 'high' },
];

/**
 * @typedef {Object} PaymentSystemMetric
 * @property {string} systemName - The name of the payment system.
 * @property {number} dailyVolume - The average daily transaction volume in billions USD.
 * @property {number} failureRate - The transaction failure rate as a percentage.
 * @property {'Operational' | 'Degraded' | 'Offline'} status - The current operational status.
 */

/** @type {PaymentSystemMetric[]} */
export const paymentSystemData = [
  { systemName: 'RTGS', dailyVolume: 15.2, failureRate: 0.01, status: 'Operational' },
  { systemName: 'ACH', dailyVolume: 8.9, failureRate: 0.05, status: 'Operational' },
  { systemName: 'Card Network', dailyVolume: 5.4, failureRate: 0.12, status: 'Operational' },
];

/**
 * @typedef {Object} MacroAlert
 * @property {string} id - Unique alert identifier.
 * @property {'High' | 'Medium' | 'Low'} severity - The severity of the alert.
 * @property {string} title - A short title for the alert.
 * @property {string} description - A detailed description of the alert.
 * @property {string} timestamp - ISO timestamp of when the alert was triggered.
 */

/** @type {MacroAlert[]} */
export const macroAlerts = [
  { id: 'MA001', severity: 'High', title: 'NPL Ratio Breach', description: 'System-wide NPL ratio has exceeded the 3.5% warning threshold, currently at 3.9%.', timestamp: '2025-06-23T14:00:00Z' },
  { id: 'MA002', severity: 'Medium', title: 'CRE Concentration', description: 'Commercial Real Estate exposure has reached 28%, nearing the 30% concentration limit.', timestamp: '2025-06-22T10:00:00Z' },
  { id: 'MA003', severity: 'Medium', title: 'Market Volatility', description: 'The market volatility index (VIX) is elevated, increasing potential market risk.', timestamp: '2025-06-21T18:00:00Z' },
  { id: 'MA004', severity: 'Low', title: 'NIM Compression', description: 'System-wide Net Interest Margin continues to trend downwards, impacting profitability.', timestamp: '2025-06-20T09:00:00Z' },
  { id: 'MA005', severity: 'High', title: 'Contagion Risk Alert', description: 'Failure of ent_002 could lead to a significant impact on ent_009 due to high interconnectedness.', timestamp: '2025-06-23T15:30:00Z'},
  { id: 'MA006', severity: 'Medium', title: 'Liquidity Mismatch', description: 'Growing mismatch in short-term assets versus liabilities detected in the banking sector.', timestamp: '2025-06-22T11:00:00Z'},
  { id: 'MA007', severity: 'High', title: 'Foreign Exchange Stress', description: 'Unhedged foreign currency exposures are increasing rapidly, posing a systemic risk.', timestamp: '2025-06-24T09:00:00Z'},
  { id: 'MA008', severity: 'Low', title: 'Household Debt Service Ratio', description: 'The household debt service ratio has increased by 5% over the last quarter.', timestamp: '2025-06-20T12:00:00Z'},
  { id: 'MA009', severity: 'Medium', title: 'Cybersecurity Threat Level', description: 'Increased chatter regarding potential cyberattacks targeting financial institutions.', timestamp: '2025-06-24T11:00:00Z'},
  { id: 'MA010', severity: 'High', title: 'Real Estate Price Correction', description: 'Early indicators suggest a potential 10% price correction in the housing market.', timestamp: '2025-06-23T16:00:00Z'},
  { id: 'MA011', severity: 'Medium', title: 'Corporate Bond Spreads', description: 'Corporate bond spreads have widened significantly, indicating credit risk concerns.', timestamp: '2025-06-22T13:00:00Z'},
  { id: 'MA012', severity: 'Low', title: 'Regulatory Arbitrage', description: 'Unusual activity patterns suggest potential regulatory arbitrage in the derivatives market.', timestamp: '2025-06-21T15:00:00Z'},
  { id: 'MA013', severity: 'High', title: 'Geopolitical Risk', description: 'Heightened geopolitical tensions are likely to impact cross-border financial flows.', timestamp: '2025-06-24T10:00:00Z'},
  { id: 'MA014', severity: 'Medium', title: 'Climate Risk Indicator', description: 'Transition risks for the energy sector are increasing due to new climate policies.', timestamp: '2025-06-23T12:00:00Z'},
  { id: 'MA015', severity: 'Low', title: 'Payment System Latency', description: 'Increased latency detected in the RTGS payment system during peak hours.', timestamp: '2025-06-24T14:00:00Z'},
];