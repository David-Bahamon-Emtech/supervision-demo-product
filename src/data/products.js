/**
 * @typedef {Object} Product
 * @property {string} productId - Unique ID (e.g., "prod_001").
 * @property {string} entityId - Links to Entity.entityId.
 * @property {string} productName - The name of the product/service (e.g., "PayCell", "CrypTrade").
 * @property {string} description - Brief description of the product.
 * @property {string} licenseTypeRequired - (e.g., "Payment Institution License", "Crypto Asset Service Provider License").
 */

/** @type {Product[]} */
const products = [
  {
    productId: "prod_001",
    entityId: "ent_001",
    productName: "SummitPay Direct",
    description: "Direct payment processing solution for online merchants.",
    licenseTypeRequired: "Payment Institution License",
  },
  {
    productId: "prod_002",
    entityId: "ent_001",
    productName: "Summit E-Wallet",
    description: "Consumer-focused e-wallet for online and P2P payments.",
    licenseTypeRequired: "Payment Institution License",
  },
  {
    productId: "prod_003",
    entityId: "ent_002",
    productName: "ApexTrade Crypto",
    description: "Platform for buying, selling, and storing crypto assets.",
    licenseTypeRequired: "E-Money Institution License",
  },
  {
    productId: "prod_004",
    entityId: "ent_003",
    productName: "GlobalInvest Portfolio",
    description: "Managed investment portfolios for retail investors.",
    licenseTypeRequired: "E-Money Institution License",
  },
  {
    productId: "prod_005",
    entityId: "ent_004",
    productName: "SecureLend P2P",
    description: "Peer-to-peer lending platform for consumer loans.",
    licenseTypeRequired: "Crypto Asset Service Provider License",
  },
  {
    productId: "prod_006",
    entityId: "ent_005",
    productName: "FinAdvisor Connect",
    description: "Account information service provider for consolidated financial views.",
    licenseTypeRequired: "Crypto Asset Service Provider License",
  },
  {
    productId: "prod_007",
    entityId: "ent_006",
    productName: "TrustGuard Payments",
    description: "Escrow and third-party payment holding services.",
    licenseTypeRequired: "Investment Firm License",
  },
  {
    productId: "prod_008",
    entityId: "ent_007",
    productName: "PartnerFX Solutions",
    description: "Forex trading platform for institutional clients.",
    licenseTypeRequired: "Investment Firm License",
  },
  {
    productId: "prod_009",
    entityId: "ent_008",
    productName: "InnovatePay Gateway",
    description: "Advanced payment gateway with integrated fraud detection.",
    licenseTypeRequired: "Credit Institution License",
  },
  {
    productId: "prod_010",
    entityId: "ent_009",
    productName: "CryptoVest Fund",
    description: "Investment fund focused on digital and crypto assets.",
    licenseTypeRequired: "Credit Institution License",
  },
  {
    productId: "prod_011",
    entityId: "ent_010",
    productName: "WealthFlow Manager",
    description: "Comprehensive wealth management and financial advisory services.",
    licenseTypeRequired: "PISP/AISP License",
  },
  {
    productId: "prod_012",
    entityId: "ent_011",
    productName: "HorizonCrowd Equity",
    description: "Equity crowdfunding platform for startups and SMEs.",
    licenseTypeRequired: "PISP/AISP License",
  },
  {
    productId: "prod_013",
    entityId: "ent_012", // Horizon Financial
    productName: "MicroUnity Finance",
    description: "Micro-lending and financial inclusion services.",
    licenseTypeRequired: "Credit Institution License",
  },
  {
    productId: "prod_014",
    entityId: "ent_013", // Horizon Investments
    productName: "DigitalSafe Custody",
    description: "Custody solutions for digital assets and cryptocurrencies.",
    licenseTypeRequired: "Crypto Asset Service Provider License",
  },
  {
    productId: "prod_015",
    entityId: "ent_014", // Horizon Holdings
    productName: "TenRing Payments",
    description: "Global payment network for cross-border transactions.",
    licenseTypeRequired: "Payment Institution License",
  },
  {
    productId: "prod_016",
    entityId: "ent_015", // Horizon Advisors
    productName: "PymParticle Payments",
    description: "Micropayments solution for digital content and services.",
    licenseTypeRequired: "E-Money Institution License",
  },
  {
    productId: "prod_017",
    entityId: "ent_016", // Horizon Trust
    productName: "ShieldTrust SecurePay",
    description: "Secure payment processing for high-risk industries.",
    licenseTypeRequired: "Payment Institution License",
  },
  {
    productId: "prod_018",
    entityId: "ent_017", // Horizon Partners
    productName: "ReguSure ComplyTech",
    description: "RegTech solution for automated compliance reporting (AISP functionalities).",
    licenseTypeRequired: "PISP/AISP License",
  },
  {
    productId: "prod_019",
    entityId: "ent_018", // Horizon Capital Management
    productName: "SigmaAI TradingBot",
    description: "AI-driven automated trading platform for various asset classes.",
    licenseTypeRequired: "Investment Firm License",
  },
  {
    productId: "prod_020",
    entityId: "ent_019", // Horizon Asset Management
    productName: "WakandaDeFi Access",
    description: "Decentralized finance (DeFi) access and investment platform.",
    licenseTypeRequired: "Crypto Asset Service Provider License",
  },
  {
    productId: "prod_021",
    entityId: "ent_020", // Horizon Finance Group
    productName: "DoomCoin Exchange",
    description: "Centralized cryptocurrency exchange with advanced trading features.",
    licenseTypeRequired: "Crypto Asset Service Provider License",
  },
  {
    productId: "prod_022",
    entityId: "ent_021", // Pioneer Capital
    productName: "Veidt Secure Payments",
    description: "Ultra-secure payment initiation service for large enterprises.",
    licenseTypeRequired: "PISP/AISP License",
  },
  {
    productId: "prod_023",
    entityId: "ent_022", // Pioneer Financial
    productName: "HandPay Solutions",
    description: "Merchant payment solutions and point-of-sale integrations.",
    licenseTypeRequired: "Payment Institution License",
  },
  {
    productId: "prod_024",
    entityId: "ent_023", // Pioneer Investments
    productName: "Ultron AlgoInvest",
    description: "Algorithmic investment strategies for institutional investors.",
    licenseTypeRequired: "Investment Firm License",
  }
];

export default products;