// src/components/RiskAssessment/AdvancedStressTesting.jsx

import React, { useState, useEffect } from 'react';
import {
  runMacroStressTest,
  runSystemWideStressTest,
  runReverseStressTest,
  calculateStressTestCorrelations,
} from '../../services/riskAssessmentService.js';
import { advancedStressTestData } from '../../data/advancedStressTestData.js';
import entitiesData from '../../data/entities.js';

// --- Reusable Components ---
const TestCard = ({ title, description, children }) => (
    <div className="bg-theme-bg-secondary p-6 rounded-lg shadow-lg border border-theme-border">
        <h3 className="text-xl font-semibold text-theme-text-primary">{title}</h3>
        <p className="text-sm text-theme-text-secondary mt-1 mb-4">{description}</p>
        <div className="space-y-4">{children}</div>
    </div>
);

const ResultDisplay = ({ title, result }) => (
    <div className="mt-4 p-4 bg-theme-bg border border-theme-border rounded-md">
        <h4 className="font-semibold text-theme-text-primary">{title}</h4>
        {result ? (
            <p className="text-sm text-theme-text-secondary mt-1 italic">"{result.impactSummary || result.scenario}"</p>
        ) : (
            <p className="text-sm text-theme-text-secondary mt-1">Awaiting test results...</p>
        )}
    </div>
);


