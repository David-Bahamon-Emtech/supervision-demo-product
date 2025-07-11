// src/components/RiskAssessment/RiskAssessmentPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { ChartBarIcon, FireIcon, BeakerIcon, ScaleIcon, ShieldCheckIcon, DocumentMagnifyingGlassIcon, ArrowTrendingUpIcon, WalletIcon, LinkIcon, XMarkIcon, DocumentArrowUpIcon, SparklesIcon, BuildingLibraryIcon, ClockIcon, FolderIcon } from '@heroicons/react/24/outline';
import { calculateAllEntityRisks, getAggregatedSystemicRisk, getSectorRiskTrends, runStressTestForEntity } from '../../services/riskAssessmentService.js';
import { protocolMonitoring } from '../../data/defiSupervisionData.js';
import licensesData from '../../data/licenses.js';
import regulatorStaffData from '../../data/regulatorStaff.js';
import complianceSubmissionsData from '../../data/complianceSubmissions.js';
import axios from 'axios';

// Import all new dashboard components
import BaselIIIDashboard from './BaselIIIDashboard.jsx';
import SupervisionFramework from './SupervisionFramework.jsx';
import RiskMonitoringDashboard from './RiskMonitoringDashboard.jsx';
import AdvancedStressTesting from './AdvancedStressTesting.jsx';
import MarketRiskDashboard from './MarketRiskDashboard.jsx';
import DeFiRiskDashboard from './DeFiRiskDashboard.jsx';
import RiskReportingDashboard from './RiskReportingDashboard.jsx';


// --- Helper Components ---

const RiskScore = ({ score, size = 'large' }) => {
    let colorClass = 'bg-gray-400';
    if (score >= 4.0) colorClass = 'bg-red-500';
    else if (score >= 3.0) colorClass = 'bg-orange-500';
    else if (score >= 2.0) colorClass = 'bg-yellow-400';
    else if (score > 0) colorClass = 'bg-green-500';

    const sizeClass = size === 'large'
        ? 'w-12 h-12 text-lg'
        : 'w-10 h-10 text-base';

    return (
        <div className={`flex items-center justify-center rounded-full text-white font-bold ${colorClass} ${sizeClass}`}>
            {score.toFixed(1)}
        </div>
    );
};

const DashboardCard = ({ title, children, icon }) => (
    <div className="bg-white p-4 rounded-lg shadow-md h-full">
        <div className="flex items-center text-lg font-semibold text-gray-700 mb-2">
            {React.cloneElement(icon, { className: 'w-6 h-6 mr-2 text-gray-500' })}
            {title}
        </div>
        <div>{children}</div>
    </div>
);

// --- MODAL COMPONENT for Risk Profile ---
const RiskProfileModal = ({ entity, onClose, onMitigationAction, onOverrideChange, onSaveOverride, manualOverrideState, onRunStressTest, isStressing, stressTestResults, onFileChange, onAnalyzeDocument, isAnalyzing, analysisResult, analysisError, selectedFile }) => {
    if (!entity) return null;

    const [manualOverride, setManualOverride] = manualOverrideState;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative bg-white p-6 rounded-lg shadow-xl w-full max-w-5xl max-h-[95vh] flex flex-col">
                <div className="flex justify-between items-start pb-4 border-b">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-800">Risk Profile: <span className="text-blue-600">{entity.companyName}</span></h2>
                        {entity.isOverridden && <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">Manually Overridden</span>}
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto mt-4 pr-2">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Side: Drill Down Details */}
                        <div className="lg:col-span-2 space-y-6">
                            <div>
                                <h3 className="font-semibold text-gray-700 mb-2">Key Identification</h3>
                                <div className="text-sm p-3 bg-gray-50 rounded-md">
                                    <p><strong>Registration Number:</strong> {entity.registrationNumber}</p>
                                    <p><strong>Assigned Officer:</strong> {regulatorStaffData.find(s => s.staffId === entity.assignedOfficerId)?.name || 'N/A'}</p>
                                    <p><strong>License(s) Held:</strong> {licensesData.filter(l => l.entityId === entity.entityId).map(l => l.licenseType).join(', ')}</p>
                                </div>
                            </div>
                             <div>
                                <h3 className="font-semibold text-gray-700 mb-2">Underlying Data Points</h3>
                                <div className="text-sm p-3 bg-gray-50 rounded-md">
                                    <p><strong>Compliance:</strong> Overdue Submissions: {complianceSubmissionsData.filter(s => s.entityId === entity.entityId && (s.status === 'Pending Submission' || s.status === 'Late Submission')).length}</p>
                                    <p><strong>Credit:</strong> Simulated NPL Ratio: {entity.simulatedNPL}% | Simulated CAR: {entity.simulatedCAR}%</p>
                                    <p><strong>Governance:</strong> Number of PEPs: {(entity.directors?.filter(d => d.isPEP).length || 0) + (entity.ubos?.filter(u => u.isPEP).length || 0)}</p>
                                </div>
                            </div>
                             <div>
                                <h3 className="font-semibold text-gray-700 mb-2">Risk Mitigation Actions</h3>
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => onMitigationAction('Schedule Inspection')} className="text-sm p-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200">Schedule Inspection</button>
                                    <button onClick={() => onMitigationAction('Request Remediation Plan')} className="text-sm p-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200">Request Remediation</button>
                                    <button onClick={() => onMitigationAction('Issue Warning Letter')} className="text-sm p-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200">Issue Warning</button>
                                </div>
                                {entity.lastActionTaken && <p className="text-xs text-gray-500 mt-2 italic">Last action taken (this session): {entity.lastActionTaken}</p>}
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-700 mb-2">Individual Stress Testing</h3>
                                <p className="text-xs text-gray-500 mb-2">Run simulations based on specific risk scenarios.</p>
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => onRunStressTest({ type: 'INTEREST_RATE_SHOCK', shockValue: 0.25 })} className="text-sm p-2 bg-red-100 text-red-800 rounded hover:bg-red-200">25% NIM Reduction</button>
                                    <button onClick={() => onRunStressTest({ type: 'CREDIT_DEFAULT_SHOCK', sector: 'Commercial Real Estate', shockValue: 0.50 })} className="text-sm p-2 bg-red-100 text-red-800 rounded hover:bg-red-200">+50% NPL in Real Estate</button>
                                </div>
                                {isStressing && <p className="text-sm italic text-gray-500 mt-2">Running simulation...</p>}
                                {stressTestResults && (
                                    <div className="mt-4 p-3 bg-gray-100 rounded-md">
                                        <h4 className="font-semibold text-sm mb-2">Stress Test Results</h4>
                                        <p className="text-xs italic mb-2">{stressTestResults.impactSummary}</p>
                                        <table className="w-full text-xs">
                                            <thead><tr className="border-b"><th className="text-left">Metric</th><th className="text-right">Pre-Stress</th><th className="text-right">Post-Stress</th></tr></thead>
                                            <tbody>
                                                <tr><td>CAR</td><td className="text-right">{stressTestResults.preStress.car.toFixed(2)}%</td><td className="text-right font-bold">{stressTestResults.postStress.car.toFixed(2)}%</td></tr>
                                                <tr><td>NPL Ratio</td><td className="text-right">{stressTestResults.preStress.nplRatio.toFixed(2)}%</td><td className="text-right font-bold">{stressTestResults.postStress.nplRatio.toFixed(2)}%</td></tr>
                                                <tr><td>Profitability</td><td className="text-right">${stressTestResults.preStress.profitability.toLocaleString()}</td><td className="text-right font-bold">${stressTestResults.postStress.profitability.toLocaleString()}</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                            {/* --- Unstructured Document Analysis --*/}
                            <div>
                                <h3 className="font-semibold text-gray-700 mb-2">Unstructured Document Analysis</h3>
                                 <div className="p-4 bg-gray-50 rounded-lg">
                                     <label htmlFor="risk-doc-upload-modal" className="block text-sm font-medium text-gray-700 mb-2">Upload a document for this entity:</label>
                                     <div className="flex items-center space-x-3">
                                         <input id="risk-doc-upload-modal" type="file" onChange={onFileChange} accept=".pdf,.txt" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                                         <button onClick={onAnalyzeDocument} disabled={isAnalyzing || !selectedFile} className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-md shadow-sm hover:bg-purple-700 disabled:opacity-50 flex items-center flex-shrink-0">
                                            <SparklesIcon className="w-5 h-5 mr-2"/>
                                            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                                         </button>
                                     </div>
                                     {selectedFile && <p className="text-xs text-gray-500 mt-2">Selected: {selectedFile.name}</p>}
                                     {isAnalyzing && <p className="text-center text-gray-500 italic mt-2">AI is processing the document...</p>}
                                     {analysisError && <div className="text-red-600 text-sm mt-2">{analysisError}</div>}
                                     {analysisResult && (
                                         <div className="mt-4">
                                             <h4 className="font-semibold text-sm mb-2">Analysis Results:</h4>
                                             <ol className="list-decimal list-inside space-y-2 text-sm">
                                                 {analysisResult.map(risk => (
                                                     <li key={risk.rank}>
                                                         <span className="font-semibold text-gray-800">{risk.category}:</span>
                                                         <span className="text-gray-600 ml-1">{risk.description}</span>
                                                     </li>
                                                 ))}
                                             </ol>
                                         </div>
                                     )}
                                 </div>
                            </div>
                        </div>
                        
                        {/* Right Side: Manual Override Form */}
                        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                            <h3 className="font-semibold text-gray-700 mb-2">Manual Override</h3>
                             <div>
                                <label className="text-sm font-medium">Internal Risk Rating</label>
                                <select value={manualOverride.internalRiskRating} onChange={(e) => onOverrideChange('internalRiskRating', e.target.value)} className="w-full p-2 border rounded-md text-sm">
                                    <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Pillar Score Adjustments</label>
                                {Object.keys(entity.pillarScores).map(pillar => (
                                     <div key={pillar} className="flex items-center justify-between mt-1">
                                        <span className="text-sm">{pillar}</span>
                                        <input type="number" step="0.1" min="1" max="5" value={manualOverride.pillarScores[pillar]} onChange={e => onOverrideChange('pillarScores', e.target.value, pillar)} className="w-20 p-1 border rounded-md text-sm"/>
                                     </div>
                                ))}
                            </div>
                            <div>
                                <label className="text-sm font-medium">Supervisory Notes</label>
                                <textarea value={manualOverride.supervisoryNotes} onChange={(e) => onOverrideChange('supervisoryNotes', e.target.value)} className="w-full p-2 border rounded-md text-sm" rows="4" placeholder="Justification for override..."></textarea>
                            </div>
                            <button onClick={onSaveOverride} className="w-full p-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700">Save Justification & Override</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const RiskAssessmentPage = () => {
    const [entitiesWithScores, setEntitiesWithScores] = useState([]);
    const [selectedEntity, setSelectedEntity] = useState(null);
    const [systemicRiskData, setSystemicRiskData] = useState(null);
    const [sectorTrends, setSectorTrends] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [manualOverride, setManualOverride] = useState({});
    const [stressTestResults, setStressTestResults] = useState(null);
    const [isStressing, setIsStressing] = useState(false);

    // New State for Unstructured Data Analysis
    const [selectedFile, setSelectedFile] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState(null);

    // New state for tab navigation
    const [activeTab, setActiveTab] = useState('Overview');

    // Reconstruct the needed DeFi data structure from the new data source
    const mockDeFiData = useMemo(() => {
        const totalTVL = Object.values(protocolMonitoring).reduce((sum, p) => sum + p.tvl, 0);
        const lendingProtocols = Object.values(protocolMonitoring).filter(p => p.type === 'Lending');
        
        const averageCollateralization = lendingProtocols.length > 0 
            ? lendingProtocols.reduce((sum, p) => sum + (p.collateralizationRatio || 0), 0) / lendingProtocols.length 
            : 0;
            
        // Simplified leverage calculation
        const leverage = averageCollateralization > 1 
            ? (1 / (1 - (1 / averageCollateralization))).toFixed(2) + 'x' 
            : 'N/A';

        return {
            stablecoinCollateralization: [{ name: 'Systemic Avg.', ratio: `${(averageCollateralization * 100).toFixed(1)}%` }],
            tvl: `$${(totalTVL / 1e9).toFixed(1)}B`,
            leverage: leverage,
        };
    }, []);

    useEffect(() => {
        setIsLoading(true);
        const allRisks = calculateAllEntityRisks();
        setEntitiesWithScores(allRisks);
        const systemicData = getAggregatedSystemicRisk(allRisks);
        setSystemicRiskData(systemicData);
        const sectorData = getSectorRiskTrends(allRisks);
        setSectorTrends(sectorData);
        setIsLoading(false);
    }, []);

    const handleSelectEntity = (entity) => {
        setSelectedEntity(entity);
        setManualOverride({
            internalRiskRating: entity.internalRiskRating || 'Medium',
            supervisoryNotes: entity.supervisoryNotes || '',
            pillarScores: { ...entity.pillarScores },
            primaryRiskDriver: entity.primaryRiskDriver || ''
        });
    };
    
    const handleOverrideChange = (field, value, pillar = null) => {
        if (pillar) {
            setManualOverride(prev => ({ ...prev, pillarScores: { ...prev.pillarScores, [pillar]: parseFloat(value) || 0 } }));
        } else {
            setManualOverride(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleSaveOverride = () => {
        if (!selectedEntity) return;
        const updatedEntity = {
            ...selectedEntity,
            ...manualOverride,
            compositeScore: Object.values(manualOverride.pillarScores).reduce((a, b) => a + b, 0) / Object.values(manualOverride.pillarScores).length,
            isOverridden: true 
        };
        setEntitiesWithScores(prev => prev.map(e => e.entityId === updatedEntity.entityId ? updatedEntity : e));
        setSelectedEntity(updatedEntity);
        alert(`Overrides saved for ${selectedEntity.companyName}. This is a temporary change for this session and will reset on page reload.`);
    };

    const handleMitigationAction = (action) => {
        alert(`Initiating action: ${action} for ${selectedEntity.companyName}\n\nThis would trigger a workflow and create a task for the assigned supervisor.`);
        const updatedEntity = { ...selectedEntity, lastActionTaken: action };
        setEntitiesWithScores(prev => prev.map(e => e.entityId === updatedEntity.entityId ? updatedEntity : e));
        setSelectedEntity(updatedEntity);
    };

    const handleRunStressTest = (scenario) => {
        if (!selectedEntity) return;
        setIsStressing(true);
        setStressTestResults(null);
        setTimeout(() => { // Simulate network delay
            try {
                const results = runStressTestForEntity(selectedEntity.entityId, scenario);
                setStressTestResults(results);
            } catch (error) {
                console.error(error);
                alert(error.message);
            } finally {
                setIsStressing(false);
            }
        }, 1000);
    };

    // --- NEW: Function to handle unstructured file analysis ---
    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setAnalysisResult(null);
        setAnalysisError(null);
    };

    const handleAnalyzeDocument = async () => {
        if (!selectedFile) {
            setAnalysisError("Please select a file first.");
            return;
        }
        setIsAnalyzing(true);
        setAnalysisError(null);
        setAnalysisResult(null);

        const formData = new FormData();
        formData.append('document', selectedFile);

        try {
            const response = await axios.post('http://localhost:3001/api/risk/analyze-document', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setAnalysisResult(response.data.risks);
        } catch (error) {
            console.error("Error analyzing document:", error);
            setAnalysisError(error.response?.data?.error || "An error occurred during analysis.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const renderOverviewTab = () => (
        <>
            {/* --- Dashboard cards --*/}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <DashboardCard title="Systemic Risk Heatmap" icon={<FireIcon />}>
                   <div className="grid grid-cols-2 gap-4">
                       <div className="p-2 bg-gray-50 rounded text-center"><p className="text-sm text-gray-600">Total Overdue Submissions</p><p className="text-2xl font-bold text-red-600">{systemicRiskData?.totalOverdue}</p></div>
                       <div className="p-2 bg-gray-50 rounded text-center"><p className="text-sm text-gray-600">Entities with Issues</p><p className="text-2xl font-bold text-orange-600">{systemicRiskData?.entitiesWithIssues}</p></div>
                       <div className="p-2 bg-gray-50 rounded text-center"><p className="text-sm text-gray-600">Avg. System-wide CAR</p><p className="text-2xl font-bold text-green-600">{systemicRiskData?.avgCAR}</p></div>
                       <div className="p-2 bg-gray-50 rounded text-center"><p className="text-sm text-gray-600">Avg. System-wide NPL</p><p className="text-2xl font-bold text-blue-600">{systemicRiskData?.avgNPL}</p></div>
                   </div>
               </DashboardCard>
               <DashboardCard title="Sector Risk Trends" icon={<ArrowTrendingUpIcon />}>
                   <ul className="h-48 overflow-y-auto space-y-2">{sectorTrends.map(sector => (<li key={sector.name} className="flex justify-between items-center p-2 bg-gray-50 rounded-md"><span className="text-sm font-medium text-gray-800">{sector.name}</span><span className="text-sm font-bold text-gray-600">{sector.avgRiskScore} ({sector.trend})</span></li>))}</ul>
               </DashboardCard>
                <DashboardCard title="Digital Asset Supervision" icon={<WalletIcon />}>
                    <div className="space-y-3">
                        <div className="p-2 bg-gray-50 rounded"><p className="text-sm text-gray-600">Systemic Stablecoin Collateralization</p><p className="text-2xl font-bold text-gray-800">{mockDeFiData.stablecoinCollateralization[0].ratio}</p></div>
                        <div className="p-2 bg-gray-50 rounded"><p className="text-sm text-gray-600">Total Value Locked (TVL)</p><p className="text-2xl font-bold text-gray-800">{mockDeFiData.tvl}</p></div>
                        <div className="p-2 bg-gray-50 rounded"><p className="text-sm text-gray-600">Overall DeFi Leverage</p><p className="text-2xl font-bold text-gray-800">{mockDeFiData.leverage}</p></div>
                    </div>
               </DashboardCard>
            </div>
            
            {/* --- Entity Risk Overview Table --*/}
            <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Entity Risk Overview</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Composite Score</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Primary Risk Driver</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {entitiesWithScores.map(entity => (
                                <tr key={entity.entityId} onClick={() => handleSelectEntity(entity)} className={`hover:bg-gray-100 cursor-pointer ${selectedEntity?.entityId === entity.entityId ? 'bg-blue-50' : ''} ${entity.trend === 'down' ? 'bg-red-50 hover:bg-red-100' : ''}`}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entity.companyName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap"><RiskScore score={entity.compositeScore} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{entity.trend}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entity.primaryRiskDriver}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'Overview':
                return renderOverviewTab();
            case 'Basel III Compliance':
                return <BaselIIIDashboard />;
            case 'Supervision Framework':
                return <SupervisionFramework />;
            case 'Real-time Monitoring':
                return <RiskMonitoringDashboard />;
            case 'Advanced Stress Testing':
                return <AdvancedStressTesting />;
            case 'Market Risk':
                return <MarketRiskDashboard />;
            case 'DeFi Risk':
                return <DeFiRiskDashboard />;
            case 'Reporting':
                return <RiskReportingDashboard />;
            default:
                return renderOverviewTab();
        }
    };
    
     if (isLoading) {
        return <div className="p-6 text-center">Loading Risk Assessment Data...</div>;
    }

    return (
        <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Risk Assessment</h1>

            <div className="mb-6 border-b border-gray-300">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {[
                        'Overview', 'Basel III Compliance', 'Supervision Framework', 
                        'Real-time Monitoring', 'Advanced Stress Testing', 'Market Risk', 
                        'DeFi Risk', 'Reporting'
                    ].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`${activeTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>
            
            {renderContent()}

            {/* --- Modal Rendering --*/}
            {selectedEntity && (
                <RiskProfileModal 
                    entity={selectedEntity}
                    onClose={() => {
                        setSelectedEntity(null);
                        setStressTestResults(null);
                        setAnalysisResult(null);
                        setSelectedFile(null);
                        setAnalysisError(null);
                    }}
                    onMitigationAction={handleMitigationAction}
                    onOverrideChange={handleOverrideChange}
                    onSaveOverride={handleSaveOverride}
                    manualOverrideState={[manualOverride, setManualOverride]}
                    onRunStressTest={handleRunStressTest}
                    isStressing={isStressing}
                    stressTestResults={stressTestResults}
                    onFileChange={handleFileChange}
                    onAnalyzeDocument={handleAnalyzeDocument}
                    isAnalyzing={isAnalyzing}
                    analysisResult={analysisResult}
                    analysisError={analysisError}
                    selectedFile={selectedFile}
                />
            )}
        </div>
    );
};

export default RiskAssessmentPage;