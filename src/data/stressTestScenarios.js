// src/data/stressTestScenarios.js

/**
 * @typedef {Object} StressTestScenario
 * @property {string} id - Unique identifier for the scenario.
 * @property {string} name - Name of the stress test scenario.
 * @property {'Credit Risk' | 'Market Risk' | 'Liquidity Risk' | 'Climate Risk' | 'Combined'} type - The type of risk targeted.
 * @property {string} description - A brief description of the scenario.
 * @property {Object.<string, number | string>} parameters - Key parameters defining the shock.
 */

/** @type {StressTestScenario[]} */
export const stressTestScenarios = [
  {
    id: "scenario_001",
    name: "Severe Interest Rate Hike",
    type: "Market Risk",
    description: "Models a rapid 300 basis point increase in the policy rate over 6 months.",
    parameters: { shock: "+300bps", duration: "6 months" }
  },
  {
    id: "scenario_002",
    name: "Real Estate Market Crash",
    type: "Credit Risk",
    description: "Simulates a 25% decline in commercial real estate values and a 15% decline in residential values.",
    parameters: { cre_decline: -0.25, rre_decline: -0.15 }
  },
  {
    id: "scenario_003",
    name: "System-wide Liquidity Freeze",
    type: "Liquidity Risk",
    description: "Models a sudden withdrawal of 20% of wholesale funding and a 10% withdrawal of retail deposits.",
    parameters: { wholesale_shock: -0.20, retail_shock: -0.10 }
  },
  {
    id: "scenario_004",
    name: "Energy Sector Default Wave",
    type: "Credit Risk",
    description: "A scenario where the NPL ratio for the energy sector triples due to a commodity price collapse.",
    parameters: { sector: "Energy Sector", npl_multiplier: 3 }
  },
  {
    id: "scenario_005",
    name: "Combined Recession Scenario",
    type: "Combined",
    description: "A severely adverse scenario combining a 5% GDP contraction, a 150bps rate hike, and a 40% increase in credit defaults.",
    parameters: { gdp_shock: -0.05, rate_shock: "+150bps", default_increase: 0.40 }
  },
  {
    id: "scenario_006",
    name: "Cyber Attack on Payment System",
    type: "Operational Risk", // Note: This type wasn't in the typedef but makes sense.
    description: "Simulates a 48-hour outage of the primary RTGS system, impacting liquidity and settlement.",
    parameters: { system: "RTGS", outage_duration_hours: 48 }
  },
  {
    id: "scenario_007",
    name: "Transition Climate Risk (Carbon Tax)",
    type: "Climate Risk",
    description: "Models the impact of a newly introduced, significant carbon tax on carbon-intensive industries.",
    parameters: { carbon_tax_per_ton: 100, affected_sectors: ["Energy Sector", "Manufacturing"] }
  },
  {
    id: "scenario_008",
    name: "Physical Climate Risk (Severe Weather)",
    type: "Climate Risk",
    description: "Assesses the impact of a catastrophic flooding event on insured assets and property loan portfolios.",
    parameters: { event_type: "Severe Flooding", affected_region: "Coastal", property_loss_estimate: 0.15 }
  }
];

/**
 * @typedef {Object} HistoricalStressResult
 * @property {string} resultId - Unique ID for the result set.
 * @property {string} testDate - The date the test was run.
 * @property {string} scenarioId - The ID of the scenario that was run.
 * @property {string} entityId - The entity the test was run on.
 * @property {{metric: string, pre_stress: string, post_stress: string}[]} impact - The impact on key metrics.
 */

/** @type {HistoricalStressResult[]} */
export const historicalStressResults = [
  {
    resultId: 'res_2024_001',
    testDate: '2024-03-15',
    scenarioId: 'scenario_002',
    entityId: 'ent_001',
    impact: [
      { metric: 'CAR', pre_stress: '15.7%', post_stress: '11.2%' },
      { metric: 'NPL Ratio', pre_stress: '4.5%', post_stress: '9.8%' }
    ]
  },
  {
    resultId: 'res_2024_002',
    testDate: '2024-03-15',
    scenarioId: 'scenario_002',
    entityId: 'ent_002',
    impact: [
      { metric: 'CAR', pre_stress: '11.3%', post_stress: '7.5%' },
      { metric: 'NPL Ratio', pre_stress: '8.1%', post_stress: '15.2%' }
    ]
  },
  {
    resultId: 'res_2023_001',
    testDate: '2023-09-20',
    scenarioId: 'scenario_001',
    entityId: 'ent_008',
    impact: [
      { metric: 'Net Interest Margin', pre_stress: '3.1%', post_stress: '2.5%' },
      { metric: 'Profitability', pre_stress: '$45M', post_stress: '$32M' }
    ]
  },
    {
    resultId: 'res_2022_001',
    testDate: '2022-11-10',
    scenarioId: 'scenario_005',
    entityId: 'ent_009',
    impact: [
      { metric: 'CAR', pre_stress: '16.0%', post_stress: '9.1%' },
       { metric: 'Liquidity Coverage Ratio', pre_stress: '150%', post_stress: '105%' }
    ]
  }
];

/**
 * @typedef {Object.<string, number>} ContagionModel
 * This object represents the contagion effect from a source entity (key) to a target entity,
 * where the value is a multiplier of the shock effect.
 * E.g., if ent_001 fails and has a link to ent_002 with a value of 0.3,
 * 30% of the initial shock to ent_001 is transmitted to ent_002.
 */

/** @type {Object.<string, ContagionModel>} */
export const contagionModels = {
  // Exposures FROM ent_001
  'ent_001': {
    'ent_002': 0.3, // 30% of shock from ent_001 transmits to ent_002
    'ent_008': 0.2,
    'ent_003': 0.1,
    'ent_009': 0.15
  },
  // Exposures FROM ent_002
  'ent_002': {
    'ent_001': 0.25,
    'ent_009': 0.4
  },
   // Exposures FROM ent_008 (a central node)
  'ent_008': {
    'ent_001': 0.15,
    'ent_002': 0.1,
    'ent_004': 0.2,
    'ent_009': 0.25
  },
   // Exposures FROM ent_009
  'ent_009': {
    'ent_002': 0.35,
    'ent_008': 0.2,
  },
};

export const scenarioParameters = {
  severityCalibrations: {
    low: 0.8,
    medium: 1.0,
    high: 1.5,
  },
  probabilityDistributions: {
    normal: { mean: 0, std: 1 },
    lognormal: { mu: 0, sigma: 1 },
  },
  timeHorizons: ["1-year", "3-year", "5-year"],
};