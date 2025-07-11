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
            return <div className="p-4 bg-blue-50 rounded-lg text-lg font-semibold text-blue-800">{queryResult.data}</div>;
        case 'table':
            return (
                <table className="min-w-full divide-y divide-gray-200 border">
                    <thead className="bg-gray-50">
                        <tr>{queryResult.data.headers.map(h => <th key={h} className="px-3 py-2 text-left text-xs font-medium text-gray-500">{h}</th>)}</tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {queryResult.data.rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j} className="px-3 py-2 text-sm">{cell}</td>)}</tr>)}
                    </tbody>
                </table>
            );
        case 'chart':
            const ChartComponent = {
                bar: Bar,
                line: Line,
                doughnut: Doughnut,
            }[queryResult.data.chartType] || Bar;
            return <ChartComponent data={queryResult.data} options={queryResult.data.options} />;
        default:
            return <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(queryResult, null, 2)}</pre>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Natural Language Query Section */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="font-semibold text-gray-700 mb-2">Query Systemic Data with Natural Language</h4>
        <form onSubmit={handleQuerySubmit} className="flex items-center space-x-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
            placeholder="e.g., 'Show me a bar chart of NPL ratios by entity' or 'Which entities have the highest CRE exposure?'"
            disabled={isQuerying}
          />
          <button
            type="submit"
            disabled={isQuerying || !query.trim()}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50"
          >
            <SparklesIcon className="w-5 h-5 inline-block mr-1" />
            {isQuerying ? 'Analyzing...' : 'Ask AI'}
          </button>
        </form>
        <div className="mt-4 p-4 border-t">
          {isQuerying && <p className="text-center text-gray-500">AI is thinking...</p>}
          {queryError && <div className="p-3 bg-red-100 text-red-700 rounded-md">{queryError}</div>}
          {queryResult && renderQueryResult()}
        </div>
      </div>

      {/* Document Analysis Section */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="font-semibold text-gray-700 mb-2">Analyze Regulatory Document</h4>
        <div className="flex items-center space-x-2">
          <input
            type="file"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-blue-700 hover:file:bg-blue-50"
            disabled={isAnalyzingDoc}
          />
          <button
            onClick={handleDocumentAnalysis}
            disabled={isAnalyzingDoc || !documentFile}
            className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-md shadow-sm hover:bg-purple-700 disabled:opacity-50 flex-shrink-0"
          >
            <DocumentArrowUpIcon className="w-5 h-5 inline-block mr-1" />
            {isAnalyzingDoc ? 'Analyzing...' : 'Analyze Document'}
          </button>
        </div>
        <div className="mt-4 p-4 border-t">
            {isAnalyzingDoc && <p className="text-center text-gray-500">AI is processing the document...</p>}
            {docAnalysisError && <div className="p-3 bg-red-100 text-red-700 rounded-md">{docAnalysisError}</div>}
            {docAnalysisResult && (
                <div className="space-y-3 text-sm">
                    <h5 className="font-bold">Analysis Summary:</h5>
                    <p className="p-2 bg-gray-50 rounded-md italic">"{docAnalysisResult.summary}"</p>
                    <h5 className="font-bold pt-2 border-t">Suggested Categories:</h5>
                    <div className="flex flex-wrap gap-2">
                        {docAnalysisResult.suggestedCategoryIds.map(id => <span key={id} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">{id}</span>)}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AIMacroAnalytics;