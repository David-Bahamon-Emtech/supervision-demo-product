import React, { useState } from 'react';
import { MegaphoneIcon, DocumentTextIcon, ScaleIcon, ChatBubbleLeftRightIcon, CpuChipIcon, UserGroupIcon, LightBulbIcon } from '@heroicons/react/24/outline';

// --- Theme Classes (for reference, based on your other components) ---
// Main BG: bg-theme-bg
// Card BG: bg-theme-bg-secondary
// Primary Text: text-theme-text-primary
// Secondary Text: text-theme-text-secondary
// Accent Color: text-theme-accent / bg-theme-accent
// Borders: border-theme-border

// --- Mock Data ---
const mockMarketConductData = {
    complaints: [
        { id: 'C-001', institution: 'Oakmark Strategic Holdings', product: 'SummitPay Direct', issue: 'Unclear Fees', status: 'Under Investigation', received: '2025-06-20' },
        { id: 'C-002', institution: 'Pinnacle Stone Investments', product: 'ApexTrade Crypto', issue: 'Misleading Advertisement', status: 'Resolved - Redress Paid', received: '2025-06-15' },
        { id: 'C-003', institution: 'Bluehaven Wealth Advisors', product: 'Bluehaven Wealth Advisors', issue: 'Unsuitable Product Recommendation', status: 'Awaiting Institution Response', received: '2025-06-22' },
    ],
    adWatchlist: [
        { id: 'A-001', institution: 'Pioneer Holdings', reason: 'Use of "Risk-Free" in social media ad.', flaggedDate: '2025-06-23' },
        { id: 'A-002', institution: 'Ironclad Asset Partners', reason: 'Omission of required risk disclosures in web banner.', flaggedDate: '2025-06-21' },
    ],
    thematicReviewData: {
        'Wire Transfer Fee': [
            { institution: 'Pinnacle Stone Investments', fee: '$25.00' },
            { institution: 'Silvercrest Financial Solutions', fee: '$30.00' },
            { institution: 'Oakmark Strategic Holdings', fee: '$28.00' },
            { institution: 'Keystone Financial Innovations', fee: '$55.00', outlier: true },
        ]
    },
    interventions: [
        { id: 'I-001', institution: 'Pioneer Holdings', type: 'Formal Warning', subject: 'Misleading Advertising', status: 'Issued' },
        { id: 'I-002', institution: 'Lighthouse Financial Services', type: 'Mandated Process Change', subject: 'Complaint Handling Process', status: 'Monitoring' },
    ]
};

// --- Helper Components (Dark Theme) ---
const DashboardCard = ({ title, children, icon, fullWidth = false, className = '' }) => (
    <div className={`bg-theme-bg-secondary p-6 rounded-xl shadow-lg border border-theme-border ${fullWidth ? 'lg:col-span-3' : ''} ${className}`}>
        <div className="flex items-center text-lg font-semibold text-theme-text-primary mb-4">
            {React.cloneElement(icon, { className: 'w-6 h-6 mr-3 text-theme-accent' })}
            {title}
        </div>
        <div>{children}</div>
    </div>
);

