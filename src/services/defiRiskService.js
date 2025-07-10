// src/services/defiRiskService.js

import { defiRiskData } from '../data/defiRiskData.js';

// Mock API call delay
const SIMULATED_DELAY = 50;

const simulateApiCall = (dataFunction) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(dataFunction());
    }, SIMULATED_DELAY);
  });
};

export const getProtocolTVL = async (protocolId) => {
  return simulateApiCall(() => defiRiskData.protocols[protocolId]?.tvl || null);
};

export const checkCollateralizationRatio = async (stablecoinId) => {
  return simulateApiCall(() => defiRiskData.collateralMonitoring[stablecoinId] || null);
};

export const assessSmartContractRisk = async (protocolId) => {
  return simulateApiCall(() => defiRiskData.smartContractRisks[protocolId] || null);
};

export const getLiquidityPoolRisk = async (poolId) => {
  return simulateApiCall(() => defiRiskData.liquidityPools[poolId] || null);
};

export const generateDeFiRiskReport = async () => {
  return simulateApiCall(() => defiRiskData);
};
