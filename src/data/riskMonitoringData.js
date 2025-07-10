export const riskMonitoringData = {
  thresholds: {
    "ent_001": {
      capitalAdequacy: { warning: 10.0, critical: 8.0 },
      nplRatio: { warning: 3.0, critical: 5.0 },
      liquidityRatio: { warning: 110.0, critical: 100.0 }
    }
  },
  
  alerts: [
    {
      alertId: "alert_001",
      entityId: "ent_001",
      alertType: "Capital Adequacy",
      severity: "Warning",
      message: "CAR approaching warning threshold",
      timestamp: "2024-01-15T10:30:00Z",
      acknowledged: false
    }
  ],
  
  earlyWarningIndicators: {
    "ent_001": {
      trend: "deteriorating",
      riskScore: 3.2,
      indicators: ["Increasing NPL", "Declining CAR"],
      probability: 0.15
    }
  }
};
