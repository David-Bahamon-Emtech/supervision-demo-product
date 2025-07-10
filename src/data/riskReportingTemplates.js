export const riskReportingTemplates = {
  templates: {
    "basel_pillar3": {
      name: "Basel Pillar 3 Report",
      sections: [
        "Capital Adequacy",
        "Credit Risk",
        "Market Risk",
        "Operational Risk",
        "Leverage Ratio"
      ],
      frequency: "Quarterly",
      dueDate: "45 days after quarter end"
    },
    "icaap_report": {
      name: "ICAAP Report",
      sections: [
        "Risk Assessment",
        "Capital Planning",
        "Stress Testing",
        "Risk Appetite"
      ],
      frequency: "Annual",
      dueDate: "December 31"
    }
  },
  
  reportingSchedule: {
    "ent_001": {
      "basel_pillar3": {
        lastSubmitted: "2023-10-15",
        nextDue: "2024-01-15",
        status: "Overdue"
      },
      "icaap_report": {
        lastSubmitted: "2023-12-15",
        nextDue: "2024-12-31",
        status: "Current"
      }
    }
  }
};