const AdvancedStressTesting = () => {
    const [selectedEntityId, setSelectedEntityId] = useState(entitiesData[0]?.entityId || '');
    const [selectedScenario, setSelectedScenario] = useState('adverse');
    const [failureThreshold, setFailureThreshold] = useState('10'); // As a percentage
    
    const [macroTestResult, setMacroTestResult] = useState(null);
    const [systemTestResult, setSystemTestResult] = useState(null);
    const [reverseTestResult, setReverseTestResult] = useState(null);
    const [correlations, setCorrelations] = useState(null);

    const [isLoading, setIsLoading] = useState({
        macro: false,
        system: false,
        reverse: false,
    });

    const inputStyles = "mt-1 block w-full p-2 bg-theme-bg border-theme-border rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500";
    const labelStyles = "block text-sm font-medium text-theme-text-secondary";

    useEffect(() => {
        // Initial fetch for data that doesn't depend on user input, like correlations
        const fetchCorrelations = async () => {
            const corrData = await calculateStressTestCorrelations();
            setCorrelations(corrData);
        };
        fetchCorrelations();
    }, []);

    const handleRunTest = async (testType) => {
        setIsLoading(prev => ({ ...prev, [testType]: true }));
        try {
            let result;
            if (testType === 'macro') {
                setMacroTestResult(null);
                result = await runMacroStressTest(selectedEntityId, advancedStressTestData.macroScenarios[selectedScenario]);
                setMacroTestResult(result);
            } else if (testType === 'system') {
                setSystemTestResult(null);
                result = await runSystemWideStressTest(advancedStressTestData.macroScenarios[selectedScenario]);
                setSystemTestResult(result);
            } else if (testType === 'reverse') {
                setReverseTestResult(null);
                const thresholdValue = parseFloat(failureThreshold) / 100;
                result = await runReverseStressTest(selectedEntityId, { type: 'CAR', value: thresholdValue });
                setReverseTestResult(result);
            }
        } catch (error) {
            console.error(`Error running ${testType} test:`, error);
            alert(`Failed to run ${testType} test: ${error.message}`);
        } finally {
            setIsLoading(prev => ({ ...prev, [testType]: false }));
        }
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Macro-Economic Stress Test */}
                <TestCard
                    title="Macro-Economic Stress Test"
                    description="Apply system-wide economic scenarios to a selected institution to assess its resilience."
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="entitySelect" className={labelStyles}>Select Entity</label>
                            <select id="entitySelect" value={selectedEntityId} onChange={e => setSelectedEntityId(e.target.value)} className={inputStyles}>
                                {entitiesData.map(e => <option key={e.entityId} value={e.entityId}>{e.companyName}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="scenarioSelect" className={labelStyles}>Select Scenario</label>
                            <select id="scenarioSelect" value={selectedScenario} onChange={e => setSelectedScenario(e.target.value)} className={inputStyles}>
                                {Object.keys(advancedStressTestData.macroScenarios).map(key => (
                                    <option key={key} value={key}>{advancedStressTestData.macroScenarios[key].name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <button onClick={() => handleRunTest('macro')} disabled={isLoading.macro} className="w-full p-2 bg-theme-accent text-sidebar-bg font-semibold rounded-md transition-all hover:brightness-110 disabled:opacity-50">
                        {isLoading.macro ? 'Running Test...' : 'Run Macro Test on Entity'}
                    </button>
                    <ResultDisplay title="Macro Test Result" result={macroTestResult} />
                </TestCard>

                {/* System-Wide Stress Test */}
                <TestCard
                    title="System-Wide Stress Test"
                    description="Assess the impact of a macro scenario on the entire financial system."
                >
                     <div>
                        <label htmlFor="systemScenarioSelect" className={labelStyles}>Select Scenario</label>
                        <select id="systemScenarioSelect" value={selectedScenario} onChange={e => setSelectedScenario(e.target.value)} className={inputStyles}>
                            {Object.keys(advancedStressTestData.macroScenarios).map(key => (
                                <option key={key} value={key}>{advancedStressTestData.macroScenarios[key].name}</option>
                            ))}
                        </select>
                    </div>
                    <button onClick={() => handleRunTest('system')} disabled={isLoading.system} className="w-full p-2 bg-theme-accent text-sidebar-bg font-semibold rounded-md transition-all hover:brightness-110 disabled:opacity-50">
                       {isLoading.system ? 'Running Test...' : 'Run System-Wide Test'}
                    </button>
                    <ResultDisplay title="System-Wide Result" result={systemTestResult} />
                </TestCard>

                 {/* Reverse Stress Test */}
                <TestCard
                    title="Reverse Stress Test"
                    description="Identify the specific economic conditions that would cause an institution to fail."
                >
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="reverseEntitySelect" className={labelStyles}>Select Entity</label>
                            <select id="reverseEntitySelect" value={selectedEntityId} onChange={e => setSelectedEntityId(e.target.value)} className={inputStyles}>
                                {entitiesData.map(e => <option key={e.entityId} value={e.entityId}>{e.companyName}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="failureThreshold" className={labelStyles}>Failure Threshold (CAR %)</label>
                             <input type="number" id="failureThreshold" value={failureThreshold} onChange={e => setFailureThreshold(e.target.value)} className={inputStyles} placeholder="e.g., 10" />
                        </div>
                    </div>
                    <button onClick={() => handleRunTest('reverse')} disabled={isLoading.reverse} className="w-full p-2 bg-theme-accent text-sidebar-bg font-semibold rounded-md transition-all hover:brightness-110 disabled:opacity-50">
                        {isLoading.reverse ? 'Running Test...' : 'Run Reverse Test'}
                    </button>
                    <ResultDisplay title="Reverse Test Scenario" result={reverseTestResult} />
                </TestCard>

                 {/* Correlation Analysis */}
                 <TestCard
                    title="Correlation Analysis"
                    description="Understand how different sectors and risk factors are correlated."
                >
                    {correlations ? (
                        <div className="text-sm space-y-2">
                             <div className="flex justify-between p-2 bg-theme-bg rounded-md">
                                <span className="text-theme-text-secondary">GDP Shock Correlation:</span>
                                <span className="font-bold text-theme-text-primary">{advancedStressTestData.systemWideParameters.gdpShockCorrelation}</span>
                             </div>
                             <div className="flex justify-between p-2 bg-theme-bg rounded-md">
                                <span className="text-theme-text-secondary">Interest Rate Shock Correlation:</span>
                                <span className="font-bold text-theme-text-primary">{advancedStressTestData.systemWideParameters.interestRateShockCorrelation}</span>
                             </div>
                             {Object.entries(correlations).map(([sector, value]) => (
                                 <div key={sector} className="flex justify-between p-2 bg-theme-bg rounded-md">
                                     <span className="text-theme-text-secondary">{sector} Correlation:</span>
                                     <span className="font-bold text-theme-text-primary">{value}</span>
                                 </div>
                             ))}
                        </div>
                    ) : (
                        <p className="text-sm text-theme-text-secondary">Loading correlation data...</p>
                    )}
                </TestCard>

            </div>
        </div>
    );
};

export default AdvancedStressTesting;