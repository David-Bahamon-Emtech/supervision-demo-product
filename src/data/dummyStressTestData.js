// src/data/dummyStressTestData.js

/**
 * @typedef {Object} LoanPortfolioItem
 * @property {string} sector - The economic sector of the loan.
 * @property {number} amount - The total value of loans in this sector.
 * @property {number} nplRate - The current non-performing loan rate for this sector.
 */

/**
 * @typedef {Object} EntityFinancials
 * @property {number} totalAssets - Total assets of the entity.
 * @property {number} riskWeightedAssets - RWA used for capital adequacy calculations.
 * @property {number} tier1Capital - Core capital of the entity.
 * @property {LoanPortfolioItem[]} loanPortfolio - A breakdown of the entity's loan book.
 * @property {number} netInterestMargin - The entity's net interest margin.
 */

/** @type {Object.<string, EntityFinancials>} */
export const stressTestData = {
  // Data for Oakmark Strategic Holdings
  "ent_001": {
    totalAssets: 500000000,
    riskWeightedAssets: 350000000,
    tier1Capital: 55000000, // 15.7% CAR
    netInterestMargin: 0.025,
    loanPortfolio: [
      { sector: 'Commercial Real Estate', amount: 150000000, nplRate: 0.04 },
      { sector: 'Consumer Lending', amount: 120000000, nplRate: 0.05 },
      { sector: 'Energy Sector', amount: 80000000, nplRate: 0.08 }
    ]
  },
  // Data for Pinnacle Stone Investments
  "ent_002": {
    totalAssets: 850000000,
    riskWeightedAssets: 600000000,
    tier1Capital: 68000000, // 11.3% CAR
    netInterestMargin: 0.018,
    loanPortfolio: [
      { sector: 'Commercial Real Estate', amount: 400000000, nplRate: 0.07 },
      { sector: 'Tourism & Hospitality', amount: 250000000, nplRate: 0.12 },
      { sector: 'Retail', amount: 100000000, nplRate: 0.06 }
    ]
  },
   // Data for Silvercrest Financial Solutions
  "ent_009": {
    totalAssets: 320000000,
    riskWeightedAssets: 220000000,
    tier1Capital: 33000000, // 15% CAR
    netInterestMargin: 0.031,
    loanPortfolio: [
      { sector: 'Consumer Lending', amount: 200000000, nplRate: 0.03 },
      { sector: 'Agriculture', amount: 50000000, nplRate: 0.06 },
    ]
  }
};
