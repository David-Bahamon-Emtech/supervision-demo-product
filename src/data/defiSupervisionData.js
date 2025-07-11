// src/data/defiSupervisionData.js

/**
 * @typedef {Object} ProtocolData
 * @property {string} id - Unique ID for the protocol.
 * @property {string} name - Name of the DeFi protocol.
 * @property {string} type - Type of protocol (e.g., 'DEX', 'Lending', 'Stablecoin').
 * @property {number} tvl - Total Value Locked in USD.
 * @property {string} governanceToken - The symbol of the governance token.
 * @property {number} collateralizationRatio - For lending/stablecoin protocols.
 */

/** @type {Object.<string, ProtocolData>} */
export const protocolMonitoring = {
  'proto_001': { id: 'proto_001', name: 'Aave', type: 'Lending', tvl: 6500000000, governanceToken: 'AAVE', collateralizationRatio: 1.65 },
  'proto_002': { id: 'proto_002', name: 'Uniswap', type: 'DEX', tvl: 4200000000, governanceToken: 'UNI', collateralizationRatio: null },
  'proto_003': { id: 'proto_003', name: 'MakerDAO', type: 'Stablecoin', tvl: 5300000000, governanceToken: 'MKR', collateralizationRatio: 1.55 },
  'proto_004': { id: 'proto_004', name: 'Curve', type: 'DEX', tvl: 3800000000, governanceToken: 'CRV', collateralizationRatio: null },
  'proto_005': { id: 'proto_005', name: 'Lido', type: 'Liquid Staking', tvl: 14000000000, governanceToken: 'LDO', collateralizationRatio: null },
  'proto_006': { id: 'proto_006', name: 'Compound', type: 'Lending', tvl: 2100000000, governanceToken: 'COMP', collateralizationRatio: 1.45 },
  'proto_007': { id: 'proto_007', name: 'SushiSwap', type: 'DEX', tvl: 500000000, governanceToken: 'SUSHI', collateralizationRatio: null },
  'proto_008': { id: 'proto_008', name: 'Frax Finance', type: 'Stablecoin', tvl: 1000000000, governanceToken: 'FXS', collateralizationRatio: 1.02 },
  'proto_009': { id: 'proto_009', name: 'Balancer', type: 'DEX', tvl: 750000000, governanceToken: 'BAL', collateralizationRatio: null },
  'proto_010': { id: 'proto_010', name: 'Synthetix', type: 'Derivatives', tvl: 900000000, governanceToken: 'SNX', collateralizationRatio: 4.5 },
};

/**
 * @typedef {Object} SmartContractRisk
 * @property {string} contractAddress - Address of the primary smart contract.
 * @property {number} auditScore - Score from 1-10 from the latest audit.
 * @property {string[]} findings - Summary of high/medium severity findings.
 * @property {'High' | 'Medium' | 'Low' | 'None'} upgradeRisk - Risk associated with contract upgradeability.
 * @property {string[]} oracleDependencies - List of oracle services the protocol depends on.
 * @property {'Centralized' | 'Multi-sig' | 'DAO' | 'None'} adminKeyRisk - Type of admin key control.
 */

