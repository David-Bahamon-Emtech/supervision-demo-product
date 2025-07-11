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

  // Dark-theme compatible chart options
  const barChartOptions = {
      maintainAspectRatio: false,
      scales: {
          y: {
              beginAtZero: true,
              ticks: { color: '#ADB5BD' }, // theme-text-secondary
              grid: { color: '#495057' } // theme-border
          },
          x: {
              ticks: { color: '#ADB5BD' },
              grid: { color: 'transparent' }
          }
      },
      plugins: {
          legend: {
              labels: {
                  color: '#ADB5BD'
              }
          }
      }
  };

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
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          },
          {
            label: 'Post-Stress',
            data: result.impact.map(i => parseFloat(i.post_stress) || 0),
            backgroundColor: 'rgba(255, 99, 132, 0.7)',
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
      <div className="lg:col-span-1 bg-theme-bg-secondary p-4 rounded-lg shadow-lg space-y-4">
        <div>
          <label htmlFor="scenario-select" className="block text-sm font-medium text-theme-text-secondary">
            Select Stress Test Scenario
          </label>
          <select
            id="scenario-select"
            value={selectedScenarioId}
            onChange={(e) => setSelectedScenarioId(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-theme-bg border-theme-border focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md text-theme-text-primary"
          >
            {stressTestScenarios.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.type})</option>
            ))}
          </select>
        </div>
        <p className="text-xs text-theme-text-secondary">
          {stressTestScenarios.find(s => s.id === selectedScenarioId)?.description}
        </p>
        <button
          onClick={handleRunTest}
          disabled={isTestRunning}
          className="w-full px-4 py-2 bg-theme-accent text-sidebar-bg font-semibold rounded-md shadow-sm hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-bg focus:ring-theme-accent disabled:opacity-50 flex items-center justify-center"
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
      <div className="lg:col-span-2 bg-theme-bg-secondary p-4 rounded-lg shadow-lg">
        <h4 className="text-lg font-semibold text-theme-text-primary mb-2">Results & Analysis</h4>
        {!testResults && !isTestRunning && (
            <div className="h-full flex items-center justify-center text-theme-text-secondary italic">
                Select a scenario and run the test to see results.
            </div>
        )}
         {isTestRunning && (
            <div className="h-full flex items-center justify-center text-theme-text-secondary italic">
                Calculating system-wide impact...
            </div>
        )}
        {testResults && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <h5 className="font-semibold text-theme-text-secondary">Impact on Key Metrics</h5>
                <div className="mt-2 h-64">
                    <Bar data={testResults.chartData} options={barChartOptions} />
                </div>
                <button
                    onClick={handleGenerateNarrative}
                    disabled={isLoadingNarrative}
                    className="w-full mt-4 px-4 py-2 bg-theme-accent text-sidebar-bg text-sm font-semibold rounded-md shadow-sm hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-bg focus:ring-theme-accent disabled:opacity-50"
                >
                    {isLoadingNarrative ? 'Generating...' : 'Generate AI Narrative'}
                </button>
            </div>
            <div className="bg-theme-bg p-3 rounded-lg">
                <h5 className="font-semibold text-theme-text-secondary mb-2">AI Narrative Analysis</h5>
                {isLoadingNarrative && <p className="text-sm italic text-theme-text-secondary">AI is interpreting the results...</p>}
                {aiNarrative ? (
                     <p className="text-sm text-theme-text-primary whitespace-pre-wrap">{aiNarrative}</p>
                ) : (
                    !isLoadingNarrative && <p className="text-sm italic text-theme-text-secondary">Click "Generate AI Narrative" for an automated interpretation of the results.</p>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIStressTestingPanel;