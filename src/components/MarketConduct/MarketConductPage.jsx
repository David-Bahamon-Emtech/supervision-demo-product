import React, { useState } from 'react';
import { MegaphoneIcon, DocumentTextIcon, ShieldExclamationIcon, ScaleIcon, ChatBubbleLeftRightIcon, CpuChipIcon, UserGroupIcon, LightBulbIcon } from '@heroicons/react/24/outline';

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

// --- Helper Components ---
const DashboardCard = ({ title, children, icon, fullWidth = false, className = '' }) => (
    <div className={`bg-white p-4 rounded-lg shadow-md ${fullWidth ? 'lg:col-span-3' : ''} ${className}`}>
        <div className="flex items-center text-lg font-semibold text-gray-700 mb-3">
            {React.cloneElement(icon, { className: 'w-6 h-6 mr-2 text-gray-500' })}
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
        <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Market Conduct Supervision</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* 1. Market Conduct Dashboard */}
                <DashboardCard title="Live Consumer Complaints" icon={<ChatBubbleLeftRightIcon />}>
                    <div className="h-40 overflow-y-auto space-y-2">
                        {mockMarketConductData.complaints.map(c => (
                            <div key={c.id} className="p-2 bg-gray-50 rounded text-xs">
                                <p className="font-bold text-gray-700">{c.institution}</p>
                                <p className="text-gray-600">{c.issue} - <span className="italic">{c.status}</span></p>
                            </div>
                        ))}
                    </div>
                </DashboardCard>
                <DashboardCard title="Suitability & Advertising" icon={<MegaphoneIcon />}>
                    <div className="h-40 overflow-y-auto space-y-2">
                        <p className="text-sm text-center text-gray-600 mb-2">Watchlist (Recent Ad Violations)</p>
                         {mockMarketConductData.adWatchlist.map(item => (
                            <div key={item.id} className="p-2 bg-red-50 rounded text-xs">
                                <p className="font-bold text-red-800">{item.institution}</p>
                                <p className="text-red-700">{item.reason}</p>
                            </div>
                        ))}
                    </div>
                </DashboardCard>
                <DashboardCard title="Active Interventions" icon={<LightBulbIcon />}>
                    <div className="h-40 overflow-y-auto space-y-2">
                         {mockMarketConductData.interventions.map(item => (
                            <div key={item.id} className="p-2 bg-blue-50 rounded text-xs">
                                <p className="font-bold text-blue-800">{item.institution}</p>
                                <p className="text-blue-700">{item.type}: {item.subject} <span className="italic">({item.status})</span></p>
                            </div>
                        ))}
                    </div>
                </DashboardCard>

                {/* 3. Complaint Case Management */}
                <DashboardCard title="Consumer Complaint Case Management" icon={<DocumentTextIcon />} fullWidth={true}>
                    <p className="text-sm text-gray-600 mb-4">
                        End-to-end system to log, investigate, and resolve consumer complaints.
                    </p>
                     <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Case ID</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Institution</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Issue</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                                    <th className="px-4 py-2"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockMarketConductData.complaints.map(c => (
                                    <tr key={c.id} className="bg-white hover:bg-gray-50">
                                        <td className="px-4 py-2 text-sm font-medium text-gray-800">{c.id}</td>
                                        <td className="px-4 py-2 text-sm text-gray-600">{c.institution}</td>
                                        <td className="px-4 py-2 text-sm text-gray-600">{c.issue}</td>
                                        <td className="px-4 py-2 text-sm text-gray-600">{c.status}</td>
                                        <td className="px-4 py-2 text-right"><button className="text-xs text-blue-600 hover:underline">View Case</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </DashboardCard>
                
                {/* 4. Thematic Reviews & 2. Data Repository */}
                <DashboardCard title="Thematic Reviews" icon={<ScaleIcon />} className="lg:col-span-2">
                     <p className="text-sm text-gray-600 mb-4">
                        Extract and analyze data from the centralized repository for cross-institution comparison.
                    </p>
                    <div className="flex items-center space-x-2 mb-4">
                        <span className="text-sm font-medium">Run review on:</span>
                        <button onClick={() => handleThematicReview('Wire Transfer Fee')} className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded-md hover:bg-gray-300">Bank Fee Schedules</button>
                        <button onClick={() => alert('This would run a review on consumer loan rates.')} className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded-md hover:bg-gray-300">Loan Interest Rates</button>
                    </div>
                    {thematicReviewResult && (
                        <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Results: Wire Transfer Fees</h4>
                            <ul className="space-y-1">
                                {thematicReviewResult.map(item => (
                                    <li key={item.institution} className={`flex justify-between p-2 rounded-md text-sm ${item.outlier ? 'bg-red-100' : 'bg-green-50'}`}>
                                        <span>{item.institution}</span>
                                        <span className={`font-bold ${item.outlier ? 'text-red-600' : 'text-green-700'}`}>{item.fee} {item.outlier && '(Outlier)'}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </DashboardCard>

                {/* 5. AI-Powered Text Analysis */}
                <DashboardCard title="AI Advertising Analysis" icon={<CpuChipIcon />}>
                     <p className="text-sm text-gray-600 mb-2">
                        Automatically scanning marketing materials for non-compliant language.
                    </p>
                    <p className="font-semibold text-xs text-gray-700">Recently Flagged Materials:</p>
                    <div className="mt-2 space-y-2">
                        {mockMarketConductData.adWatchlist.map(item => (
                             <div key={item.id} className="p-2 bg-yellow-50 border-l-4 border-yellow-400 text-xs">
                                <p className="font-bold text-yellow-800">{item.institution}</p>
                                <p className="text-yellow-700">Reason: {item.reason}</p>
                            </div>
                        ))}
                    </div>
                </DashboardCard>

                {/* 6. Anti-Discrimination Monitoring */}
                <DashboardCard title="Fair Lending & Anti-Discrimination" icon={<UserGroupIcon />} fullWidth={true}>
                    <p className="text-sm text-gray-600 mb-4">
                        Tools to monitor for potential discriminatory practices in lending.
                    </p>
                    <div className="flex items-center space-x-4">
                         <button onClick={handleRunDisparityAnalysis} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">
                             Run Disparity Analysis
                         </button>
                         <div className="flex-grow p-4 bg-gray-50 rounded-md text-center text-gray-500 italic">
                             (Placeholder: Results of loan application analysis by demographic/geographic data would appear here).
                         </div>
                    </div>
                </DashboardCard>
            </div>
        </div>
    );
};

export default MarketConductPage;