/** @type {Object.<string, SmartContractRisk>} */
export const smartContractRisks = {
  'proto_001': { contractAddress: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', auditScore: 9.2, findings: ['Minor gas optimization issues'], upgradeRisk: 'Medium', oracleDependencies: ['Chainlink'], adminKeyRisk: 'DAO' },
  'proto_002': { contractAddress: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', auditScore: 9.5, findings: [], upgradeRisk: 'None', oracleDependencies: [], adminKeyRisk: 'DAO' },
  'proto_003': { contractAddress: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2', auditScore: 8.8, findings: ['Potential for oracle manipulation under extreme conditions'], upgradeRisk: 'High', oracleDependencies: ['Custom Oracles', 'Chainlink'], adminKeyRisk: 'DAO' },
  'proto_006': { contractAddress: '0xc00e94Cb662C3520282E6f5717214004A7f26888', auditScore: 8.5, findings: ['Governance token centralization'], upgradeRisk: 'Medium', oracleDependencies: ['Chainlink'], adminKeyRisk: 'Multi-sig' },
  'proto_008': { contractAddress: '0x853d955aCEf822Db058eb8505911ED77F175b99e', auditScore: 7.9, findings: ['Algorithmic stability concerns under market stress'], upgradeRisk: 'High', oracleDependencies: ['Chainlink', 'Uniswap TWAP'], adminKeyRisk: 'Multi-sig' },
};

/**
 * @typedef {Object} CrossChainExposure
 * @property {string} bridgeName - Name of the cross-chain bridge.
 * @property {string[]} supportedChains - Chains the bridge connects.
 * @property {number} tvl - Total value locked in the bridge in USD.
 * @property {'High' | 'Medium' | 'Low'} riskRating - Assessed risk rating of the bridge's security.
 */

/** @type {CrossChainExposure[]} */
export const crossChainExposures = [
  { bridgeName: 'Wormhole', supportedChains: ['Ethereum', 'Solana', 'BNB Chain', 'Avalanche'], tvl: 2500000000, riskRating: 'Medium' },
  { bridgeName: 'LayerZero', supportedChains: ['Ethereum', 'Arbitrum', 'Optimism', 'Polygon'], tvl: 1800000000, riskRating: 'Low' },
  { bridgeName: 'Multichain (defunct)', supportedChains: ['Fantom', 'Ethereum', 'BNB Chain'], tvl: 100000000, riskRating: 'High' },
  { bridgeName: 'Polygon PoS Bridge', supportedChains: ['Ethereum', 'Polygon'], tvl: 3200000000, riskRating: 'Low' },
];

/**
 * @typedef {Object} RegulatoryNode
 * @property {string} nodeId - Unique ID for the regulatory node.
 * @property {string} protocolId - The protocol the node is monitoring.
 * @property {'Active' | 'Degraded' | 'Offline'} status - The operational status of the node.
 * @property {number} transactionsMonitored24h - Number of transactions monitored in the last 24 hours.
 * @property {number} complianceChecksPassed - Percentage of transactions passing automated compliance checks.
 */

/** @type {RegulatoryNode[]} */
export const regulatoryNodes = [
  { nodeId: 'regnode_001', protocolId: 'proto_001', status: 'Active', transactionsMonitored24h: 12500, complianceChecksPassed: 99.8 },
  { nodeId: 'regnode_002', protocolId: 'proto_003', status: 'Active', transactionsMonitored24h: 8750, complianceChecksPassed: 99.5 },
  { nodeId: 'regnode_003', protocolId: 'proto_008', status: 'Degraded', transactionsMonitored24h: 4500, complianceChecksPassed: 98.2 },
];

/**
 * @typedef {Object} OnChainAlert
 * @property {string} alertId - Unique alert ID.
 * @property {string} protocolId - The protocol where the alert was triggered.
 * @property {string} title - A short title for the alert.
 * @property {string} description - A detailed description of the alert.
 * @property {'High' | 'Medium' | 'Low'} severity - The severity of the alert.
 * @property {string} transactionHash - The blockchain transaction hash associated with the alert.
 * @property {string} timestamp - ISO timestamp of when the alert was triggered.
 */

/** @type {OnChainAlert[]} */
export const onChainAlerts = [
  { alertId: 'OCA001', protocolId: 'proto_008', title: 'Collateral Ratio Breach', description: 'Frax Finance collateralization ratio dropped below the 103% warning threshold to 102%.', severity: 'Medium', transactionHash: '0xabc...', timestamp: '2025-06-24T10:30:00Z' },
  { alertId: 'OCA002', protocolId: 'proto_001', title: 'Large Governance Token Movement', description: '2.5M AAVE tokens moved from a known founder wallet to a centralized exchange.', severity: 'Low', transactionHash: '0xdef...', timestamp: '2025-06-24T09:15:00Z' },
  { alertId: 'OCA003', protocolId: 'proto_003', title: 'High-Risk Wallet Interaction', description: 'A loan of 500,000 DAI was issued against collateral from a wallet associated with a sanctioned entity.', severity: 'High', transactionHash: '0xghi...', timestamp: '2025-06-23T20:00:00Z' },
  { alertId: 'OCA004', protocolId: 'proto_002', title: 'Flash Loan Detected', description: 'A large flash loan of 25,000 ETH was detected on Uniswap, potentially for arbitrage or exploitation.', severity: 'Low', transactionHash: '0xjkl...', timestamp: '2025-06-24T11:45:00Z' },
  { alertId: 'OCA005', protocolId: 'proto_006', title: 'Admin Key Function Used', description: 'An admin key on the Compound protocol was used to pause a market.', severity: 'High', transactionHash: '0xmno...', timestamp: '2025-06-22T18:00:00Z' },
  { alertId: 'OCA006', protocolId: 'proto_008', title: 'Slippage Anomaly', description: 'Unusually high slippage detected in the FRAX/USDC pool, suggesting low liquidity or manipulation.', severity: 'Medium', transactionHash: '0xpqr...', timestamp: '2025-06-24T12:00:00Z'},
  { alertId: 'OCA007', protocolId: 'proto_001', title: 'Liquidations Spike', description: 'A 200% increase in loan liquidations occurred in the last hour.', severity: 'Medium', transactionHash: '0xstu...', timestamp: '2025-06-24T14:20:00Z'},
  { alertId: 'OCA008', protocolId: 'proto_003', title: 'Oracle Price Discrepancy', description: 'The price oracle for WETH deviated by more than 2% from major exchanges.', severity: 'High', transactionHash: '0xvwx...', timestamp: '2025-06-23T10:00:00Z'},
  { alertId: 'OCA009', protocolId: 'proto_002', title: 'New Token Listing Without Audit', description: 'A new, unaudited token was added to the default Uniswap list.', severity: 'Low', transactionHash: '0xyza...', timestamp: '2025-06-21T08:00:00Z'},
  { alertId: 'OCA010', protocolId: 'proto_005', title: 'Staking Derivative De-Peg', description: 'The stETH to ETH ratio has deviated by more than 1.5%.', severity: 'Medium', transactionHash: '0x123...', timestamp: '2025-06-24T15:00:00Z'},
  { alertId: 'OCA011', protocolId: 'proto_001', title: 'Compliance Rule Violation', description: 'Transaction from a blacklisted address was not blocked by the compliance wrapper.', severity: 'High', transactionHash: '0x456...', timestamp: '2025-06-24T16:00:00Z'},
  { alertId: 'OCA012', protocolId: 'proto_004', title: 'Large Withdrawal From Bridge', description: 'Over $50M withdrawn from the Curve pool on a cross-chain bridge in a single transaction.', severity: 'Medium', transactionHash: '0x789...', timestamp: '2025-06-22T05:00:00Z'},
  { alertId: 'OCA013', protocolId: 'proto_010', title: 'Excessive Minting of Synthetic Asset', description: 'An unusual amount of sUSD was minted, potentially unbacked.', severity: 'High', transactionHash: '0xabc...', timestamp: '2025-06-23T19:00:00Z'},
  { alertId: 'OCA014', protocolId: 'proto_008', title: 'Governance Vote Manipulation', description: 'A single address acquired enough FXS to swing a critical governance vote.', severity: 'High', transactionHash: '0xdef...', timestamp: '2025-06-21T12:00:00Z'},
  { alertId: 'OCA015', protocolId: 'proto_002', title: 'MEV Bot Front-Running', description: 'Consistent front-running activity detected on large trades, indicating potential market manipulation.', severity: 'Low', transactionHash: '0xghi...', timestamp: '2025-06-24T13:00:00Z'},
  { alertId: 'OCA016', protocolId: 'proto_001', title: 'High-Value Loan to Unverified Entity', description: 'A loan exceeding $1M was made to a newly created, unverified smart contract address.', severity: 'Medium', transactionHash: '0xjkl...', timestamp: '2025-06-24T17:00:00Z'},
  { alertId: 'OCA017', protocolId: 'proto_003', title: 'Emergency Shutdown Mechanism Triggered', description: 'The emergency shutdown for a specific vault has been triggered by a multi-sig owner.', severity: 'High', transactionHash: '0xmno...', timestamp: '2025-06-22T22:00:00Z'},
  { alertId: 'OCA018', protocolId: 'proto_004', title: 'Anomalous Pool Weighting Change', description: 'The weights of a major Curve pool were changed unexpectedly outside of a governance vote.', severity: 'Medium', transactionHash: '0xpqr...', timestamp: '2025-06-23T04:00:00Z'},
  { alertId: 'OCA019', protocolId: 'proto_006', title: 'Self-Liquidation Detected', description: 'An address has taken actions that led to the liquidation of its own position, possibly to manipulate oracle prices.', severity: 'Medium', transactionHash: '0xstu...', timestamp: '2025-06-24T06:00:00Z'},
  { alertId: 'OCA020', protocolId: 'proto_010', title: 'Debt Pool Imbalance', description: 'The debt pool for a specific synthetic asset is highly skewed, indicating potential insolvency risk.', severity: 'High', transactionHash: '0xvwx...', timestamp: '2025-06-24T18:00:00Z'},
];