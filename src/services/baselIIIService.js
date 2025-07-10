// src/services/baselIIIService.js

import { baselIIIMetrics } from '../data/baselIIIData.js';

// Mock API call delay
const SIMULATED_DELAY = 50;

const simulateApiCall = (dataFunction) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(dataFunction());
    }, SIMULATED_DELAY);
  });
};

export const calculateCapitalAdequacyRatio = async (entityId) => {
  return simulateApiCall(() => {
    const ratios = baselIIIMetrics.capitalRatios[entityId];
    if (!ratios) return null;
    return ratios; // In a real scenario, this might involve calculations
  });
};

export const checkCapitalCompliance = async (entityId) => {
  return simulateApiCall(() => {
    const ratios = baselIIIMetrics.capitalRatios[entityId];
    const minimums = baselIIIMetrics.regulatoryMinimums;
    if (!ratios) return { compliant: false, reasons: ['No data available'] };

    const compliance = {
      cet1: ratios.cet1Ratio >= minimums.cet1Minimum,
      tier1: ratios.tier1Ratio >= minimums.tier1Minimum,
      totalCapital: ratios.totalCapitalRatio >= minimums.totalCapitalMinimum,
      leverage: ratios.leverageRatio >= minimums.leverageMinimum,
    };

    const isCompliant = Object.values(compliance).every(Boolean);
    const reasons = Object.entries(compliance)
      .filter(([, compliant]) => !compliant)
      .map(([key]) => `${key.toUpperCase()} ratio is below minimum.`);

    return { compliant: isCompliant, reasons };
  });
};

export const getLiquidityRatios = async (entityId) => {
  return simulateApiCall(() => {
    return baselIIIMetrics.liquidityRatios[entityId] || null;
  });
};

export const getSystemWideCapitalMetrics = async () => {
  return simulateApiCall(() => {
    const allRatios = Object.values(baselIIIMetrics.capitalRatios);
    if (allRatios.length === 0) return null;

    const totals = allRatios.reduce((acc, curr) => {
      acc.cet1Ratio += curr.cet1Ratio;
      acc.tier1Ratio += curr.tier1Ratio;
      acc.totalCapitalRatio += curr.totalCapitalRatio;
      acc.leverageRatio += curr.leverageRatio;
      return acc;
    }, { cet1Ratio: 0, tier1Ratio: 0, totalCapitalRatio: 0, leverageRatio: 0 });

    return {
      averageCet1Ratio: totals.cet1Ratio / allRatios.length,
      averageTier1Ratio: totals.tier1Ratio / allRatios.length,
      averageTotalCapitalRatio: totals.totalCapitalRatio / allRatios.length,
      averageLeverageRatio: totals.leverageRatio / allRatios.length,
    };
  });
};

export const generateCapitalAlerts = async () => {
  return simulateApiCall(() => {
    const alerts = [];
    for (const entityId in baselIIIMetrics.capitalRatios) {
      const compliance = checkCapitalCompliance(entityId);
      if (!compliance.compliant) {
        alerts.push({
          entityId,
          alertType: 'Capital Adequacy',
          severity: 'High',
          message: `Entity is non-compliant: ${compliance.reasons.join(', ')}`,
          timestamp: new Date().toISOString(),
        });
      }
    }
    return alerts;
  });
};
