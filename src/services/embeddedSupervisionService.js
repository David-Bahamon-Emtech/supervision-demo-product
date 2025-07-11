// src/services/embeddedSupervisionService.js

import {
  protocolMonitoring,
  smartContractRisks,
  regulatoryNodes,
  onChainAlerts,
} from '../data/defiSupervisionData.js';
import entities from '../data/entities.js';

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
 * Gets real-time compliance status for a specific DeFi protocol.
 * @param {string} protocolId The ID of the protocol.
 * @returns {Promise<Object>} An object with compliance status and details.
 */
export const monitorProtocolCompliance = async (protocolId) => {
  return simulateApiCall(() => {
    const protocol = protocolMonitoring[protocolId];
    if (!protocol) return null;

    // Mock compliance checks
    const isCollateralized = (protocol.collateralizationRatio || 0) >= 1.0;
    const hasRecentAudit = smartContractRisks[protocolId]?.auditScore > 8.0;

    return {
      protocolId,
      name: protocol.name,
      complianceStatus: isCollateralized && hasRecentAudit ? 'Compliant' : 'Issues Found',
      violations: [
        ...(!isCollateralized ? ['Collateralization ratio is below 100%'] : []),
        ...(!hasRecentAudit ? ['No recent, high-scoring security audit on file'] : []),
      ],
    };
  });
};

/**
 * Performs automated rule validation on a smart contract address (mock).
 * @param {string} contractAddress The blockchain address of the smart contract.
 * @returns {Promise<Object>} An object with validation results.
 */
export const validateSmartContractRules = async (contractAddress) => {
  return simulateApiCall(() => {
    // Find which protocol this contract belongs to (mock logic)
    const protocolId = Object.keys(smartContractRisks).find(
      key => smartContractRisks[key].contractAddress === contractAddress
    );
    const riskData = protocolId ? smartContractRisks[protocolId] : null;

    if (!riskData) {
      return { validationPassed: false, issues: ['Contract address not found in monitored protocols.'] };
    }

    const issues = [];
    if (riskData.upgradeRisk === 'High') {
      issues.push('Contract has high-risk upgradeability features.');
    }
    if (riskData.adminKeyRisk === 'Centralized') {
      issues.push('Admin keys are centralized, posing a single point of failure risk.');
    }
    if ((riskData.auditScore || 0) < 8.0) {
      issues.push(`Latest audit score (${riskData.auditScore}) is below the acceptable threshold of 8.0.`);
    }

    return {
      contractAddress,
      protocolName: protocolMonitoring[protocolId]?.name || 'Unknown Protocol',
      validationPassed: issues.length === 0,
      issues,
    };
  });
};

/**
 * Simulates processing raw on-chain data to extract regulatory insights.
 * @param {Object} blockchainData A mock object of blockchain data.
 * @returns {Promise<Object>} An object with processed compliance data.
 */
export const processOnChainData = async (blockchainData) => {
    return simulateApiCall(() => {
        // Mock logic: Identify transactions involving high-risk wallets
        const highRiskTxns = blockchainData.transactions.filter(tx => tx.value > 1000000 && tx.to.startsWith('0xbad...'));
        return {
            processedAt: new Date().toISOString(),
            totalTransactions: blockchainData.transactions.length,
            flaggedTransactions: highRiskTxns.length,
            summary: `Processed ${blockchainData.transactions.length} transactions and flagged ${highRiskTxns.length} for review based on value and counterparty risk.`,
        };
    });
};

/**
 * Generates automated reports from all active embedded regulatory nodes.
 * @returns {Promise<Array<Object>>} An array of real-time compliance reports.
 */
export const generateEmbeddedReports = async () => {
  return simulateApiCall(() => {
    return regulatoryNodes.map(node => ({
      nodeId: node.nodeId,
      protocolName: protocolMonitoring[node.protocolId]?.name || 'Unknown Protocol',
      reportGeneratedAt: new Date().toISOString(),
      status: node.status,
      complianceSummary: `${node.complianceChecksPassed}% of ${node.transactionsMonitored24h} transactions passed automated checks in the last 24h.`,
    }));
  });
};

/**
 * Provides a system-wide risk assessment of the monitored DeFi ecosystem.
 * @returns {Promise<Object>} An object containing the DeFi systemic risk assessment.
 */
export const assessDeFiSystemicRisk = async () => {
    return simulateApiCall(() => {
        const totalTVL = Object.values(protocolMonitoring).reduce((acc, p) => acc + p.tvl, 0);
        const protocolsWithIssues = Object.keys(protocolMonitoring).filter(id => {
            const risk = smartContractRisks[id];
            return risk && (risk.auditScore < 8.5 || risk.upgradeRisk === 'High');
        });

        return {
            totalTVL,
            monitoredProtocols: Object.keys(protocolMonitoring).length,
            protocolsOnWatchlist: protocolsWithIssues.length,
            overallRiskLevel: totalTVL > 10000000000 && protocolsWithIssues.length > 2 ? 'Elevated' : 'Moderate',
            keyRiskFactor: "High concentration of value in a few protocols with medium-risk upgradeability.",
        };
    });
};

/**
 * Simulates the impact of an embedded supervision intervention.
 * @param {Object} scenario - The intervention scenario to model.
 * @returns {Promise<Object>} An object detailing the simulated impact.
 */
export const simulateRegulatoryIntervention = async (scenario) => {
    return simulateApiCall(() => {
        let impactSummary = '';
        if (scenario.type === 'PAUSE_LENDING') {
            impactSummary = `Simulating pause on protocol ${scenario.protocolId}. Expected impact: Halts new loan origination, potentially causing a ${Math.random() * 15}% drop in protocol TVL as users withdraw liquidity.`;
        } else if (scenario.type === 'INCREASE_COLLATERAL') {
            impactSummary = `Simulating increase of collateral requirements on ${scenario.protocolId} to 175%. Expected impact: A forced liquidation wave of approximately $${(Math.random() * 50).toFixed(1)}M in under-collateralized loans.`;
        }
        return {
            simulationId: `sim_${Date.now()}`,
            scenario,
            impactSummary,
            predictedEffectiveness: `${(Math.random() * (95 - 70) + 70).toFixed(1)}%`,
        };
    });
};

/**
 * Fetches all on-chain alerts.
 * @returns {Promise<Array<Object>>} A sorted array of on-chain alerts.
 */
export const getOnChainAlerts = async () => {
  return simulateApiCall(() => {
     const severityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
     return [...onChainAlerts].sort((a, b) => {
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return new Date(b.timestamp) - new Date(a.timestamp);
    });
  });
};