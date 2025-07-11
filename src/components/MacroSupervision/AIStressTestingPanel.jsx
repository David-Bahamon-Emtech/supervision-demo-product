// src/components/MacroSupervision/AIStressTestingPanel.jsx
import React, { useState } from 'react';
import { stressTestScenarios, historicalStressResults } from '../../data/stressTestScenarios.js';
import * as aiMacroAnalyticsService from '../../services/aiMacroAnalyticsService.js';
import { Bar } from 'react-chartjs-2';

const AIStressTestingPanel = () => {
  const [selectedScenarioId, setSelectedScenarioId] = useState(stressTestScenarios[0].id);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [aiNarrative, setAiNarrative] = useState('');
  const [isLoadingNarrative, setIsLoadingNarrative] = useState(false);

  const handleRunTest = () => {
    setIsTestRunning(true);
    setTestResults(null);
    setAiNarrative('');
    console.log(`Running stress test for scenario: ${selectedScenarioId}`);
    
    // Simulate test execution
    setTimeout(() => {
      // Find historical result that matches the scenario to simulate an outcome
      const result = historicalStressResults.find(r => r.scenarioId === selectedScenarioId) || historicalStressResults[0];
      
      const chartData = {
        labels: result.impact.map(i => i.metric),
        datasets: [
          {
            label: 'Pre-Stress',
            data: result.impact.map(i => parseFloat(i.pre_stress) || 0),
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          },
          {
            label: 'Post-Stress',
            data: result.impact.map(i => parseFloat(i.post_stress) || 0),
            backgroundColor: 'rgba(255, 99, 132, 0.6)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          },
        ],
      };

      setTestResults({
        ...result,
        scenarioName: stressTestScenarios.find(s => s.id === selectedScenarioId)?.name || 'Unknown Scenario',
        chartData
      });
      setIsTestRunning(false);
    }, 2500); // Simulate a 2.5 second test run
  };

  const handleGenerateNarrative = async () => {
    if (!testResults) return;
    setIsLoadingNarrative(true);
    setAiNarrative('');
    try {
        const payload = {
            scenarioName: testResults.scenarioName,
            preStress: testResults.impact.reduce((acc, i) => ({...acc, [i.metric]: i.pre_stress}), {}),
            postStress: testResults.impact.reduce((acc, i) => ({...acc, [i.metric]: i.post_stress}), {}),
        };
      const response = await aiMacroAnalyticsService.generateStressTestNarrative(payload);
      setAiNarrative(response.narrative);
    } catch (error) {
      console.error("Failed to generate AI narrative:", error);
      setAiNarrative("Error: Could not generate narrative.");
    } finally {
      setIsLoadingNarrative(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Configuration Panel */}
      <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow space-y-4">
        <div>
          <label htmlFor="scenario-select" className="block text-sm font-medium text-gray-700">
            Select Stress Test Scenario
          </label>
          <select
            id="scenario-select"
            value={selectedScenarioId}
            onChange={(e) => setSelectedScenarioId(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            {stressTestScenarios.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.type})</option>
            ))}
          </select>
        </div>
        <p className="text-xs text-gray-500">
          {stressTestScenarios.find(s => s.id === selectedScenarioId)?.description}
        </p>
        <button
          onClick={handleRunTest}
          disabled={isTestRunning}
          className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
        >
          {isTestRunning ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Running Test...
            </>
          ) : (
            'Run System-Wide Stress Test'
          )}
        </button>
      </div>

      {/* Results and Narrative Panel */}
      <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow">
        <h4 className="text-lg font-semibold text-gray-700 mb-2">Results & Analysis</h4>
        {!testResults && !isTestRunning && (
            <div className="h-full flex items-center justify-center text-gray-500 italic">
                Select a scenario and run the test to see results.
            </div>
        )}
         {isTestRunning && (
            <div className="h-full flex items-center justify-center text-gray-500 italic">
                Calculating system-wide impact...
            </div>
        )}
        {testResults && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <h5 className="font-semibold text-gray-600">Impact on Key Metrics</h5>
                <div className="mt-2 h-64">
                    <Bar data={testResults.chartData} options={{ maintainAspectRatio: false, scales: {y: {beginAtZero: true}} }} />
                </div>
                <button
                    onClick={handleGenerateNarrative}
                    disabled={isLoadingNarrative}
                    className="w-full mt-4 px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-md shadow-sm hover:bg-purple-700 disabled:opacity-50"
                >
                    {isLoadingNarrative ? 'Generating...' : 'Generate AI Narrative'}
                </button>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
                <h5 className="font-semibold text-gray-600 mb-2">AI Narrative Analysis</h5>
                {isLoadingNarrative && <p className="text-sm italic text-gray-500">AI is interpreting the results...</p>}
                {aiNarrative ? (
                     <p className="text-sm text-gray-800 whitespace-pre-wrap">{aiNarrative}</p>
                ) : (
                    !isLoadingNarrative && <p className="text-sm italic text-gray-500">Click "Generate AI Narrative" for an automated interpretation of the results.</p>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIStressTestingPanel;