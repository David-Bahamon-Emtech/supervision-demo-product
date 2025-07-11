// src/services/aiMacroAnalyticsService.js

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Sends a natural language query to the AI backend for macro risk analysis.
 * @param {string} naturalLanguageQuery The user's query.
 * @returns {Promise<Object>} The structured response from the AI.
 */
export const queryMacroRisks = async (naturalLanguageQuery) => {
  try {
    // This endpoint reuses the general analytics agent on the backend
    const response = await axios.post(`${API_BASE_URL}/analytics/query`, {
      query: naturalLanguageQuery,
    });
    return response.data;
  } catch (error) {
    console.error("Error querying macro risks:", error);
    throw new Error(error.response?.data?.error || "Failed to query AI analytics service.");
  }
};

/**
 * Sends stress test results to the AI backend for narrative generation.
 * @param {Object} scenarioResults The results from a stress test run.
 * @returns {Promise<Object>} An object containing the AI-generated narrative.
 */
export const generateStressTestNarrative = async (scenarioResults) => {
  try {
    // In a real app, this would be a dedicated endpoint. We'll simulate it.
    console.log("Simulating AI narrative generation for stress test:", scenarioResults);
    // This is a mock response. The real implementation would call the AI backend.
    const narrative = `The stress test under the "${scenarioResults.scenarioName}" scenario revealed significant vulnerabilities. The system-wide CAR dropped to ${scenarioResults.postStress.car}, which is below the regulatory minimum. The primary driver was a 40% increase in credit defaults, leading to substantial capital erosion. Recommendations include immediate recapitalization plans for the most affected institutions and a temporary halt on high-risk lending.`;
    
    return await Promise.resolve({ narrative });

  } catch (error) {
    console.error("Error generating stress test narrative:", error);
    throw new Error("Failed to generate AI narrative for stress test.");
  }
};


/**
 * Sends uploaded regulatory documents for trend analysis.
 * @param {File[]} documents - An array of File objects to be analyzed.
 * @returns {Promise<Object>} The AI's analysis of trends and impacts.
 */
export const analyzeCrossJurisdictionalTrends = async (documents) => {
  const formData = new FormData();
  documents.forEach(doc => {
    formData.append('documents', doc);
  });

  try {
    // This would point to a specific backend endpoint for document analysis.
    // Re-using the risk analysis endpoint for demonstration purposes.
    const response = await axios.post(`${API_BASE_URL}/risk/analyze-document`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    // We would need to add post-processing logic here to format the response
    // into a trend analysis report.
    return response.data;
  } catch (error) {
    console.error("Error analyzing cross-jurisdictional documents:", error);
    throw new Error(error.response?.data?.error || "Failed to analyze documents.");
  }
};

/**
 * Simulates calling an ML model to predict systemic events.
 * @param {string} timeHorizon - The time horizon for the prediction (e.g., "12-months").
 * @returns {Promise<Object>} An object with probability assessments and key risk factors.
 */
export const predictSystemicEvents = async (timeHorizon) => {
  try {
    // This is a mock of a call to a predictive ML model.
    console.log(`Simulating prediction for a systemic event within ${timeHorizon}`);
    
    const probability = Math.random() * (0.4 - 0.05) + 0.05; // Random probability between 5% and 40%
    
    return await Promise.resolve({
      timeHorizon,
      eventProbability: probability.toFixed(3),
      keyRiskFactors: [
        "Elevated NPL Ratios in Commercial Real Estate",
        "High Interconnectedness between Top 3 Banks",
        "Deteriorating Corporate Debt Quality"
      ],
      confidence: "Medium"
    });
  } catch (error) {
    console.error("Error predicting systemic events:", error);
    throw new Error("Failed to get prediction from ML service.");
  }
};

/**
 * Generates a comprehensive macro supervision report using AI.
 * @param {Object} data - The aggregated data for the report.
 * @param {string} entityId - Optional entityId for a specific focus.
 * @returns {Promise<Object>} The AI-generated report.
 */
export const generateMacroSupervisionReport = async (data, entityId = null) => {
    try {
        // This is a mock. A real implementation would send 'data' to the AI.
        console.log("Generating AI Macro Supervision Report for:", entityId || "System-wide");

        return await Promise.resolve({
            title: `AI-Generated Macro-Prudential Report`,
            date: new Date().toISOString(),
            executiveSummary: "The financial system exhibits moderate resilience but shows emerging vulnerabilities in the credit sector. Liquidity remains strong, but profitability is under pressure from interest margin compression. Immediate attention should be given to the rising NPL ratio.",
            sections: [
                { title: "Capital Adequacy", content: "Capital ratios are currently sufficient, but a downward trend in CAR suggests potential future issues under stress." },
                { title: "Credit Risk", content: "The primary concern is the increase in NPLs, driven by the commercial real estate and energy sectors. This poses a significant risk to several key institutions." },
                { title: "Liquidity Analysis", content: "Liquidity coverage is robust across the system, providing a buffer against short-term shocks." }
            ],
        });
    } catch (error) {
        console.error("Error generating AI macro supervision report:", error);
        throw new Error("Failed to generate AI report.");
    }
};

/**
 * Reuses the existing regulatory update analysis endpoint for a different purpose.
 * @param {File} uploadedDoc - The single document to analyze.
 * @returns {Promise<Object>} The analysis result.
 */
export const analyzeRegulatoryDocuments = async (uploadedDoc) => {
    const formData = new FormData();
    formData.append('document', uploadedDoc);
    
    try {
        const response = await axios.post(`${API_BASE_URL}/updates/upload-and-analyze`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    } catch (error) {
        console.error("Error analyzing regulatory document:", error);
        throw new Error(error.response?.data?.error || "Failed to analyze regulatory document.");
    }
};