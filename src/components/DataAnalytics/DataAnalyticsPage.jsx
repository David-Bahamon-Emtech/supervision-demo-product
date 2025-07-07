import React, { useState } from 'react';
import { ChartPieIcon, RectangleGroupIcon, MagnifyingGlassIcon, InboxStackIcon, CogIcon, LightBulbIcon, SparklesIcon, Bars4Icon, TableCellsIcon } from '@heroicons/react/24/outline';

// --- Mock Data ---
const mockDashboardData = {
    riskMetrics: {
        avgCAR: { value: '14.8%', change: '+0.2%' },
        avgNPL: { value: '3.5%', change: '-0.1%' },
        sectorLiquidity: { value: '135%', change: '+2.0%' }
    },
    marketConduct: {
        complaintVolume: { value: 124, change: '+15%' },
        suitabilityBreaches: { value: 8, change: '+2' },
        feeOutliers: { value: 3, change: '0' }
    },
    supervisoryPerformance: {
        avgLicenseTime: { value: '45d', change: '-3d' },
        overdueReviews: { value: 12, change: '+1' },
        workflowBottleneck: 'Detailed Assessment',
    },
    aiQueryResponse: {
        headers: ["Quarter", "Total Volume (USD)"],
        rows: [
            ["2025-Q1", "1,245,670,000"],
            ["2025-Q2", "1,450,120,000"]
        ]
    }
};

