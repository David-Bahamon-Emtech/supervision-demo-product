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
    <div className="bg-theme-bg-secondary p-4 rounded-lg shadow-lg border border-theme-border">
        <h3 className="text-md font-semibold text-theme-text-primary border-b border-theme-border pb-2 mb-3">{title}</h3>
        <div className="space-y-2">{children}</div>
    </div>
);

const CompactMetric = ({ label, value, subtext = null }) => (
    <div className="flex justify-between items-center py-1">
        <div>
            <p className="text-sm text-theme-text-primary">{label}</p>
            {subtext && <p className="text-xs text-theme-text-secondary">{subtext}</p>}
        </div>
        <p className="text-lg font-semibold text-theme-text-primary">{value}</p>
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
        return <div className="p-6 text-center text-theme-text-secondary">Loading DeFi Risk Data...</div>;
    }

    if (error) {
        return <div className="p-6 text-center text-red-400 bg-red-900 bg-opacity-30 rounded-md">{error}</div>;
    }
    
    if (!defiData) {
        return <div className="p-6 text-center text-theme-text-secondary">No DeFi risk data available.</div>
    }

    const protocol = Object.values(defiData.protocols)[0];
    const stablecoin = Object.values(defiData.collateralMonitoring)[0];
    const pool = Object.values(defiData.liquidityPools)[0];
    const contractRisk = Object.values(defiData.smartContractRisks)[0];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-semibold text-theme-text-primary">Decentralized Finance (DeFi) Risk Analysis</h2>
                <p className="text-sm text-theme-text-secondary mt-1">Monitoring on-chain activity and protocol-specific risks for licensed DeFi entities.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                <DeFiCard title="Protocol Overview">
                    <CompactMetric label="Name" value={protocol.name} subtext={protocol.type} />
                    <CompactMetric label="TVL" value={`$${protocol.tvl.toLocaleString()}`} />
                    <CompactMetric label="Audit Status" value={protocol.auditStatus} subtext={protocol.lastAudit} />
                </DeFiCard>

                <DeFiCard title="Stablecoin Health">
                    <CompactMetric label="Name" value={stablecoin.name} />
                    <CompactMetric 
                        label="Collat. Ratio" 
                        value={`${(stablecoin.collateralizationRatio * 100).toFixed(1)}%`} 
                    />
                    <CompactMetric label="Collat. Value" value={`$${stablecoin.collateralValue.toLocaleString()}`} />
                </DeFiCard>
                
                <DeFiCard title="Smart Contract Risk">
                    <CompactMetric label="Audit Score" value={contractRisk.codeAuditScore} />
                    <CompactMetric label="Upgradeability" value={contractRisk.upgradeabilityRisk} />
                    <CompactMetric label="Admin Key Risk" value={contractRisk.adminKeyRisk} />
                    <CompactMetric label="Oracle Risk" value={contractRisk.oracleRisk} />
                </DeFiCard>
                
                 <DeFiCard title="Liquidity Pool">
                    <CompactMetric label="Pool" value={`${pool.token1}/${pool.token2}`} />
                    <CompactMetric label="Liquidity" value={`$${pool.liquidity.toLocaleString()}`} />
                    <CompactMetric label="24h Volume" value={`$${pool.volume24h.toLocaleString()}`} />
                    <CompactMetric label="Volatility" value={`${(pool.volatility * 100).toFixed(1)}%`} />
                </DeFiCard>
                
            </div>
        </div>
    );
};

export default DeFiRiskDashboard;