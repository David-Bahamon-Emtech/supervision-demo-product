import React, { useState, useMemo } from 'react';
import { ChartPieIcon, RectangleGroupIcon, InboxStackIcon, CogIcon, LightBulbIcon, SparklesIcon, Bars4Icon, TableCellsIcon, ArrowPathIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- Theme Classes (for reference) ---
// Main BG: bg-theme-bg
// Card BG: bg-theme-bg-secondary
// Primary Text: text-theme-text-primary
// Secondary Text: text-theme-text-secondary
// Accent Color: text-theme-accent / bg-theme-accent
// Borders: border-theme-border

// --- MOCK DATA FOR A "FINAL" LOOK ---
const initialDashboardData = {
    riskMetrics: { avgCAR: { value: 14.8, change: 0.2 }, avgNPL: { value: 3.5, change: -0.1 }, sectorLiquidity: { value: 135, change: 2.0 } },
    marketConduct: { complaintVolume: { value: 124, change: 15 }, suitabilityBreaches: { value: 8, change: 2 }, feeOutliers: { value: 3, change: 0 } },
    supervisoryPerformance: { avgLicenseTime: { value: 45, change: -3 }, overdueReviews: { value: 12, change: 1 }, workflowBottleneck: 'Detailed Assessment' },
    riskTrendData: [
        { name: 'Jan', CAR: 14.5, NPL: 3.8 }, { name: 'Feb', CAR: 14.6, NPL: 3.7 }, { name: 'Mar', CAR: 14.6, NPL: 3.6 },
        { name: 'Apr', CAR: 14.7, NPL: 3.5 }, { name: 'May', CAR: 14.8, NPL: 3.5 }, { name: 'Jun', CAR: 14.8, NPL: 3.5 },
    ],
    complaintData: [
        { name: 'Pinnacle Stone', complaints: 45 }, { name: 'Oakmark Holdings', complaints: 32 }, { name: 'Bluehaven Advisors', complaints: 18 },
        { name: 'Ironclad Partners', complaints: 15 }, { name: 'Keystone Innovations', complaints: 14 },
    ],
    workflowData: [
        { stage: "Initial Review", days: 5 }, { stage: "Detailed Assessment", days: 22 }, { stage: "Awaiting Decision", days: 8 }, { stage: "Finalization", days: 10 }
    ],
    metricsLibrary: [
        { id: 'car', name: 'Capital Adequacy Ratio (CAR)', description: 'Measures a bank\'s capital in relation to its risk-weighted assets.', source: 'Prudential Filings' },
        { id: 'npl', name: 'Non-Performing Loan (NPL) Ratio', description: 'The ratio of defaulted loans to the total loan portfolio.', source: 'Financial Statements' },
        { id: 'liq', name: 'Liquidity Coverage Ratio (LCR)', description: 'Measures high-quality liquid assets held by financial institutions.', source: 'Liquidity Reports' },
        { id: 'comp', name: 'Complaint Volume', description: 'Total number of consumer complaints received in a given period.', source: 'Market Conduct System' },
    ]
};

const mockAiResponses = {
    volume: { headers: ["Institution", "Q2 Volume", "Q1 Volume"], rows: [ ["Pinnacle Stone", "$5.2B", "$4.8B"], ["Oakmark Holdings", "$3.1B", "$3.3B"], ["Bluehaven Advisors", "$1.9B", "$1.7B"] ] },
    risk: { headers: ["Institution", "Primary Risk", "Risk Score"], rows: [ ["Keystone Innovations", "Credit Concentration", "High"], ["Ironclad Partners", "Market Volatility", "Medium"], ["Silvercrest Solutions", "Operational Failure", "Medium"] ] },
    default: { headers: ["AI Response"], rows: [ ["I'm sorry, I could not find specific data. Try 'show risk scores' or 'list transaction volume'."] ] }
};

const mockUnstructuredAnalysis = {
    themes: ["Increased market volatility", "Loan portfolio concentration", "Regulatory scrutiny on digital assets"],
    sentiment: { score: -0.23, label: "Slightly Negative" },
    riskPhrases: [ "Concerns over the concentration of our commercial real estate loan portfolio...", "...significant headwinds from the current volatile market conditions." ]
};


// --- Helper Components ---
const DashboardTab = ({ label, activeTab, onClick }) => (
    <button onClick={onClick}
        className={`whitespace-nowrap py-3 px-4 -mb-px font-medium text-sm focus:outline-none ${activeTab === label ? 'border-b-2 border-theme-accent text-theme-accent' : 'border-transparent text-theme-text-secondary hover:text-theme-text-primary hover:border-gray-500'}`}>
        {label}
    </button>
);

const KPICard = ({ title, value, change, unit = '', isPositiveGood = true }) => {
    const hasValidChange = typeof change === 'number' && !isNaN(change);
    let changeColor = 'text-theme-text-secondary';
    let formattedChangeText = ' ';

    if (hasValidChange) {
        const isPositive = change > 0;
        const isNegative = change < 0;
        changeColor = isPositive ? (isPositiveGood ? 'text-green-400' : 'text-red-400') : (isNegative ? (isPositiveGood ? 'text-red-400' : 'text-green-400') : 'text-theme-text-secondary');
        formattedChangeText = `${change > 0 ? '+' : ''}${change.toLocaleString()}${unit}`;
    }

    return (
        <div className="bg-theme-bg p-4 rounded-lg border border-theme-border">
            <p className="text-sm text-theme-text-secondary">{title}</p>
            <p className="text-3xl font-bold text-theme-text-primary my-1">{typeof value === 'string' ? value : value.toLocaleString()}{unit}</p>
            <p className={`text-sm font-semibold ${changeColor}`}>{formattedChangeText}</p>
        </div>
    );
};

const Widget = ({ title, icon, onAdd }) => (
     <div onClick={onAdd} className="flex items-center p-3 bg-theme-bg border border-theme-border rounded-md cursor-pointer shadow-sm hover:bg-black hover:bg-opacity-20 transition-colors">
        {React.cloneElement(icon, { className: 'w-5 h-5 mr-3 text-theme-accent' })}
        <span className="text-sm font-medium text-theme-text-primary">{title}</span>
    </div>
);

const ChartContainer = ({ title, children }) => (
    <div className="lg:col-span-3 h-80 bg-theme-bg border border-theme-border rounded-lg p-4 flex flex-col">
        <h4 className="text-md font-semibold text-theme-text-primary mb-4">{title}</h4>
        <div className="flex-grow">
            <ResponsiveContainer width="100%" height="100%">
                {children}
            </ResponsiveContainer>
        </div>
    </div>
);


const DataAnalyticsPage = () => {
    const [activeTab, setActiveTab] = useState('Risk Metrics');
    const [aiQuery, setAiQuery] = useState('');
    const [aiResponse, setAiResponse] = useState(null);
    const [isAiLoading, setIsAiLoading] = useState(false);
    
    const [dashboardData, setDashboardData] = useState(initialDashboardData);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [selectedDocs, setSelectedDocs] = useState({ annualReports: true, boardMinutes: false });
    
    const [canvasWidgets, setCanvasWidgets] = useState([]);
    const [metricsSearch, setMetricsSearch] = useState('');

    const handleRunAIQuery = (e) => {
        e.preventDefault();
        const query = aiQuery.toLowerCase();
        if (!query.trim()) return;
        setIsAiLoading(true);
        setAiResponse(null);
        setTimeout(() => {
            if (query.includes('volume')) setAiResponse(mockAiResponses.volume);
            else if (query.includes('risk')) setAiResponse(mockAiResponses.risk);
            else setAiResponse(mockAiResponses.default);
            setIsAiLoading(false);
        }, 1500);
    };
    
     const handleAnalyzeUnstructured = () => {
        setIsAnalyzing(true);
        setAnalysisResult(null);
        const docTypes = Object.entries(selectedDocs).filter(([,v]) => v).map(([k,]) => k).join(', ');
        setTimeout(() => {
            alert(`Simulating analysis of selected document types: ${docTypes}`);
            setAnalysisResult(mockUnstructuredAnalysis);
            setIsAnalyzing(false);
        }, 2000);
    };
    
    const handleAddWidgetToCanvas = (type, props = {}) => {
        const newWidget = { id: Date.now(), type, ...props };
        setCanvasWidgets(prev => [...prev, newWidget]);
    };

    const filteredMetrics = useMemo(() => {
        return initialDashboardData.metricsLibrary.filter(metric =>
            metric.name.toLowerCase().includes(metricsSearch.toLowerCase()) ||
            metric.description.toLowerCase().includes(metricsSearch.toLowerCase())
        );
    }, [metricsSearch]);
    
    const renderActiveDashboard = () => {
        switch (activeTab) {
            case 'Risk Metrics': return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <KPICard title="Avg. Capital Adequacy Ratio" value={dashboardData.riskMetrics.avgCAR.value} change={dashboardData.riskMetrics.avgCAR.change} unit="%" />
                    <KPICard title="Avg. NPL Ratio" value={dashboardData.riskMetrics.avgNPL.value} change={dashboardData.riskMetrics.avgNPL.change} unit="%" isPositiveGood={false} />
                    <KPICard title="Sector Liquidity Coverage" value={dashboardData.riskMetrics.sectorLiquidity.value} change={dashboardData.riskMetrics.sectorLiquidity.change} unit="%" />
                    <ChartContainer title="Key Risk Indicator Trends (6 Months)">
                        <LineChart data={dashboardData.riskTrendData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1}/>
                            <XAxis dataKey="name" stroke="#888" tick={{ fill: '#888' }} />
                            <YAxis yAxisId="left" stroke="#888" tick={{ fill: '#888' }} />
                            <YAxis yAxisId="right" orientation="right" stroke="#888" tick={{ fill: '#888' }} />
                            <Tooltip contentStyle={{ backgroundColor: '#222', border: '1px solid #444' }}/>
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="CAR" stroke="#34d399" />
                            <Line yAxisId="right" type="monotone" dataKey="NPL" stroke="#f87171" />
                        </LineChart>
                    </ChartContainer>
                </div>
            );
            case 'Market Conduct': return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <KPICard title="Complaint Volume (30d)" value={dashboardData.marketConduct.complaintVolume.value} change={dashboardData.marketConduct.complaintVolume.change} isPositiveGood={false} />
                    <KPICard title="Suitability Breaches (YTD)" value={initialDashboardData.marketConduct.suitabilityBreaches.value} change={initialDashboardData.marketConduct.suitabilityBreaches.change} isPositiveGood={false} />
                    <KPICard title="Fee Structure Outliers" value={initialDashboardData.marketConduct.feeOutliers.value} change={initialDashboardData.marketConduct.feeOutliers.change} isPositiveGood={false}/>
                    <ChartContainer title="Top 5 Institutions by Complaint Volume">
                        <BarChart data={dashboardData.complaintData} layout="vertical" margin={{ top: 5, right: 20, left: 50, bottom: 5 }}>
                             <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1}/>
                             <XAxis type="number" stroke="#888" tick={{ fill: '#888' }} />
                             <YAxis type="category" dataKey="name" width={120} stroke="#888" tick={{ fill: '#888' }} />
                             <Tooltip cursor={{fill: 'rgba(255,255,255,0.1)'}} contentStyle={{ backgroundColor: '#222', border: '1px solid #444' }}/>
                             <Bar dataKey="complaints" fill="#fbbf24" />
                        </BarChart>
                    </ChartContainer>
                </div>
            );
            case 'Supervisory Performance': return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <KPICard title="Avg. License Approval Time" value={initialDashboardData.supervisoryPerformance.avgLicenseTime.value} change={initialDashboardData.supervisoryPerformance.avgLicenseTime.change} unit="d" isPositiveGood={false} />
                    <KPICard title="Overdue Compliance Reviews" value={initialDashboardData.supervisoryPerformance.overdueReviews.value} change={initialDashboardData.supervisoryPerformance.overdueReviews.change} isPositiveGood={false} />
                    <KPICard title="Top Workflow Bottleneck" value={initialDashboardData.supervisoryPerformance.workflowBottleneck} change={null} />
                    <ChartContainer title="Avg. Days per Workflow Stage">
                        <BarChart data={dashboardData.workflowData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                             <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1}/>
                             <XAxis dataKey="stage" stroke="#888" tick={{ fill: '#888' }} />
                             <YAxis stroke="#888" tick={{ fill: '#888' }} />
                             <Tooltip contentStyle={{ backgroundColor: '#222', border: '1px solid #444' }}/>
                             <Bar dataKey="days" fill="#60a5fa" />
                        </BarChart>
                    </ChartContainer>
                </div>
            );
             case 'Custom Dashboard Builder': return (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1 p-4 bg-theme-bg rounded-lg border border-theme-border">
                        <h4 className="font-semibold text-theme-text-primary mb-3">Widget Library</h4>
                        <p className="text-xs text-theme-text-secondary mb-3">Click a widget to add it to the canvas.</p>
                        <div className="space-y-3">
                            <Widget title="KPI Card" icon={<LightBulbIcon />} onAdd={() => handleAddWidgetToCanvas('kpi', { title: 'New KPI', value: '123', change: 10 })} />
                            <Widget title="Risk Trend Chart" icon={<SparklesIcon />} onAdd={() => handleAddWidgetToCanvas('chart', { title: 'Risk Trends', data: dashboardData.riskTrendData, type: 'line' })} />
                            <Widget title="Complaint Table" icon={<TableCellsIcon />} onAdd={() => handleAddWidgetToCanvas('table', { title: 'Recent Complaints', ...mockAiResponses.volume })} />
                            <button onClick={() => setCanvasWidgets([])} className="w-full mt-4 inline-flex items-center justify-center text-xs text-red-400 hover:text-red-300">
                                <TrashIcon className="w-4 h-4 mr-1"/> Clear Canvas
                            </button>
                        </div>
                    </div>
                    <div className="lg:col-span-3 min-h-[400px] bg-theme-bg border-2 border-dashed border-theme-border rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4 content-start">
                        {canvasWidgets.length === 0 ? <div className="col-span-full h-full flex items-center justify-center text-theme-text-secondary italic">Dashboard Canvas</div>
                        : canvasWidgets.map(w => {
                            if (w.type === 'kpi') return <div key={w.id} className="md:col-span-1"><KPICard {...w} /></div>;
                            if (w.type === 'chart') return <div key={w.id} className="md:col-span-2"><ChartContainer title={w.title}><LineChart data={w.data}><Tooltip/><Line dataKey="CAR" stroke="#34d399" /><Line dataKey="NPL" stroke="#f87171" /></LineChart></ChartContainer></div>;
                            if (w.type === 'table') return <div key={w.id} className="md:col-span-2 overflow-x-auto"><h4 className="font-semibold text-theme-text-primary mb-2">{w.title}</h4><table className="min-w-full divide-y divide-theme-border border border-theme-border"><thead className="bg-black bg-opacity-20"><tr>{w.headers.map(h => <th key={h} className="px-3 py-2 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">{h}</th>)}</tr></thead><tbody className="divide-y divide-theme-border">{w.rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j} className="px-3 py-2 text-sm text-theme-text-primary">{cell}</td>)}</tr>)}</tbody></table></div>;
                            return null;
                        })}
                    </div>
                </div>
             );
            default: return null;
        }
    }

    return (
        <div className="p-4 md:p-6 bg-theme-bg min-h-screen">
            <h1 className="text-3xl font-bold text-theme-text-primary mb-2">Data & Analytics Hub</h1>
            <p className="text-theme-text-secondary mb-8">Centralized intelligence for risk assessment and supervisory oversight.</p>

            {/* AI Analysis Section */}
            <div className="bg-theme-bg-secondary p-6 rounded-xl shadow-lg mb-8 border border-theme-border">
                <h2 className="text-xl font-semibold text-theme-text-primary mb-2">Analyze with AI</h2>
                <p className="text-sm text-theme-text-secondary mb-4">Ask complex questions using natural language to query structured and unstructured data.</p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-4 items-start">
                    <div>
                        <h3 className="font-semibold text-theme-text-primary mb-2">Query the Structured Dataset</h3>
                         <form onSubmit={handleRunAIQuery} className="flex items-center space-x-2">
                             <input type="text" value={aiQuery} onChange={e => setAiQuery(e.target.value)} placeholder='Try "show risk scores"...' className="w-full p-2 bg-theme-bg border border-theme-border rounded-md shadow-sm text-theme-text-primary focus:ring-theme-accent focus:border-theme-accent" />
                             <button type="submit" disabled={isAiLoading || !aiQuery.trim()} className="px-4 py-2 bg-theme-accent text-sidebar-bg font-semibold rounded-md shadow-sm hover:brightness-110 disabled:opacity-50">
                                {isAiLoading ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : 'Ask'}
                             </button>
                         </form>
                         {isAiLoading && <div className="mt-4 text-center text-theme-text-secondary">Analyzing...</div>}
                         {aiResponse && <div className="mt-4 overflow-x-auto"><table className="min-w-full divide-y divide-theme-border border border-theme-border"><thead className="bg-black bg-opacity-20"><tr>{aiResponse.headers.map(h => <th key={h} className="px-3 py-2 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">{h}</th>)}</tr></thead><tbody className="divide-y divide-theme-border">{aiResponse.rows.map((row, i) => <tr key={i} className="hover:bg-black hover:bg-opacity-20">{row.map((cell, j) => <td key={j} className="px-3 py-2 text-sm text-theme-text-primary whitespace-nowrap">{cell}</td>)}</tr>)}</tbody></table></div>}
                    </div>
                    <div>
                         <h3 className="font-semibold text-theme-text-primary mb-2">Analyze Unstructured Documents</h3>
                         <div className="p-4 bg-theme-bg rounded-md h-full flex flex-col justify-between border border-theme-border">
                            {isAnalyzing ? <div className="flex-grow flex items-center justify-center text-theme-text-secondary"><ArrowPathIcon className="w-6 h-6 animate-spin mr-2"/>Running analysis...</div>
                            : analysisResult ? (
                                <div className="text-sm space-y-3 flex-grow">
                                    <div><strong className="text-theme-text-secondary">Sentiment:</strong> <span className={analysisResult.sentiment.score < 0 ? 'text-red-400' : 'text-green-400'}>{analysisResult.sentiment.label} ({analysisResult.sentiment.score})</span></div>
                                    <div><strong className="text-theme-text-secondary">Key Themes:</strong> <ul className="list-disc list-inside mt-1">{analysisResult.themes.map(t => <li key={t}>{t}</li>)}</ul></div>
                                    <div><strong className="text-theme-text-secondary">Risk Phrases:</strong> <ul className="list-disc list-inside mt-1 italic">{analysisResult.riskPhrases.map(p => <li key={p}>"{p}"</li>)}</ul></div>
                                </div>
                            ) : (
                                <div className="flex-grow space-y-2">
                                    <p className="text-sm text-theme-text-secondary">Select document types to analyze:</p>
                                    <label className="flex items-center"><input type="checkbox" checked={selectedDocs.annualReports} onChange={e => setSelectedDocs(s => ({...s, annualReports: e.target.checked}))} className="h-4 w-4 mr-2 bg-theme-bg border-gray-500 rounded text-theme-accent focus:ring-theme-accent" /> Annual Reports</label>
                                    <label className="flex items-center"><input type="checkbox" checked={selectedDocs.boardMinutes} onChange={e => setSelectedDocs(s => ({...s, boardMinutes: e.target.checked}))} className="h-4 w-4 mr-2 bg-theme-bg border-gray-500 rounded text-theme-accent focus:ring-theme-accent" /> Board Minutes</label>
                                </div>
                            )}
                            <button onClick={handleAnalyzeUnstructured} disabled={isAnalyzing} className="mt-3 w-full p-2 bg-gray-700 text-white font-semibold rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50">
                                {isAnalyzing ? 'Analyzing...' : analysisResult ? 'Re-run Analysis' : 'Run Analysis'}
                            </button>
                         </div>
                    </div>
                </div>
            </div>

            {/* Dashboards Section */}
            <div className="border-b border-theme-border mt-10">
                <nav className="-mb-px flex space-x-6 overflow-x-auto">
                    <DashboardTab label="Risk Metrics" activeTab={activeTab} onClick={() => setActiveTab('Risk Metrics')} />
                    <DashboardTab label="Market Conduct" activeTab={activeTab} onClick={() => setActiveTab('Market Conduct')} />
                    <DashboardTab label="Supervisory Performance" activeTab={activeTab} onClick={() => setActiveTab('Supervisory Performance')} />
                    <DashboardTab label="Custom Dashboard Builder" activeTab={activeTab} onClick={() => setActiveTab('Custom Dashboard Builder')} />
                </nav>
            </div>
            <div className="bg-theme-bg-secondary p-6 rounded-b-xl shadow-lg border border-t-0 border-theme-border">
                {renderActiveDashboard()}
                 <div className="text-right mt-6 pt-4 border-t border-theme-border">
                    <button onClick={() => alert("Simulating PDF Export...")} className="text-sm text-blue-400 hover:text-theme-accent hover:underline mr-4">Export to PDF</button>
                    <button onClick={() => alert("Simulating Excel Export...")} className="text-sm text-blue-400 hover:text-theme-accent hover:underline">Export to Excel</button>
                </div>
            </div>

            {/* Metrics Library Section */}
             <div className="mt-8">
                <div className="bg-theme-bg-secondary p-6 rounded-xl shadow-lg border border-theme-border">
                    <h3 className="text-xl font-semibold text-theme-text-primary mb-4">Central Metrics Library</h3>
                    <div className="relative mb-4">
                        <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-secondary" />
                        <input type="text" value={metricsSearch} onChange={e => setMetricsSearch(e.target.value)} placeholder="Search metrics library..." className="w-full p-2 pl-10 bg-theme-bg border border-theme-border rounded-md text-theme-text-primary focus:ring-theme-accent focus:border-theme-accent" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredMetrics.length > 0 ? filteredMetrics.map(metric => (
                            <div key={metric.id} className="p-4 bg-theme-bg rounded-md border border-theme-border">
                                <h4 className="font-semibold text-theme-text-primary">{metric.name}</h4>
                                <p className="text-sm text-theme-text-secondary mt-1">{metric.description}</p>
                                <p className="text-xs text-gray-500 mt-2">Source: {metric.source}</p>
                            </div>
                        )) : <p className="text-theme-text-secondary italic md:col-span-2">No metrics found for "{metricsSearch}".</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataAnalyticsPage;