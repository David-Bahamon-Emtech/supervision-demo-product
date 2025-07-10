export const baselIIIMetrics = {
  // Capital adequacy ratios by entity
  capitalRatios: {
    "ent_001": {
      cet1Ratio: 12.5,
      tier1Ratio: 14.2,
      totalCapitalRatio: 16.8,
      leverageRatio: 5.2,
      lastUpdated: "2024-01-15"
    },
    // ... more entities
  },
  
  // Regulatory minimum thresholds
  regulatoryMinimums: {
    cet1Minimum: 4.5,
    tier1Minimum: 6.0,
    totalCapitalMinimum: 8.0,
    leverageMinimum: 3.0,
    conservationBuffer: 2.5,
    countercyclicalBuffer: 0.0
  },
  
  // Liquidity ratios
  liquidityRatios: {
    "ent_001": {
      lcr: 125.3,
      nsfr: 110.2,
      lastUpdated: "2024-01-15"
    },
    // ... more entities
  }
};