const MarketConductPage = () => {
    const [thematicReviewResult, setThematicReviewResult] = useState(null);

    const handleThematicReview = (reviewType) => {
        alert(`Running thematic review for: "${reviewType}"\n\nThis would query the data repository, extract the relevant data (e.g., all wire transfer fees), and display it for comparative analysis.`);
        setThematicReviewResult(mockMarketConductData.thematicReviewData[reviewType]);
    };

    const handleRunDisparityAnalysis = () => {
        alert("Running fair lending analysis...\n\nThis would process aggregated, anonymized loan data to identify any statistically significant disparities in approval rates or pricing across demographic or geographic lines.");
    };

    return (
        <div className="p-4 md:p-6 bg-theme-bg min-h-screen">
            <h1 className="text-3xl font-bold text-theme-text-primary mb-2">Market Conduct Supervision</h1>
            <p className="text-theme-text-secondary mb-8">Monitoring fairness, transparency, and consumer protection in the financial market.</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Dashboard Widgets */}
                <DashboardCard title="Live Consumer Complaints" icon={<ChatBubbleLeftRightIcon />}>
                    <div className="h-48 overflow-y-auto space-y-3 pr-2">
                        {mockMarketConductData.complaints.map(c => (
                            <div key={c.id} className="p-3 bg-theme-bg rounded-md border border-theme-border text-xs">
                                <p className="font-bold text-theme-text-primary">{c.institution}</p>
                                <p className="text-theme-text-secondary mt-1">{c.issue} - <span className="italic">{c.status}</span></p>
                            </div>
                        ))}
                    </div>
                </DashboardCard>
                <DashboardCard title="Suitability & Advertising" icon={<MegaphoneIcon />}>
                    <div className="h-48 overflow-y-auto space-y-3 pr-2">
                        <p className="text-sm text-center text-theme-text-secondary mb-2">Watchlist (Recent Ad Violations)</p>
                         {mockMarketConductData.adWatchlist.map(item => (
                            <div key={item.id} className="p-3 bg-red-900 bg-opacity-30 rounded-md text-xs border-l-4 border-red-500">
                                <p className="font-bold text-red-300">{item.institution}</p>
                                <p className="text-red-400 mt-1">{item.reason}</p>
                            </div>
                        ))}
                    </div>
                </DashboardCard>
                <DashboardCard title="Active Interventions" icon={<LightBulbIcon />}>
                     <div className="h-48 overflow-y-auto space-y-3 pr-2">
                         {mockMarketConductData.interventions.map(item => (
                            <div key={item.id} className="p-3 bg-blue-900 bg-opacity-30 rounded-md text-xs">
                                <p className="font-bold text-blue-300">{item.institution}</p>
                                <p className="text-blue-400 mt-1">{item.type}: {item.subject} <span className="italic">({item.status})</span></p>
                            </div>
                        ))}
                    </div>
                </DashboardCard>
                
                {/* 2. Complaint Case Management */}
                <DashboardCard title="Consumer Complaint Case Management" icon={<DocumentTextIcon />} fullWidth={true}>
                    <p className="text-sm text-theme-text-secondary mb-4">
                        End-to-end system to log, investigate, and resolve consumer complaints.
                    </p>
                     <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-theme-border">
                            <thead className="bg-black bg-opacity-20">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Case ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Institution</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Issue</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-theme-border">
                                {mockMarketConductData.complaints.map(c => (
                                    <tr key={c.id} className="hover:bg-theme-bg">
                                        <td className="px-4 py-3 text-sm font-medium text-theme-accent">{c.id}</td>
                                        <td className="px-4 py-3 text-sm text-theme-text-primary">{c.institution}</td>
                                        <td className="px-4 py-3 text-sm text-theme-text-secondary">{c.issue}</td>
                                        <td className="px-4 py-3 text-sm text-theme-text-secondary">{c.status}</td>
                                        <td className="px-4 py-3 text-right"><button className="text-xs text-blue-400 hover:text-theme-accent hover:underline">View Case</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </DashboardCard>
                
                {/* 3. Thematic Reviews & Data Analysis */}
                <DashboardCard title="Thematic Reviews" icon={<ScaleIcon />} className="lg:col-span-2">
                     <p className="text-sm text-theme-text-secondary mb-4">
                        Extract and analyze data from the centralized repository for cross-institution comparison.
                    </p>
                    <div className="flex items-center space-x-3 mb-4">
                        <span className="text-sm font-medium text-theme-text-primary">Run review on:</span>
                        <button onClick={() => handleThematicReview('Wire Transfer Fee')} className="px-3 py-1.5 bg-gray-700 text-gray-200 text-sm rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500">Bank Fee Schedules</button>
                        <button onClick={() => alert('This would run a review on consumer loan rates.')} className="px-3 py-1.5 bg-gray-700 text-gray-200 text-sm rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500">Loan Interest Rates</button>
                    </div>
                    {thematicReviewResult && (
                        <div>
                            <h4 className="font-semibold text-theme-text-primary mb-2">Results: Wire Transfer Fees</h4>
                            <ul className="space-y-2">
                                {thematicReviewResult.map(item => (
                                    <li key={item.institution} className={`flex justify-between p-3 rounded-md text-sm ${item.outlier ? 'bg-red-900 bg-opacity-40' : 'bg-green-900 bg-opacity-30'}`}>
                                        <span className="text-theme-text-primary">{item.institution}</span>
                                        <span className={`font-bold ${item.outlier ? 'text-red-300' : 'text-green-300'}`}>{item.fee} {item.outlier && '(Outlier)'}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </DashboardCard>

                {/* 4. AI-Powered Text Analysis */}
                <DashboardCard title="AI Advertising Analysis" icon={<CpuChipIcon />}>
                     <p className="text-sm text-theme-text-secondary mb-3">
                        Automatically scanning marketing materials for non-compliant language.
                    </p>
                    <p className="font-semibold text-xs text-theme-text-secondary uppercase tracking-wider">Recently Flagged Materials:</p>
                    <div className="mt-2 space-y-2">
                        {mockMarketConductData.adWatchlist.map(item => (
                             <div key={item.id} className="p-3 bg-yellow-900 bg-opacity-30 border-l-4 border-yellow-500 text-xs">
                                <p className="font-bold text-yellow-300">{item.institution}</p>
                                <p className="text-yellow-400 mt-1">Reason: {item.reason}</p>
                            </div>
                        ))}
                    </div>
                </DashboardCard>

                {/* 5. Anti-Discrimination Monitoring */}
                <DashboardCard title="Fair Lending & Anti-Discrimination" icon={<UserGroupIcon />} fullWidth={true}>
                    <p className="text-sm text-theme-text-secondary mb-4">
                        Tools to monitor for potential discriminatory practices in lending.
                    </p>
                    <div className="flex items-center space-x-4">
                         <button 
                             onClick={handleRunDisparityAnalysis} 
                             className="px-4 py-2 bg-theme-accent text-sidebar-bg font-semibold rounded-md shadow-md hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-bg-secondary focus:ring-theme-accent"
                         >
                             Run Disparity Analysis
                         </button>
                         <div className="flex-grow p-4 bg-theme-bg rounded-md text-center text-theme-text-secondary italic">
                             (Placeholder: Results of loan application analysis by demographic/geographic data would appear here).
                         </div>
                    </div>
                </DashboardCard>
            </div>
        </div>
    );
};

export default MarketConductPage;