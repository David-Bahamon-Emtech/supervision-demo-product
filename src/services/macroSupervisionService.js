// src/services/macroSupervisionService.js

import {
  systemicRiskIndicators,
  interconnectednessMatrix,
  sectorConcentrationData,
  crossBorderExposures,
  macroAlerts
} from '../data/macroSupervisionData.js';
import entitiesData from '../data/entities.js';

const SIMULATED_DELAY = 50;

/**
 * Simulates an API call with a specified delay.
 * @param {Function} dataFunction The function that returns the mock data.
 * @returns {Promise<any>} A promise that resolves with the data from dataFunction.
 */
const simulateApiCall = (dataFunction) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const result = dataFunction();
        resolve(result);
      } catch (error) {
        console.error("Error in simulated API call:", error);
        reject(error);
      }
    }, SIMULATED_DELAY);
  });
};

/**
 * Retrieves an aggregated view of systemic risk indicators for the main dashboard.
 * @returns {Promise<Object>} An object containing categorized systemic risk metrics.
 */
export const getSystemicRiskDashboard = async () => {
  return simulateApiCall(() => {
    const categorizedMetrics = systemicRiskIndicators.reduce((acc, metric) => {
      const { category } = metric;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(metric);
      return acc;
    }, {});
    return categorizedMetrics;
  });
};

/**
 * Calculates the interconnectedness risk for a specific financial institution.
 * @param {string} entityId The ID of the entity to analyze.
 * @returns {Promise<Object>} An object detailing the entity's exposure to and from other institutions.
 */
export const calculateInterconnectednessRisk = async (entityId) => {
  return simulateApiCall(() => {
    const exposuresToEntity = interconnectednessMatrix.filter(link => link.target === entityId);
    const exposuresFromEntity = interconnectednessMatrix.filter(link => link.source === entityId);

    const totalExposureTo = exposuresToEntity.reduce((acc, link) => acc + link.value, 0);
    const totalExposureFrom = exposuresFromEntity.reduce((acc, link) => acc + link.value, 0);

    const getEntityName = (id) => entitiesData.find(e => e.entityId === id)?.companyName || id;

    return {
      entityId,
      entityName: getEntityName(entityId),
      totalExposureTo,
      totalExposureFrom,
      exposuresTo: exposuresToEntity.map(link => ({ ...link, sourceName: getEntityName(link.source) })),
      exposuresFrom: exposuresFromEntity.map(link => ({ ...link, targetName: getEntityName(link.target) })),
      contagionPotential: (totalExposureFrom / 1000).toFixed(2) // Example metric
    };
  });
};

/**
 * Retrieves and prioritizes system-wide macro alerts.
 * @returns {Promise<Array<Object>>} A sorted array of macro alerts.
 */
export const getEarlyWarningSignals = async () => {
  return simulateApiCall(() => {
    // Sort alerts by severity (High > Medium > Low) and then by timestamp
    const severityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
    return [...macroAlerts].sort((a, b) => {
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return new Date(b.timestamp) - new Date(a.timestamp);
    });
  });
};

/**
 * Generates a comprehensive systemic risk report for a given timeframe (mock).
 * @param {string} timeframe - The timeframe for the report (e.g., "Q2 2025").
 * @returns {Promise<Object>} A report object with analysis and recommendations.
 */
export const generateSystemicRiskReport = async (timeframe) => {
  return simulateApiCall(() => {
    const highRiskIndicators = systemicRiskIndicators.filter(i => i.status !== 'normal').length;
    return {
      reportTitle: `Systemic Risk Report - ${timeframe}`,
      generatedDate: new Date().toISOString(),
      summary: `The overall systemic risk level is assessed as 'elevated'. Key concerns are in asset quality, with a system-wide NPL ratio of ${systemicRiskIndicators.find(i=>i.name==='System-wide NPL Ratio').value}.`,
      recommendations: [
        "Increase monitoring of institutions with high CRE exposure.",
        "Conduct targeted stress tests on liquidity for mid-sized banks.",
        "Issue guidance on NPL provisioning.",
      ],
      data: {
        indicatorCount: systemicRiskIndicators.length,
        highRiskIndicatorCount: highRiskIndicators
      }
    };
  });
};

/**
 * Retrieves cross-border exposure data.
 * @returns {Promise<Array<Object>>} An array of cross-border exposure objects.
 */
export const monitorCrossBorderFlows = async () => {
  return simulateApiCall(() => crossBorderExposures);
};

/**
 * Retrieves sector concentration data.
 * @returns {Promise<Array<Object>>} An array of sector concentration objects.
 */
export const assessSectorConcentration = async () => {
  return simulateApiCall(() => sectorConcentrationData);
};