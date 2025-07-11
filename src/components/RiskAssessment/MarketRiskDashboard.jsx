// src/components/RiskAssessment/MarketRiskDashboard.jsx

import React, { useState, useEffect } from 'react';
import {
  calculateVaR,
  getFXExposure,
  getInterestRateRisk,
  checkConcentrationLimits,
} from '../../services/marketRiskService.js';
import entitiesData from '../../data/entities.js';

// --- Reusable Components ---
const InfoCard = ({ title, children, className = '' }) => (
    <div className={`bg-theme-bg-secondary p-6 rounded-lg shadow-lg border border-theme-border ${className}`}>
        <h3 className="text-lg font-semibold text-theme-text-primary border-b border-theme-border pb-2 mb-3">{title}</h3>
        {children}
    </div>
);

const DataRow = ({ label, value, unit = '' }) => (
    <div className="flex justify-between py-1.5 border-b border-theme-border last:border-b-0">
        <span className="text-sm text-theme-text-secondary">{label}</span>
        <span className="text-sm font-medium text-theme-text-primary">
            {typeof value === 'number' ? value.toLocaleString() : value} {unit}
        </span>
    </div>
);

const MarketRiskDashboard = () => {
    const [selectedEntityId, setSelectedEntityId] = useState('ent_001'); // Default to the entity with data
    const [marketRiskData, setMarketRiskData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMarketRiskData = async () => {
            if (!selectedEntityId) return;
            setIsLoading(true);
            setError(null);
            try {
                const [varData, fxData, interestData, concentrationData] = await Promise.all([
                    calculateVaR(selectedEntityId, '1D', 0.99),
                    getFXExposure(selectedEntityId),
                    getInterestRateRisk(selectedEntityId),
                    checkConcentrationLimits(selectedEntityId),
                ]);

                setMarketRiskData({
                    varData,
                    fxData,
                    interestData,
                    concentrationData,
                    entityName: entitiesData.find(e => e.entityId === selectedEntityId)?.companyName || 'Unknown Entity'
                });
            } catch (err) {
                console.error(`Failed to load market risk data for ${selectedEntityId}:`, err);
                setError(`Could not load market risk data.`);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMarketRiskData();
    }, [selectedEntityId]);

     if (isLoading) {
        return <div className="p-6 text-center text-theme-text-secondary">Loading Market Risk Data...</div>;
    }

    if (error) {
        return <div className="p-6 text-center text-red-400 bg-red-900 bg-opacity-30 rounded-md">{error}</div>;
    }

    if (!marketRiskData) {
        return <div className="p-6 text-center text-theme-text-secondary">No market risk data available for the selected entity.</div>;
    }

    const { varData, fxData, interestData, concentrationData, entityName } = marketRiskData;

    return (
        <div className="space-y-8">
             <div>
                <h2 className="text-2xl font-semibold text-theme-text-primary">Market Risk Dashboard for: {entityName}</h2>
                <p className="text-sm text-theme-text-secondary mt-1">Analysis of potential losses due to factors that affect the overall performance of financial markets.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Value at Risk (VaR) */}
                <InfoCard title="Value at Risk (VaR)">
                   {varData ? (
                        <div className="space-y-2">
                            <DataRow label="1-Day VaR" value={`$${varData.oneDay}`} />
                            <DataRow label="10-Day VaR" value={`$${varData.tenDay}`} />
                            <DataRow label="Confidence Level" value={`${varData.confidenceLevel * 100}%`} />
                            <DataRow label="Last Updated" value={varData.lastUpdated} />
                        </div>
                   ) : <p>No VaR data available.</p>}
                </InfoCard>

                {/* FX Exposure */}
                <InfoCard title="Foreign Exchange (FX) Exposure">
                    {fxData ? (
                        <div className="space-y-2">
                           {Object.entries(fxData).map(([key, value]) => {
                                if(key === 'hedgeRatio') return <DataRow key={key} label="Hedge Ratio" value={`${(value * 100).toFixed(0)}%`} />;
                                return <DataRow key={key} label={`Exposure (${key.toUpperCase()})`} value={`$${value}`} />;
                           })}
                        </div>
                    ) : <p>No FX exposure data available.</p>}
                </InfoCard>

                {/* Interest Rate Risk */}
                <InfoCard title="Interest Rate Risk">
                    {interestData ? (
                         <div className="space-y-2">
                            <DataRow label="Duration" value={interestData.duration} unit="years" />
                            <DataRow label="Convexity" value={interestData.convexity} />
                            <DataRow label="Basis Point Value (BPV)" value={`$${interestData.basisPointValue}`} />
                         </div>
                    ): <p>No interest rate risk data.</p>}
                </InfoCard>

                 {/* Concentration Risk */}
                <InfoCard title="Concentration Risk" className="lg:col-span-2">
                     {concentrationData && concentrationData.largeExposures ? (
                         <div className="space-y-3">
                            {concentrationData.largeExposures.map((exp, index) => (
                                <div key={index} className="p-3 bg-theme-bg rounded-md">
                                    <p className="font-semibold text-theme-text-primary">{exp.counterparty}</p>
                                    <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                                        <div 
                                            className="bg-blue-500 h-2.5 rounded-full" 
                                            style={{ width: `${(exp.exposure / exp.limit) * 100}%`}}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-xs mt-1 text-theme-text-secondary">
                                        <span>Exposure: ${exp.exposure.toLocaleString()}</span>
                                        <span>Limit: ${exp.limit.toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                         </div>
                    ): <p>No concentration data.</p>}
                </InfoCard>

                {/* Repricing Gaps */}
                <InfoCard title="Repricing Gaps">
                    {interestData && interestData.repricingGaps ? (
                         <div className="space-y-2">
                            {Object.entries(interestData.repricingGaps).map(([gap, value]) => (
                                <DataRow key={gap} label={gap} value={`$${value}`} />
                            ))}
                         </div>
                    ): <p>No repricing gap data.</p>}
                </InfoCard>

            </div>
        </div>
    );
};

export default MarketRiskDashboard;