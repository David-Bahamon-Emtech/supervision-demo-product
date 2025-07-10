// src/services/marketRiskService.js

import { marketRiskData } from '../data/marketRiskData.js';

// Mock API call delay
const SIMULATED_DELAY = 50;

const simulateApiCall = (dataFunction) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(dataFunction());
    }, SIMULATED_DELAY);
  });
};

export const calculateVaR = async (entityId, timeHorizon, confidence) => {
  return simulateApiCall(() => marketRiskData.varCalculations[entityId] || null);
};

export const getFXExposure = async (entityId) => {
  return simulateApiCall(() => marketRiskData.fxExposures[entityId] || null);
};

export const getInterestRateRisk = async (entityId) => {
  return simulateApiCall(() => marketRiskData.interestRateRisk[entityId] || null);
};

export const checkConcentrationLimits = async (entityId) => {
  return simulateApiCall(() => marketRiskData.concentrationRisk[entityId] || null);
};

export const generateMarketRiskReport = async (entityId) => {
  return simulateApiCall(() => {
    return {
      var: marketRiskData.varCalculations[entityId],
      fx: marketRiskData.fxExposures[entityId],
      interest: marketRiskData.interestRateRisk[entityId],
      concentration: marketRiskData.concentrationRisk[entityId],
    };
  });
};
