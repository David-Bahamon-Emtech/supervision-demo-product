export const marketRiskData = {
  varCalculations: {
    "ent_001": {
      oneDay: 1250000,
      tenDay: 3950000,
      confidenceLevel: 0.99,
      lastUpdated: "2024-01-15"
    }
  },
  
  fxExposures: {
    "ent_001": {
      usd: 15000000,
      eur: 5000000,
      gbp: 3000000,
      hedgeRatio: 0.65
    }
  },
  
  interestRateRisk: {
    "ent_001": {
      duration: 2.5,
      convexity: 15.2,
      basisPointValue: 125000,
      repricingGaps: {
        "0-3months": 50000000,
        "3-12months": 30000000,
        "1-5years": 80000000
      }
    }
  },
  
  concentrationRisk: {
    "ent_001": {
      largeExposures: [
        { counterparty: "Corporate A", exposure: 25000000, limit: 30000000 },
        { counterparty: "Corporate B", exposure: 18000000, limit: 25000000 }
      ]
    }
  }
};
