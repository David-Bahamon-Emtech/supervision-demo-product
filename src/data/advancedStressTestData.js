export const advancedStressTestData = {
  macroScenarios: {
    "baseline": {
      name: "Baseline Scenario",
      gdpGrowth: 2.5,
      inflationRate: 2.0,
      interestRate: 3.0,
      unemploymentRate: 4.5
    },
    "adverse": {
      name: "Adverse Scenario",
      gdpGrowth: -2.0,
      inflationRate: 4.0,
      interestRate: 6.0,
      unemploymentRate: 8.0
    },
    "severely_adverse": {
      name: "Severely Adverse Scenario",
      gdpGrowth: -4.5,
      inflationRate: 6.0,
      interestRate: 8.0,
      unemploymentRate: 12.0
    }
  },
  
  sectorShocks: {
    "Commercial Real Estate": {
      baselineNPL: 0.04,
      adverseNPL: 0.12,
      severeNPL: 0.25
    },
    "Consumer Lending": {
      baselineNPL: 0.05,
      adverseNPL: 0.15,
      severeNPL: 0.30
    }
  },
  
  systemWideParameters: {
    gdpShockCorrelation: 0.7,
    interestRateShockCorrelation: 0.8,
    sectorCorrelations: {
      "Commercial Real Estate": 0.6,
      "Consumer Lending": 0.5
    }
  }
};
