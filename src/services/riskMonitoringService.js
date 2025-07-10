// src/services/riskMonitoringService.js

import { riskMonitoringData } from '../data/riskMonitoringData.js';

// Mock API call delay
const SIMULATED_DELAY = 50;

const simulateApiCall = (dataFunction) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(dataFunction());
    }, SIMULATED_DELAY);
  });
};

export const checkRiskThresholds = async (entityId) => {
  return simulateApiCall(() => riskMonitoringData.thresholds[entityId] || null);
};

export const generateRiskAlerts = async () => {
  // This is a mock function. In a real system, this would be a complex process.
  return simulateApiCall(() => riskMonitoringData.alerts);
};

export const getEarlyWarningIndicators = async (entityId) => {
  return simulateApiCall(() => riskMonitoringData.earlyWarningIndicators[entityId] || null);
};

export const acknowledgeAlert = async (alertId) => {
  return simulateApiCall(() => {
    const alert = riskMonitoringData.alerts.find(a => a.alertId === alertId);
    if (alert) {
      alert.acknowledged = true;
      return alert;
    }
    return null;
  });
};

export const updateRiskThresholds = async (entityId, thresholds) => {
  return simulateApiCall(() => {
    riskMonitoringData.thresholds[entityId] = thresholds;
    return riskMonitoringData.thresholds[entityId];
  });
};