// --- Helper Components ---
const DashboardTab = ({ label, activeTab, onClick }) => (
    <button onClick={onClick}
        className={`whitespace-nowrap py-3 px-4 -mb-px font-medium text-sm focus:outline-none ${activeTab === label ? 'border-b-2 border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
        {label}
    </button>
);

const KPICard = ({ title, value, change, isPositiveGood = true }) => {
    const isPositive = change && change.startsWith('+');
    const isNegative = change && change.startsWith('-');
    const changeColor = isPositive ? (isPositiveGood ? 'text-green-600' : 'text-red-600') : (isNegative ? (isPositiveGood ? 'text-red-600' : 'text-green-600') : 'text-gray-500');

    return (
        <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-800 my-1">{value}</p>
            <p className={`text-sm font-semibold ${changeColor}`}>{change}</p>
        </div>
    );
};

const Widget = ({ title, icon }) => (
     <div className="flex items-center p-3 bg-white border border-gray-300 rounded-md cursor-grab shadow-sm">
        {React.cloneElement(icon, { className: 'w-5 h-5 mr-3 text-gray-500' })}
        <span className="text-sm font-medium text-gray-700">{title}</span>
    </div>
);


const DataAnalyticsPage = () => {
    const [activeTab, setActiveTab] = useState('Risk Metrics');
    const [aiQuery, setAiQuery] = useState('');
    const [aiResponse, setAiResponse] = useState(null);
    const [isAiLoading, setIsAiLoading] = useState(false);

    const handleRunAIQuery = (e) => {
        e.preventDefault();
        setIsAiLoading(true);
        setAiResponse(null);
        setTimeout(() => {
             alert(`Running AI analysis for query: "${aiQuery}"\n\nThis would connect to a backend service that processes the natural language query against the aggregated, structured dataset.`);
             setAiResponse(mockDashboardData.aiQueryResponse);
             setIsAiLoading(false);
        }, 1500);
    };
    
     const handleAnalyzeUnstructured = () => {
        alert("Analyzing unstructured text...\n\nThis would trigger a backend process to scan documents (e.g., annual reports), extract themes, identify risks (e.g., mentions of 'market downturn' near 'loan defaults'), and generate a summary for review.");
    };

    const renderActiveDashboard = () => {
        switch (activeTab) {
            case 'Risk Metrics':
                return (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <KPICard title="Avg. Capital Adequacy Ratio" value={mockDashboardData.riskMetrics.avgCAR.value} change={mockDashboardData.riskMetrics.avgCAR.change} />
                        <KPICard title="Avg. NPL Ratio" value={mockDashboardData.riskMetrics.avgNPL.value} change={mockDashboardData.riskMetrics.avgNPL.change} isPositiveGood={false} />
                        <KPICard title="Sector Liquidity Coverage" value={mockDashboardData.riskMetrics.sectorLiquidity.value} change={mockDashboardData.riskMetrics.sectorLiquidity.change} />
                        <div className="lg:col-span-3 h-64 flex items-center justify-center bg-gray-50 rounded-lg text-gray-500 italic p-4">(Placeholder: Customizable chart displaying trends for selected risk metrics)</div>
                    </div>
                );
            case 'Market Conduct':
                 return (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <KPICard title="Complaint Volume (30d)" value={mockDashboardData.marketConduct.complaintVolume.value} change={mockDashboardData.marketConduct.complaintVolume.change} isPositiveGood={false} />
                        <KPICard title="Suitability Breaches (YTD)" value={mockDashboardData.marketConduct.suitabilityBreaches.value} change={mockDashboardData.marketConduct.suitabilityBreaches.change} isPositiveGood={false} />
                        <KPICard title="Fee Structure Outliers" value={mockDashboardData.marketConduct.feeOutliers.value} change={mockDashboardData.marketConduct.feeOutliers.change} isPositiveGood={false}/>
                        <div className="lg:col-span-3 h-64 flex items-center justify-center bg-gray-50 rounded-lg text-gray-500 italic p-4">(Placeholder: Bar chart showing top 5 institutions by complaint volume)</div>
                    </div>
                );
            case 'Supervisory Performance':
                 return (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <KPICard title="Avg. License Approval Time" value={mockDashboardData.supervisoryPerformance.avgLicenseTime.value} change={mockDashboardData.supervisoryPerformance.avgLicenseTime.change} isPositiveGood={false} />
                        <KPICard title="Overdue Compliance Reviews" value={mockDashboardData.supervisoryPerformance.overdueReviews.value} change={mockDashboardData.supervisoryPerformance.overdueReviews.change} isPositiveGood={false} />
                        <KPICard title="Top Workflow Bottleneck" value={mockDashboardData.supervisoryPerformance.workflowBottleneck} change={null} />
                         <div className="lg:col-span-3 h-64 flex items-center justify-center bg-gray-50 rounded-lg text-gray-500 italic p-4">(Placeholder: Chart showing examination workflow efficiency and stage completion times)</div>
                    </div>
                );
             case 'Custom Dashboard Builder':
                 return (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-1 p-4 bg-gray-100 rounded-lg border">
                            <h4 className="font-semibold mb-3">Widget Library</h4>
                            <p className="text-xs text-gray-600 mb-3">Drag & drop widgets onto the canvas.</p>
                            <div className="space-y-3">
                                <Widget title="KPI Card" icon={<LightBulbIcon />} />
                                <Widget title="Bar Chart" icon={<ChartPieIcon />} />
                                <Widget title="Line Chart" icon={<SparklesIcon />} />
                                <Widget title="Data Table" icon={<TableCellsIcon />} />
                                <Widget title="Text Block" icon={<Bars4Icon />} />
                            </div>
                        </div>
                        <div className="lg:col-span-3 min-h-[400px] bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 italic p-4">
                            (Placeholder: A customizable drag-and-drop dashboard canvas. Supervisors can create, save, and share their layouts here.)
                        </div>
                    </div>
                 );
            default: return null;
        }
    }

    return (
        <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Data & Analytics</h1>

            <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Analyze with AI</h2>
                <p className="text-sm text-gray-600 mb-4">Ask complex questions using natural language to query structured and unstructured data.</p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-semibold text-gray-700 mb-2">Query the Structured Dataset</h3>
                         <form onSubmit={handleRunAIQuery} className="flex items-center space-x-2">
                             <input type="text" value={aiQuery} onChange={e => setAiQuery(e.target.value)} placeholder='e.g., "Compare total transaction volume..."' className="w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                             <button type="submit" disabled={isAiLoading} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50">
                                {isAiLoading ? '...' : 'Ask'}
                             </button>
                         </form>
                         {aiResponse && (
                            <div className="mt-4">
                                <table className="min-w-full divide-y divide-gray-200 border">
                                    <thead className="bg-gray-50"><tr>{aiResponse.headers.map(h => <th key={h} className="px-3 py-2 text-left text-xs font-medium text-gray-500">{h}</th>)}</tr></thead>
                                    <tbody className="bg-white divide-y divide-gray-200">{aiResponse.rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j} className="px-3 py-2 text-sm">{cell}</td>)}</tr>)}</tbody>
                                </table>
                            </div>
                         )}
                    </div>
                    <div>
                         <h3 className="font-semibold text-gray-700 mb-2">Analyze Unstructured Documents</h3>
                         <div className="p-4 bg-gray-50 rounded-md text-sm text-gray-600 italic h-full flex flex-col justify-between">
                            (Placeholder: Select document types like annual reports or board minutes to automatically extract themes, identify risks, and generate summaries).
                            <button onClick={handleAnalyzeUnstructured} className="mt-2 w-full p-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700">Run Unstructured Analysis</button>
                         </div>
                    </div>
                </div>
            </div>

            <div className="border-b border-gray-300">
                <nav className="-mb-px flex space-x-6 overflow-x-auto">
                    {['Risk Metrics', 'Market Conduct', 'Supervisory Performance', 'Custom Dashboard Builder'].map(tab => (
                        <DashboardTab key={tab} label={tab} activeTab={activeTab} onClick={() => setActiveTab(tab)} />
                    ))}
                </nav>
            </div>
            <div className="bg-white p-6 rounded-b-lg shadow-lg">
                {renderActiveDashboard()}
                 <div className="text-right mt-4">
                    <button className="text-sm text-blue-600 hover:underline mr-4">Export to PDF</button>
                    <button className="text-sm text-blue-600 hover:underline">Export to Excel</button>
                </div>
            </div>
             <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Central Metrics Library</h3>
                <div className="p-4 bg-white rounded-lg shadow-lg text-sm text-gray-600 italic">
                    (Placeholder: A searchable and filterable directory of all KPIs and KRIs defined on the platform would be managed here. This would serve as the single source of truth for all dashboard widgets and reports.)
                </div>
            </div>
        </div>
    );
};

export default DataAnalyticsPage;