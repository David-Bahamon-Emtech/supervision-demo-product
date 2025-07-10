// src/components/RiskAssessment/DeFiRiskDashboard.jsx

import React, { useState, useEffect } from 'react';
import {
  getProtocolTVL,
  checkCollateralizationRatio,
  assessSmartContractRisk,
  getLiquidityPoolRisk,
  generateDeFiRiskReport
} from '../../services/defiRiskService.js';

// --- Reusable Components ---
const DeFiCard = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">{title}</h3>
        <div className="space-y-3">{children}</div>
    </div>
);

const DataMetric = ({ label, value, subtext = null }) => (
    <div className="py-2 border-b border-gray-100 last:border-b-0">
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        {subtext && <p className="text-xs text-gray-400">{subtext}</p>}
    </div>
);


const DeFiRiskDashboard = () => {
    const [defiData, setDefiData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDeFiData = async () => {
            setIsLoading(true);
            try {
                // generateDeFiRiskReport fetches the whole mock data object
                const data = await generateDeFiRiskReport();
                setDefiData(data);
            } catch (err) {
                console.error("Failed to load DeFi risk data:", err);
                setError("Could not load DeFi risk dashboard data.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDeFiData();
    }, []);

    if (isLoading) {
        return <div className="p-6 text-center text-gray-500">Loading DeFi Risk Data...</div>;
    }

    if (error) {
        return <div className="p-6 text-center text-red-600 bg-red-100 rounded-md">{error}</div>;
    }
    
    if (!defiData) {
        return <div className="p-6 text-center text-gray-500">No DeFi risk data available.</div>
    }

    const protocol = Object.values(defiData.protocols)[0];
    const stablecoin = Object.values(defiData.collateralMonitoring)[0];
    const pool = Object.values(defiData.liquidityPools)[0];
    const contractRisk = Object.values(defiData.smartContractRisks)[0];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-semibold text-gray-800">Decentralized Finance (DeFi) Risk Analysis</h2>
                <p className="text-sm text-gray-600 mt-1">Monitoring on-chain activity and protocol-specific risks for licensed DeFi entities.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                <DeFiCard title="Protocol Overview">
                    <DataMetric label="Protocol Name" value={protocol.name} subtext={protocol.type} />
                    <DataMetric label="Total Value Locked (TVL)" value={`$${protocol.tvl.toLocaleString()}`} />
                    <DataMetric label="Audit Status" value={protocol.auditStatus} subtext={`Last Audited: ${protocol.lastAudit}`} />
                </DeFiCard>

                <DeFiCard title="Stablecoin Collateralization">
                    <DataMetric label="Stablecoin" value={stablecoin.name} />
                    <DataMetric 
                        label="Collateralization Ratio" 
                        value={`${(stablecoin.collateralizationRatio * 100).toFixed(1)}%`} 
                        subtext={`Warning at ${(stablecoin.warningLevel * 100).toFixed(0)}%`}
                    />
                    <DataMetric label="Collateral Value" value={`$${stablecoin.collateralValue.toLocaleString()}`} />
                </DeFiCard>
                
                <DeFiCard title="Smart Contract Risk">
                    <DataMetric label="Code Audit Score" value={contractRisk.codeAuditScore} subtext="/ 10.0" />
                    <DataMetric label="Upgradeability Risk" value={contractRisk.upgradeabilityRisk} />
                    <DataMetric label="Admin Key Risk" value={contractRisk.adminKeyRisk} />
                    <DataMetric label="Oracle Risk" value={contractRisk.oracleRisk} />
                </DeFiCard>
                
                 <DeFiCard title="Liquidity Pool Analysis">
                    <DataMetric label="Pool" value={`${pool.token1}/${pool.token2}`} />
                    <DataMetric label="Total Liquidity" value={`$${pool.liquidity.toLocaleString()}`} />
                    <DataMetric label="24h Volume" value={`$${pool.volume24h.toLocaleString()}`} />
                    <DataMetric label="Volatility" value={`${(pool.volatility * 100).toFixed(1)}%`} />
                </DeFiCard>
                
            </div>
        </div>
    );
};

export default DeFiRiskDashboard;