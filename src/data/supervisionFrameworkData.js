export const supervisionFramework = {
  icaapAssessments: {
    "ent_001": {
      lastAssessment: "2023-12-01",
      nextDue: "2024-12-01",
      status: "Compliant",
      riskAppetite: "Moderate",
      capitalPlanning: "Adequate",
      stressTesting: "Comprehensive"
    },
    // ... more entities
  },
  
  orsaAssessments: {
    // For insurance entities
    "ent_005": {
      lastAssessment: "2023-11-15",
      nextDue: "2024-11-15",
      status: "Under Review",
      riskProfile: "Medium",
      capitalRequirement: "Adequate"
    }
  },
  
  supervisoryActions: [
    {
      actionId: "sup_001",
      entityId: "ent_001",
      actionType: "Remediation Plan",
      description: "Address capital adequacy concerns",
      dueDate: "2024-02-15",
      status: "In Progress",
      priority: "High"
    }
  ]
};
