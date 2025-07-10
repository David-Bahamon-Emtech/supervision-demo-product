export const defiRiskData = {
  protocols: {
    "defi_001": {
      name: "DeFi Protocol Alpha",
      type: "DEX",
      tvl: 150000000,
      tokenAddress: "0x1234...",
      auditStatus: "Audited",
      lastAudit: "2023-12-01"
    }
  },
  
  collateralMonitoring: {
    "stablecoin_001": {
      name: "USDT",
      totalSupply: 50000000,
      collateralValue: 52000000,
      collateralizationRatio: 1.04,
      threshold: 1.00,
      warningLevel: 1.02
    }
  },
  
  liquidityPools: {
    "pool_001": {
      protocol: "defi_001",
      token1: "ETH",
      token2: "USDT",
      liquidity: 25000000,
      volume24h: 2000000,
      volatility: 0.15
    }
  },
  
  smartContractRisks: {
    "defi_001": {
      codeAuditScore: 8.5,
      upgradeabilityRisk: "Medium",
      adminKeyRisk: "Low",
      oracleRisk: "Medium",
      lastSecurityCheck: "2024-01-01"
    }
  }
};
