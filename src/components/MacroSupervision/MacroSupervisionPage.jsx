import React, { useState } from 'react';
import { BanknotesIcon, BuildingLibraryIcon, ExclamationTriangleIcon, LinkIcon, BeakerIcon, ArrowTrendingUpIcon, WalletIcon } from '@heroicons/react/24/outline';

// --- Mock Data (MODIFIED: Added 'export' to make data available to other components) ---
export const mockSystemicData = {
    aggregatedCAR: { value: '15.2%', trend: 'up' },
    nplRatio: { value: '3.1%', trend: 'down' },
    liquidityCoverage: { value: '125%', trend: 'stable' },
    creditConcentration: {
        'Commercial Real Estate': 35,
        'Tourism & Hospitality': 25,
        'Energy Sector': 15,
        'Retail': 15,
        'Other': 10,
    },
    alerts: [
        { id: 1, severity: 'High', message: 'System-wide foreign currency settlement risk has breached the critical threshold of $5B.' },
        { id: 2, severity: 'Medium', message: 'Aggregate e-money float has increased by 15% in the last 24 hours, approaching the warning threshold.' },
    ],
};

export const mockDeFiData = {
    stablecoinCollateralization: [
        { name: 'Digital Dollar (DUSD)', ratio: '155%', onWatchlist: false },
        { name: 'FinCoin (FNC)', ratio: '98.5%', onWatchlist: true },
    ],
    tvl: '$1.2B',
    leverage: '2.5x',
    poolConcentration: [
        { name: 'ETH/DUSD', concentration: '45%' },
        { name: 'BTC/DUSD', concentration: '30%' },
        { name: 'SOL/DUSD', concentration: '15%' },
    ],
};

// --- Helper Components ---
const DashboardCard = ({ title, children, icon, fullWidth = false }) => (
    <div className={`bg-white p-4 rounded-lg shadow-md ${fullWidth ? 'lg:col-span-3' : ''}`}>
        <div className="flex items-center text-lg font-semibold text-gray-700 mb-3">
            {React.cloneElement(icon, { className: 'w-6 h-6 mr-2 text-gray-500' })}
            {title}
        </div>
        <div>{children}</div>
    </div>
);

const AlertItem = ({ severity, message }) => {
    const severityClasses = {
        High: 'border-red-500 bg-red-50 text-red-800',
        Medium: 'border-yellow-500 bg-yellow-50 text-yellow-800',
    };
    return (
        <div className={`p-3 border-l-4 rounded-r-md ${severityClasses[severity]}`}>
            <p className="font-bold text-sm">{severity} Priority Alert</p>
            <p className="text-sm">{message}</p>
        </div>
    );
};


