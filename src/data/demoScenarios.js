export const demoScenarios = {
  "high_risk_entity": {
    entityId: "ent_001",
    scenario: "Entity with deteriorating capital adequacy",
    triggers: ["CAR below warning threshold", "Increasing NPL ratio"]
  },
  "stress_test_failure": {
    entityId: "ent_002",
    scenario: "Entity failing stress test",
    triggers: ["Adverse scenario results in capital inadequacy"]
  },
  "defi_collateral_breach": {
    protocolId: "defi_001",
    scenario: "Stablecoin collateralization below threshold",
    triggers: ["Collateral ratio drops below 1.02"]
  }
};
