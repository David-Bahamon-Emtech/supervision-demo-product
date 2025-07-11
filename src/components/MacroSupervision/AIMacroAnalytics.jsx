// src/components/MacroSupervision/AIMacroAnalytics.jsx
import React, { useState } from 'react';
import { SparklesIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import * as aiMacroAnalyticsService from '../../services/aiMacroAnalyticsService.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

const AIMacroAnalytics = () => {
  const [query, setQuery] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryResult, setQueryResult] = useState(null);
  const [queryError, setQueryError] = useState(null);

  const [documentFile, setDocumentFile] = useState(null);
  const [isAnalyzingDoc, setIsAnalyzingDoc] = useState(false);
  const [docAnalysisResult, setDocAnalysisResult] = useState(null);
  const [docAnalysisError, setDocAnalysisError] = useState(null);

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsQuerying(true);
    setQueryResult(null);
    setQueryError(null);

    try {
      const result = await aiMacroAnalyticsService.queryMacroRisks(query);
      
      // Inject dark-theme compatible options into chart data
      if (result.displayType === 'chart') {
          result.data.options = {
              ...result.data.options,
              maintainAspectRatio: false,
              plugins: {
                  ...result.data.options?.plugins,
                  legend: { ...result.data.options?.plugins?.legend, labels: { color: '#ADB5BD' } },
                  title: { ...result.data.options?.plugins?.title, color: '#E9ECEF' }
              },
              scales: {
                  y: { ticks: { color: '#ADB5BD' }, grid: { color: '#495057' } },
                  x: { ticks: { color: '#ADB5BD' }, grid: { color: '#495057' } }
              }
          };
      }
      setQueryResult(result);
    } catch (error) {
      setQueryError(error.message || "An error occurred while querying the AI service.");
    } finally {
      setIsQuerying(false);
    }
  };

  const handleFileChange = (e) => {
    setDocumentFile(e.target.files[0]);
    setDocAnalysisResult(null);
    setDocAnalysisError(null);
  };

  const handleDocumentAnalysis = async () => {
    if (!documentFile) return;

    setIsAnalyzingDoc(true);
    setDocAnalysisResult(null);
    setDocAnalysisError(null);

    try {
      const result = await aiMacroAnalyticsService.analyzeRegulatoryDocuments(documentFile);
      setDocAnalysisResult(result);
    } catch (error) {
      setDocAnalysisError(error.message || "Failed to analyze document.");
    } finally {
      setIsAnalyzingDoc(false);
    }
  };
  
  const renderQueryResult = () => {
    if (!queryResult) return null;

    switch (queryResult.displayType) {
        case 'scalar':
            return <div className="p-4 bg-blue-900 bg-opacity-30 rounded-lg text-lg font-semibold text-blue-300">{queryResult.data}</div>;
        case 'table':
            return (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-theme-border border border-theme-border">
                        <thead className="bg-black bg-opacity-20">
                            <tr>{queryResult.data.headers.map(h => <th key={h} className="px-3 py-2 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">{h}</th>)}</tr>
                        </thead>
                        <tbody className="bg-theme-bg-secondary divide-y divide-theme-border">
                            {queryResult.data.rows.map((row, i) => <tr key={i} className="hover:bg-theme-bg">{row.map((cell, j) => <td key={j} className="px-3 py-2 text-sm text-theme-text-primary">{cell}</td>)}</tr>)}
                        </tbody>
                    </table>
                </div>
            );
        case 'chart':
            const ChartComponent = {
                bar: Bar,
                line: Line,
                doughnut: Doughnut,
            }[queryResult.data.chartType] || Bar;
            return <div className="h-80"><ChartComponent data={queryResult.data} options={queryResult.data.options} /></div>;
        default:
            return <pre className="whitespace-pre-wrap text-sm text-theme-text-secondary">{JSON.stringify(queryResult, null, 2)}</pre>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Natural Language Query Section */}
      <div className="bg-theme-bg-secondary p-4 rounded-lg shadow-lg">
        <h4 className="font-semibold text-theme-text-primary mb-2">Query Systemic Data with Natural Language</h4>
        <form onSubmit={handleQuerySubmit} className="flex items-center space-x-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-2 bg-theme-bg border border-theme-border rounded-md shadow-sm text-theme-text-primary focus:ring-theme-accent focus:border-theme-accent"
            placeholder="e.g., 'Show me a bar chart of NPL ratios by entity' or 'Which entities have the highest CRE exposure?'"
            disabled={isQuerying}
          />
          <button
            type="submit"
            disabled={isQuerying || !query.trim()}
            className="px-4 py-2 bg-theme-accent text-sidebar-bg font-semibold rounded-md shadow-sm hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-bg focus:ring-theme-accent disabled:opacity-50"
          >
            <SparklesIcon className="w-5 h-5 inline-block mr-1" />
            {isQuerying ? 'Analyzing...' : 'Ask AI'}
          </button>
        </form>
        <div className="mt-4 pt-4 border-t border-theme-border">
          {isQuerying && <p className="text-center text-theme-text-secondary">AI is thinking...</p>}
          {queryError && <div className="p-3 bg-theme-error-bg text-theme-error-text border border-theme-error-border rounded-md">{queryError}</div>}
          {queryResult && renderQueryResult()}
        </div>
      </div>

      {/* Document Analysis Section */}
      <div className="bg-theme-bg-secondary p-4 rounded-lg shadow-lg">
        <h4 className="font-semibold text-theme-text-primary mb-2">Analyze Regulatory Document</h4>
        <div className="flex items-center space-x-2">
          <input
            type="file"
            onChange={handleFileChange}
            className="block w-full text-sm text-theme-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-theme-text-primary hover:file:bg-gray-600"
            disabled={isAnalyzingDoc}
          />
          <button
            onClick={handleDocumentAnalysis}
            disabled={isAnalyzingDoc || !documentFile}
            className="px-4 py-2 bg-theme-accent text-sidebar-bg font-semibold rounded-md shadow-sm hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-bg focus:ring-theme-accent disabled:opacity-50 flex-shrink-0"
          >
            <DocumentArrowUpIcon className="w-5 h-5 inline-block mr-1" />
            {isAnalyzingDoc ? 'Analyzing...' : 'Analyze Document'}
          </button>
        </div>
        <div className="mt-4 pt-4 border-t border-theme-border">
            {isAnalyzingDoc && <p className="text-center text-theme-text-secondary">AI is processing the document...</p>}
            {docAnalysisError && <div className="p-3 bg-theme-error-bg text-theme-error-text border border-theme-error-border rounded-md">{docAnalysisError}</div>}
            {docAnalysisResult && (
                <div className="space-y-3 text-sm">
                    <h5 className="font-bold text-theme-text-primary">Analysis Summary:</h5>
                    <p className="p-2 bg-theme-bg rounded-md italic text-theme-text-secondary">"{docAnalysisResult.summary}"</p>
                    <h5 className="font-bold pt-2 border-t border-theme-border text-theme-text-primary">Suggested Categories:</h5>
                    <div className="flex flex-wrap gap-2">
                        {docAnalysisResult.suggestedCategoryIds.map(id => <span key={id} className="px-2 py-1 bg-blue-900 bg-opacity-50 text-blue-300 rounded-full text-xs">{id}</span>)}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AIMacroAnalytics;