// src/services/riskAssessmentService.js

import entitiesData from '../data/entities.js';
import licensesData from '../data/licenses.js';
import complianceSubmissionsData from '../data/complianceSubmissions.js';
import licenseApplicationsData from '../data/licenseApplications.js';
import productsData from '../data/products.js';
import documentsData from '../data/documents.js';
import { stressTestData } from '../data/dummyStressTestData.js';
import { advancedStressTestData } from '../data/advancedStressTestData.js';

// Import all new services
import * as baselIIIService from './baselIIIService.js';
import * as supervisionService from './supervisionService.js';
import * as riskMonitoringService from './riskMonitoringService.js';
import * as marketRiskService from './marketRiskService.js';
import * as defiRiskService from './defiRiskService.js';
import * as riskReportingService from './riskReportingService.js';


// --- Deterministic "Random" Number Generator ---
// Creates a consistent number from a string (e.g., entityId) to avoid Math.random().
const deterministicNumber = (string, max) => {
    let hash = 0;
    if (string.length === 0) return hash;
    for (let i = 0; i < string.length; i++) {
        const char = string.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    // Ensure the number is positive and within the desired range (0 to max-1)
    return Math.abs(hash) % max;
};


// --- Normalization Helpers ---

// Normalizes a count to a 1-5 risk score. Higher count = higher risk.
const normalizeCount = (count, thresholds) => {
  if (count <= thresholds[0]) return 1.0; // Low risk
  if (count <= thresholds[1]) return 3.0; // Medium risk
  return 5.0; // High risk
};

// Normalizes a percentage to a 1-5 risk score.
// lowerIsBetter = true means a lower percentage is less risky (e.g., NPL ratio).
// lowerIsBetter = false means a higher percentage is less risky (e.g., CAR).
const normalizePercentage = (percentage, thresholds, lowerIsBetter) => {
  if (lowerIsBetter) {
    if (percentage <= thresholds[0]) return 1.0; // Low risk
    if (percentage <= thresholds[1]) return 3.0; // Medium risk
    return 5.0; // High risk
  } else {
    if (percentage >= thresholds[0]) return 1.0; // Low risk
    if (percentage >= thresholds[1]) return 3.0; // Medium risk
    return 5.0; // High risk
  }
};


// --- Pillar Score Calculation Functions ---

const calculateComplianceRisk = (entity, submissions) => {
  const today = new Date();
  const overdueSubmissions = submissions.filter(s =>
    (s.status === 'Pending Submission' || s.status === 'Late Submission') && new Date(s.dueDate) < today
  );
  const issuesFoundSubmissions = submissions.filter(s => s.status === 'Reviewed - Issues Found');

  const overdueScore = normalizeCount(overdueSubmissions.length, [0, 2]); // 0 overdue = 1, 1-2 = 3, 3+ = 5
  const issuesScore = normalizeCount(issuesFoundSubmissions.length, [0, 1]); // 0 issues = 1, 1 = 3, 2+ = 5

  return (overdueScore + issuesScore) / 2;
};

const calculateCreditRisk = (entity) => {
    // Deterministically generate financial metrics for the entity
    const nplSeed = deterministicNumber(entity.entityId + "npl", 80) / 10; // Consistent NPL between 0% and 7.9%
    const carSeed = 7 + (deterministicNumber(entity.entityId + "car", 100) / 10); // Consistent CAR between 7% and 16.9%

    entity.simulatedNPL = parseFloat(nplSeed.toFixed(2));
    entity.simulatedCAR = parseFloat(carSeed.toFixed(2));

    const nplScore = normalizePercentage(entity.simulatedNPL, [2, 5], true); // <2% = 1, 2-5% = 3, >5% = 5
    const carScore = normalizePercentage(entity.simulatedCAR, [15, 10], false); // >15% = 1, 10-15% = 3, <10% = 5

    return (nplScore + carScore) / 2;
};

const calculateMarketRisk = (entity, products) => {
  if (!products || products.length === 0) return 1.0;

  const productScores = products.map(p => {
    switch (p.licenseTypeRequired) {
      case 'Crypto Asset Service Provider License': return 5.0;
      case 'Investment Firm License':
      case 'Credit Institution License':
      case 'PISP/AISP License': return 3.0;
      case 'Payment Institution License':
      case 'E-Money Institution License':
      default: return 1.0;
    }
  });

  const avgProductScore = productScores.reduce((a, b) => a + b, 0) / productScores.length;
  // Use entity ID to generate a consistent "random" score
  const simulatedVolatilityScore = deterministicNumber(entity.entityId + "vol", 5) + 1; // Consistent 1-5 score

  return (avgProductScore + simulatedVolatilityScore) / 2;
};

const calculateOperationalRisk = (entity, applications) => {
  const requiredDocTypes = ['Incident Response Plan', 'System Architecture Diagram'];
  let missingDocs = 0;

  const allDocIds = applications.flatMap(app => app.supportingDocumentIds);
  const allDocsForEntity = documentsData.filter(doc => allDocIds.includes(doc.documentId));

  requiredDocTypes.forEach(reqType => {
      const hasDoc = allDocsForEntity.some(doc => doc.documentType === reqType);
      if (!hasDoc) {
          missingDocs++;
      }
  });

  const missingDocsScore = normalizeCount(missingDocs, [0, 1]); // 0 missing = 1, 1 = 3, 2+ = 5

  // Use entity ID to generate a consistent number of incidents
  const simulatedIncidents = deterministicNumber(entity.entityId + "incidents", 6); // 0-5 incidents
  const incidentScore = normalizeCount(simulatedIncidents, [0, 2]); // 0 incidents = 1, 1-2 = 3, 3+ = 5

  return (missingDocsScore + incidentScore) / 2;
};

const calculateGovernanceRisk = (entity) => {
  const pepCount = (entity.directors?.filter(d => d.isPEP).length || 0) + (entity.ubos?.filter(u => u.isPEP).length || 0);
  const pepScore = normalizeCount(pepCount, [0, 1]); // 0 PEPs = 1, 1 = 3, 2+ = 5

  let readinessScore = 1.0;
  switch (entity.complianceReadinessStatus) {
    case 'Under Active Review': readinessScore = 3.0; break;
    case 'Compliance Submission Pending': readinessScore = 5.0; break;
    case 'Ready for Compliance Check':
    default: readinessScore = 1.0; break;
  }

  return (pepScore + readinessScore) / 2;
};


// --- Main Service Function ---

export const calculateAllEntityRisks = () => {
  return entitiesData.map(entity => {
    const entitySubmissions = complianceSubmissionsData.filter(s => s.entityId === entity.entityId);
    const entityLicenses = licensesData.filter(l => l.entityId === entity.entityId);
    const entityProductIds = entityLicenses.map(l => l.productId);
    const entityProducts = productsData.filter(p => entityProductIds.includes(p.productId));
    const entityApplications = licenseApplicationsData.filter(app => app.entityId === entity.entityId);

    const pillarScores = {
      Compliance: calculateComplianceRisk(entity, entitySubmissions),
      Credit: calculateCreditRisk(entity),
      Market: calculateMarketRisk(entity, entityProducts),
      Operational: calculateOperationalRisk(entity, entityApplications),
      Governance: calculateGovernanceRisk(entity),
    };

    const compositeScore = Object.values(pillarScores).reduce((a, b) => a + b, 0) / Object.values(pillarScores).length;

    // Determine Primary Risk Driver
    const primaryRiskDriver = Object.keys(pillarScores).reduce((a, b) => pillarScores[a] > pillarScores[b] ? a : b);

    // Deterministic Trend
    const trends = ['stable', 'up', 'down'];
    const trendIndex = deterministicNumber(entity.entityId, 3);
    const trend = trends[trendIndex];

    return {
      ...entity,
      pillarScores,
      compositeScore,
      primaryRiskDriver,
      trend,
    };
  });
};


// --- Aggregation Functions for Dashboard ---

export const getAggregatedSystemicRisk = (allEntitiesWithScores) => {
    if (!allEntitiesWithScores || allEntitiesWithScores.length === 0) {
        return { totalOverdue: 0, entitiesWithIssues: 0, avgCAR: 'N/A', avgNPL: 'N/A' };
    }

    const today = new Date();
    const allSubmissions = complianceSubmissionsData;

    const overdueEntityIds = new Set();
    allSubmissions.forEach(sub => {
        if ((sub.status === 'Pending Submission' || sub.status === 'Late Submission') && new Date(sub.dueDate) < today) {
            overdueEntityIds.add(sub.entityId);
        }
    });

    const issuesFoundEntityIds = new Set();
    allSubmissions.forEach(sub => {
        if (sub.status === 'Reviewed - Issues Found') {
            issuesFoundEntityIds.add(sub.entityId);
        }
    });

    const totalCAR = allEntitiesWithScores.reduce((sum, entity) => sum + (entity.simulatedCAR || 0), 0);
    const totalNPL = allEntitiesWithScores.reduce((sum, entity) => sum + (entity.simulatedNPL || 0), 0);

    return {
        totalOverdue: overdueEntityIds.size,
        entitiesWithIssues: issuesFoundEntityIds.size,
        avgCAR: (totalCAR / allEntitiesWithScores.length).toFixed(1) + '%',
        avgNPL: (totalNPL / allEntitiesWithScores.length).toFixed(1) + '%',
    };
};

export const getSectorRiskTrends = (allEntitiesWithScores) => {
    const sectorRisks = {};
    const sectorCounts = {};

    allEntitiesWithScores.forEach(entity => {
        const entityLicenses = licensesData.filter(l => l.entityId === entity.entityId && l.licenseStatus === 'Active');
        if (entityLicenses.length > 0) {
            const licenseType = entityLicenses[0].licenseType;
            if (!sectorRisks[licenseType]) {
                sectorRisks[licenseType] = 0;
                sectorCounts[licenseType] = 0;
            }
            sectorRisks[licenseType] += entity.compositeScore;
            sectorCounts[licenseType]++;
        }
    });

    const trends = ['stable', 'up', 'down'];
    return Object.keys(sectorRisks).map(sector => ({
        name: sector.replace(' License', ''),
        avgRiskScore: (sectorRisks[sector] / sectorCounts[sector]).toFixed(1),
        trend: trends[deterministicNumber(sector, 3)], // Deterministic trend for the sector
    }));
};

export const runStressTestForEntity = (entityId, scenario) => {
  const baseData = stressTestData[entityId];
  if (!baseData) {
    throw new Error("No stress test data available for this entity.");
  }

  // Calculate pre-stress metrics
  const preStress = {
    car: (baseData.tier1Capital / baseData.riskWeightedAssets) * 100,
    nplAmount: baseData.loanPortfolio.reduce((acc, loan) => acc + (loan.amount * loan.nplRate), 0),
    profitability: baseData.totalAssets * baseData.netInterestMargin,
  };
  preStress.nplRatio = (preStress.nplAmount / baseData.loanPortfolio.reduce((acc, loan) => acc + loan.amount, 0)) * 100;

  const postStress = { ...preStress };
  let impactSummary = "";

  // Apply the selected shock
  switch (scenario.type) {
    case 'INTEREST_RATE_SHOCK': {
      const marginReduction = baseData.netInterestMargin * scenario.shockValue;
      postStress.profitability = baseData.totalAssets * (baseData.netInterestMargin - marginReduction);
      impactSummary = `A ${scenario.shockValue * 100}% reduction in Net Interest Margin decreases profitability.`;
      break;
    }
    case 'CREDIT_DEFAULT_SHOCK': {
      let newNplAmount = 0;
      baseData.loanPortfolio.forEach(loan => {
        const isAffected = loan.sector === scenario.sector;
        const newNplRate = isAffected ? loan.nplRate + (loan.nplRate * scenario.shockValue) : loan.nplRate;
        newNplAmount += loan.amount * newNplRate;
      });
      const creditLoss = newNplAmount - preStress.nplAmount;
      const postStressCapital = baseData.tier1Capital - creditLoss;
      postStress.car = (postStressCapital / baseData.riskWeightedAssets) * 100;
      postStress.nplAmount = newNplAmount;
      postStress.nplRatio = (newNplAmount / baseData.loanPortfolio.reduce((acc, loan) => acc + loan.amount, 0)) * 100;
      impactSummary = `A ${scenario.shockValue * 100}% NPL increase in ${scenario.sector} resulted in a credit loss of ${creditLoss.toLocaleString()}.`;
      break;
    }
    default:
      throw new Error("Unknown stress test scenario.");
  }

  return { preStress, postStress, impactSummary };
};

export const runMacroStressTest = (entityId, scenario) => {
  // This is a mock implementation. A real one would be much more complex.
  const baseData = stressTestData[entityId];
  if (!baseData) {
    throw new Error("No stress test data available for this entity.");
  }
  // ... more complex logic here
  return { preStress: {}, postStress: {}, impactSummary: "Macro stress test completed." };
};

export const runSystemWideStressTest = (scenario) => {
  // This is a mock implementation.
  return { impactSummary: "System-wide stress test completed." };
};

export const runReverseStressTest = (entityId, failureThreshold) => {
  // This is a mock implementation.
  return { scenario: "A 25% drop in real estate prices would breach the capital threshold.", impactSummary: "Reverse stress test completed." };
};

export const calculateStressTestCorrelations = () => {
  // This is a mock implementation.
  return advancedStressTestData.systemWideParameters.sectorCorrelations;
};


// --- NEW: Unified Risk Assessment Function ---
export const getComprehensiveRiskAssessment = async (entityId) => {
    // This function aggregates data from various new services for a single entity.
    const alerts = await riskMonitoringService.generateRiskAlerts();
    const allSupervisoryActions = await supervisionService.getSupervisoryActions(entityId);

    const [
        basicRisk,
        baselIII,
        icaapStatus,
        liquidityRatios,
        earlyWarning,
        marketRisk,
        reportingStatus,
        defiRisk, // Not entity-specific, but we can include it
    ] = await Promise.all([
        calculateAllEntityRisks().find(e => e.entityId === entityId),
        baselIIIService.calculateCapitalAdequacyRatio(entityId),
        supervisionService.getICAAPStatus(entityId),
        baselIIIService.getLiquidityRatios(entityId),
        riskMonitoringService.getEarlyWarningIndicators(entityId),
        marketRiskService.generateMarketRiskReport(entityId),
        riskReportingService.checkReportingCompliance(entityId),
        defiRiskService.generateDeFiRiskReport(), // This is system-wide
    ]);

    return {
        basicRisk: basicRisk || null,
        baselIII: baselIII || null,
        supervision: {
          icaap: icaapStatus,
          actions: allSupervisoryActions
        },
        monitoring: {
          alerts: alerts.filter(a => a.entityId === entityId),
          warnings: earlyWarning,
        },
        marketRisk: marketRisk || null,
        defiRisk: defiRisk || null, // Included for context, but not specific to the entity
        reporting: reportingStatus || null,
    };
};