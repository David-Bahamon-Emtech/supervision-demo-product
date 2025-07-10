// src/components/RiskAssessment/BaselIIIDashboard.jsx

import React, { useState, useEffect } from 'react';
import {
  getSystemWideCapitalMetrics,
  checkCapitalCompliance,
  getLiquidityRatios,
  calculateCapitalAdequacyRatio
} from '../../services/baselIIIService.js';
import { baselIIIMetrics } from '../../data/baselIIIData.js';
import entitiesData from '../../data/entities.js';

// --- Reusable Components ---

const MetricCard = ({ title, value, status, description }) => {
    let statusColor = 'text-gray-600';
    if (status === 'Compliant') statusColor = 'text-green-600';
    if (status === 'Non-Compliant') statusColor = 'text-red-600';

    return (
        <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-800 my-1">{value}</p>
            {status && <p className={`text-sm font-semibold ${statusColor}`}>{status}</p>}
            {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
        </div>
    );
};

const ComplianceIndicator = ({ isCompliant, label }) => (
    <div className="flex items-center">
        <span className={`w-3 h-3 rounded-full mr-2 ${isCompliant ? 'bg-green-500' : 'bg-red-500'}`}></span>
        <span className="text-sm text-gray-700">{label}</span>
    </div>
);


const BaselIIIDashboard = () => {
    const [systemMetrics, setSystemMetrics] = useState(null);
    const [entityDetails, setEntityDetails] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const systemData = await getSystemWideCapitalMetrics();
                setSystemMetrics(systemData);

                // Fetch details for each entity defined in baselIIIMetrics
                const entityIds = Object.keys(baselIIIMetrics.capitalRatios);
                const detailsPromises = entityIds.map(async (id) => {
                    const [entity, compliance, liquidity, capital] = await Promise.all([
                        entitiesData.find(e => e.entityId === id),
                        checkCapitalCompliance(id),
                        getLiquidityRatios(id),
                        calculateCapitalAdequacyRatio(id),
                    ]);
                    return {
                        id,
                        name: entity ? entity.companyName : 'Unknown Entity',
                        compliance,
                        liquidity,
                        capital,
                    };
                });

                const detailedData = await Promise.all(detailsPromises);
                setEntityDetails(detailedData);

            } catch (err) {
                console.error("Failed to load Basel III data:", err);
                setError("Could not load Basel III dashboard data.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) {
        return <div className="p-6 text-center text-gray-500">Loading Basel III Compliance Data...</div>;
    }

    if (error) {
        return <div className="p-6 text-center text-red-600 bg-red-100 rounded-md">{error}</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-semibold text-gray-800">System-Wide Capital & Liquidity Analysis</h2>
                <p className="text-sm text-gray-600 mt-1">Aggregated prudential metrics from all reporting institutions.</p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard title="Avg. CET1 Ratio" value={`${systemMetrics?.averageCet1Ratio.toFixed(2)}%`} description="Core capital strength" />
                    <MetricCard title="Avg. Tier 1 Ratio" value={`${systemMetrics?.averageTier1Ratio.toFixed(2)}%`} />
                    <MetricCard title="Avg. Total Capital Ratio" value={`${systemMetrics?.averageTotalCapitalRatio.toFixed(2)}%`} />
                    <MetricCard title="Avg. Leverage Ratio" value={`${systemMetrics?.averageLeverageRatio.toFixed(2)}%`} />
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-semibold text-gray-800 mt-10">Entity-Specific Compliance Status</h2>
                <p className="text-sm text-gray-600 mt-1">Detailed compliance breakdown for individual institutions.</p>
                <div className="mt-4 overflow-x-auto bg-white rounded-lg shadow">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Overall Compliance</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CET1 / Tier 1 / Total Capital</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">LCR / NSFR</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {entityDetails.map(entity => (
                                <tr key={entity.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entity.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <MetricCard 
                                            status={entity.compliance.compliant ? 'Compliant' : 'Non-Compliant'}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        <p>{entity.capital?.cet1Ratio}% / {entity.capital?.tier1Ratio}% / {entity.capital?.totalCapitalRatio}%</p>
                                        <div className="flex space-x-4 mt-1">
                                            <ComplianceIndicator isCompliant={entity.compliance.cet1} label="CET1" />
                                            <ComplianceIndicator isCompliant={entity.compliance.tier1} label="Tier 1" />
                                            <ComplianceIndicator isCompliant={entity.compliance.totalCapital} label="Total" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {entity.liquidity?.lcr}% / {entity.liquidity?.nsfr}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BaselIIIDashboard;