// src/services/riskReportingService.js

import { riskReportingTemplates } from '../data/riskReportingTemplates.js';

// Mock API call delay
const SIMULATED_DELAY = 50;

const simulateApiCall = (dataFunction) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(dataFunction());
    }, SIMULATED_DELAY);
  });
};

export const generateRiskReport = async (entityId, templateId) => {
  // This is a mock function. A real one would compile data based on the template.
  return simulateApiCall(() => {
    const template = riskReportingTemplates.templates[templateId];
    if (!template) return null;
    return `Report for ${entityId} based on ${template.name}`;
  });
};

export const getReportingSchedule = async (entityId) => {
  return simulateApiCall(() => riskReportingTemplates.reportingSchedule[entityId] || null);
};

export const checkReportingCompliance = async (entityId) => {
  return simulateApiCall(() => {
    const schedule = riskReportingTemplates.reportingSchedule[entityId];
    if (!schedule) return { compliant: true, overdueReports: [] };

    const overdueReports = Object.entries(schedule)
      .filter(([, details]) => details.status === 'Overdue')
      .map(([templateId]) => riskReportingTemplates.templates[templateId].name);

    return { compliant: overdueReports.length === 0, overdueReports };
  });
};

export const submitReport = async (entityId, reportData) => {
  // This is a mock function.
  return simulateApiCall(() => {
    console.log(`Report for ${entityId} submitted with data:`, reportData);
    return { success: true };
  });
};