const MacroSupervisionPage = () => {

    const handleRunStressTest = (scenario) => {
        alert(`Running stress test: "${scenario}"\n\nThis would trigger a complex backend process to model the system-wide impact based on the latest aggregated data.`);
    };

    return (
        <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Macro-Prudential Supervision</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Systemic Risk Dashboard */}
                <DashboardCard title="Systemic Risk Dashboard" icon={<BuildingLibraryIcon />} fullWidth={true}>
                    <p className="text-sm text-gray-600 mb-4">Monitoring key prudential indicators for the entire financial system. Data is aggregated from all reporting entities.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Aggregated CAR */}
                        <div className="p-4 bg-gray-50 rounded-lg text-center">
                            <p className="text-sm text-gray-600">Aggregated CAR</p>
                            <p className="text-3xl font-bold text-green-600 my-2">{mockSystemicData.aggregatedCAR.value}</p>
                            <p className="text-xs text-gray-500">Trend: {mockSystemicData.aggregatedCAR.trend}</p>
                        </div>
                        {/* NPL Ratio */}
                        <div className="p-4 bg-gray-50 rounded-lg text-center">
                            <p className="text-sm text-gray-600">National NPL Ratio</p>
                            <p className="text-3xl font-bold text-blue-600 my-2">{mockSystemicData.nplRatio.value}</p>
                            <p className="text-xs text-gray-500">Trend: {mockSystemicData.nplRatio.trend}</p>
                        </div>
                        {/* Liquidity Metric */}
                         <div className="p-4 bg-gray-50 rounded-lg text-center">
                            <p className="text-sm text-gray-600">Liquidity Coverage</p>
                            <p className="text-3xl font-bold text-teal-600 my-2">{mockSystemicData.liquidityCoverage.value}</p>
                            <p className="text-xs text-gray-500">Trend: {mockSystemicData.liquidityCoverage.trend}</p>
                        </div>
                        {/* Credit Concentration */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 text-center mb-2">Credit Concentration</p>
                            <div>
                                {Object.entries(mockSystemicData.creditConcentration).map(([sector, percentage]) => (
                                    <div key={sector}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span>{sector}</span>
                                            <span>{percentage}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </DashboardCard>
                
                {/* Real-Time DeFi Dashboard */}
                <DashboardCard title="Real-Time DeFi Dashboard" icon={<WalletIcon />} fullWidth={true}>
                     <p className="text-sm text-gray-600 mb-4">Continuously monitoring on-chain data for licensed digital asset service providers.</p>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg lg:col-span-2">
                            <p className="text-sm text-gray-600 mb-2">Systemic Stablecoin Collateralization</p>
                            <div className="space-y-3">
                                {mockDeFiData.stablecoinCollateralization.map(sc =>(
                                    <div key={sc.name} className={`p-2 rounded-md ${sc.onWatchlist ? 'bg-red-100' : 'bg-green-100'}`}>
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-sm text-gray-800">{sc.name}</span>
                                            <span className={`font-bold text-lg ${sc.onWatchlist ? 'text-red-700' : 'text-green-700'}`}>{sc.ratio}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                         <div className="p-4 bg-gray-50 rounded-lg text-center">
                            <p className="text-sm text-gray-600">Total Value Locked (TVL)</p>
                            <p className="text-3xl font-bold text-gray-800 my-2">{mockDeFiData.tvl}</p>
                            <p className="text-xs text-gray-500">Across all licensed protocols</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg text-center">
                            <p className="text-sm text-gray-600">Overall DeFi Leverage</p>
                            <p className="text-3xl font-bold text-gray-800 my-2">{mockDeFiData.leverage}</p>
                            <p className="text-xs text-gray-500">Aggregated across lending protocols</p>
                        </div>
                     </div>
                </DashboardCard>

                {/* Network Analysis */}
                <DashboardCard title="Interconnectedness Network" icon={<LinkIcon />}>
                    <div className="h-48 flex items-center justify-center bg-gray-50 rounded-md text-gray-500 italic text-center p-4">
                        (Placeholder: A dynamic graph visualization mapping inter-bank lending and liability exposures to model contagion risk).
                    </div>
                </DashboardCard>

                {/* Stress Testing */}
                <DashboardCard title="Macro-Prudential Stress Testing" icon={<BeakerIcon />}>
                    <p className="text-sm text-gray-600 mb-3">Model the system-wide impact of severe but plausible economic shocks.</p>
                    <div className="flex flex-col space-y-2">
                         <button onClick={() => handleRunStressTest('2% Interest Rate Hike')} className="text-left p-2 bg-blue-100 text-blue-800 text-sm rounded hover:bg-blue-200">Run: Interest Rate Shock</button>
                         <button onClick={() => handleRunStressTest('20% Real Estate Market Decline')} className="text-left p-2 bg-blue-100 text-blue-800 text-sm rounded hover:bg-blue-200">Run: Real Estate Shock</button>
                         <button onClick={() => handleRunStressTest('Liquidity Crisis Simulation')} className="text-left p-2 bg-blue-100 text-blue-800 text-sm rounded hover:bg-blue-200">Run: Liquidity Shock</button>
                    </div>
                </DashboardCard>

                {/* Automated Alerts */}
                <DashboardCard title="Systemic Alerts" icon={<ExclamationTriangleIcon />}>
                    <div className="space-y-3">
                        {mockSystemicData.alerts.map(alert => (
                            <AlertItem key={alert.id} severity={alert.severity} message={alert.message} />
                        ))}
                    </div>
                </DashboardCard>
            </div>
        </div>
    );
};

export default MacroSupervisionPage;