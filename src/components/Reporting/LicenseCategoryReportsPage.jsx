// src/components/Reporting/LicenseCategoryReportsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  getLicenseCategoryById,
  getEntitiesByLicenseCategory,
  getStaffById
} from './reportingService.js'; // Assuming this file exists and is correct

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement, 
  PointElement,
  LineElement  
} from 'chart.js';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

// formatDate function (if you have one, keep it)

const EntityRow = ({ entity, onEntitySelect, supervisorName }) => {
  // EntityRow component remains the same
  let statusColor = 'bg-gray-400';
  let statusTextColor = 'text-gray-700';
  switch (entity.complianceReadinessStatus) {
    case 'Ready for Compliance Check':
      statusColor = 'bg-green-100';
      statusTextColor = 'text-green-700';
      break;
    case 'Compliance Submission Pending':
      statusColor = 'bg-yellow-100';
      statusTextColor = 'text-yellow-700';
      break;
    case 'Under Active Review':
      statusColor = 'bg-blue-100';
      statusTextColor = 'text-blue-700';
      break;
    default:
      statusColor = 'bg-gray-100';
      statusTextColor = 'text-gray-500';
      break;
  }

  return (
    <tr
      onClick={() => onEntitySelect(entity.entityId)}
      className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
    >
      <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{entity.companyName}</td>
      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{entity.legalName}</td>
      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{supervisorName || entity.assignedOfficerId || 'N/A'}</td>
      <td className="px-6 py-3 whitespace-nowrap text-sm">
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusColor} ${statusTextColor}`}>
          {entity.complianceReadinessStatus || 'Unknown'}
        </span>
      </td>
      <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
        <span className="text-blue-600 hover:text-blue-800">
          View Details &rarr;
        </span>
      </td>
    </tr>
  );
};

const AIQueryResultDisplay = ({ result, label, isQuickQueryBox = false }) => {
  // AIQueryResultDisplay component remains the same as the last version that handled various displayTypes
  const cardBaseClasses = isQuickQueryBox 
    ? "p-2 bg-gray-50 rounded-md text-center shadow h-full flex flex-col" 
    : "p-3 bg-gray-50 rounded-md text-center shadow flex flex-col items-center justify-center";

  const labelClasses = "text-sm font-medium text-gray-700 mb-1";
  const scalarDataClasses = `font-bold text-blue-600 ${isQuickQueryBox ? 'text-2xl' : 'text-3xl'}`;

  if (!result && !isQuickQueryBox) {
    return (
      <div className={`${cardBaseClasses} justify-center items-center`}>
        <p className={labelClasses}>{label}</p>
        <p className="text-gray-400 italic text-xs">Loading...</p>
      </div>
    );
  }

  if (result && result.displayType === 'scalar') {
    const dataString = String(result.data);
    const isError = dataString.startsWith('Error:') || dataString.startsWith('Python Error:') || dataString.startsWith('Server Error:');
    return (
      <div className={`${cardBaseClasses} justify-center items-center ${isError ? 'bg-red-50 border-red-200' : ''}`}>
        <p className={labelClasses}>{label}</p>
        <p className={`${scalarDataClasses} ${isError ? 'text-red-600 text-sm' : ''}`}>{dataString || 'N/A'}</p>
      </div>
    );
  }

  if (result && result.displayType === 'table' && result.data && result.data.headers && result.data.rows) {
    return (
      <div className="my-4 overflow-x-auto">
        <h3 className="text-md font-semibold text-gray-700 mb-2">{label || 'AI Response Table'}</h3>
        <table className="min-w-full divide-y divide-gray-300 shadow-md rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              {result.data.headers.map(header => (
                <th key={header} scope="col" className="px-4 py-2.5 text-left text-sm font-semibold text-gray-700">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {result.data.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="whitespace-nowrap px-4 py-2.5 text-sm text-gray-600">
                    {typeof cell === 'boolean' ? cell.toString() : String(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (result && result.displayType === 'chart' && result.data) {
    const chartData = {
      labels: result.data.labels || [],
      datasets: result.data.datasets || [],
    };
    const chartOptionsFromAI = result.data.options || {};
    const defaultChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: label || 'AI Generated Chart' }
        }
    };
    const chartOptions = { ...defaultChartOptions, ...chartOptionsFromAI, plugins: {...defaultChartOptions.plugins, ...chartOptionsFromAI.plugins}};

    let ChartComponent;
    switch (result.data.chartType?.toLowerCase()) {
      case 'bar': ChartComponent = Bar; break;
      case 'pie': ChartComponent = Pie; break;
      case 'line': ChartComponent = Line; break;
      case 'doughnut': ChartComponent = Doughnut; break;
      default: return <p className="text-red-500 p-4">Unsupported chart type: {result.data.chartType || 'Unknown'}</p>;
    }

    const chartContainerClasses = isQuickQueryBox ? "w-full h-32 md:h-40" : "my-4 p-4 bg-white rounded-xl shadow-lg";
    const chartTitleClasses = isQuickQueryBox ? "text-xs font-medium text-gray-600 mb-1" : "text-lg font-semibold text-gray-700 mb-3 text-center";

    return (
      <div className={chartContainerClasses}>
        {!isQuickQueryBox && <h3 className={chartTitleClasses}>{chartOptions.plugins?.title?.text || label || 'AI Generated Chart'}</h3>}
        <div style={{ position: 'relative', height: isQuickQueryBox ? '100%' : '400px', width: '100%' }}>
          <ChartComponent options={chartOptions} data={chartData} />
        </div>
      </div>
    );
  }

   if (isQuickQueryBox && !result) {
     return (
        <div className={`${cardBaseClasses} justify-center items-center`}>
            <p className={labelClasses}>{label}</p>
            <p className="text-gray-400 italic text-xl">-</p>
        </div>
     );
   }
  
  const isGenericError = result && result.data && typeof result.data === 'string' && (result.data.startsWith('Error:') || result.data.startsWith('Server Error:'));
  return (
    <div className={`${cardBaseClasses} justify-center items-center ${isGenericError ? 'bg-red-50 border-red-200' : ''}`}>
        <p className={labelClasses}>{label}</p>
        <p className={`text-xs ${isGenericError ? 'text-red-600' : 'text-gray-500'}`}>
            {result && result.data ? String(result.data) : 'Unsupported AI response or error.'}
        </p>
    </div>
  );
};


const LicenseCategoryReportsPage = ({ categoryId, onBack, onSelectEntity }) => {
  const [category, setCategory] = useState(null);
  const [entities, setEntities] = useState([]);
  const [supervisorNames, setSupervisorNames] = useState({});
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [error, setError] = useState(null); 

  const [baseMetrics, setBaseMetrics] = useState({
    totalActiveEntities: null,
    newLicensesLastYear: null,
    entitiesWithHighSeverityIncidents: null,
    entitiesWithOverdueSubmissions: null,
  });
  const [isLoadingBaseMetrics, setIsLoadingBaseMetrics] = useState(true);

  const [quickQueryInput, setQuickQueryInput] = useState('');
  const [quickQueryResult, setQuickQueryResult] = useState(null);
  const [isLoadingQuickQuery, setIsLoadingQuickQuery] = useState(false);
  const [quickQueryError, setQuickQueryError] = useState(null);

  const [naturalLanguageQuery, setNaturalLanguageQuery] = useState('');
  const [interactiveQueryResult, setInteractiveQueryResult] = useState(null);
  const [isQueryLoading, setIsQueryLoading] = useState(false); 
  const [queryError, setQueryError] = useState(null); 

  const API_BASE_URL = 'http://localhost:3001/api';

  // This function will now be used for ALL AI queries, including base metrics
  const fetchAIAnalytics = useCallback(async (queryText, isQuickNumQuery = false) => {
    let augmentedQueryText = queryText;
    // Augmentation for quick number queries was already present and is fine
    if (isQuickNumQuery && !queryText.toLowerCase().includes("chart")) {
        augmentedQueryText = `${queryText} (Provide a single numerical answer if possible, or a short text answer if a number is not applicable.)`;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: augmentedQueryText }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({})); // Catch if res.json() fails
        throw new Error(errData.error || errData.data || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.error(`Error fetching AI analytics for query "${queryText}":`, err);
      return { displayType: 'scalar', data: `Error: ${err.message.substring(0, 100)}...` };
    }
  }, []); // API_BASE_URL is stable, so empty dependency array is fine.

  // fetchPythonCalculatedMetric function is REMOVED

  const fetchPageData = useCallback(async () => {
    if (!categoryId) {
      setError("No category ID provided to load page data.");
      setIsLoadingPage(false);
      setIsLoadingBaseMetrics(false);
      setCategory(null);
      return;
    }
    setIsLoadingPage(true);
    setIsLoadingBaseMetrics(true);
    setError(null);
    setQueryError(null);
    setQuickQueryError(null);
    setInteractiveQueryResult(null);
    setQuickQueryResult(null);

    try {
      const catDetails = await getLicenseCategoryById(categoryId);
      setCategory(catDetails);

      if (catDetails) {
        const catEntities = await getEntitiesByLicenseCategory(categoryId);
        setEntities(catEntities || []);
        if (catEntities && catEntities.length > 0) {
          const staffIdsToFetch = new Set(catEntities.map(e => e.assignedOfficerId).filter(Boolean));
          const names = {};
          for (const staffId of staffIdsToFetch) {
            const staff = await getStaffById(staffId);
            if (staff) names[staffId] = staff.name;
          }
          setSupervisorNames(names);
        }

        // REVERTED: Construct natural language queries for base metrics
        // The AI will use the context "Assume today's date is June 4, 2025." from the backend prompt.
        const categoryNameForQuery = catDetails.name; // Use the fetched category name
        const queries = {
          totalActiveEntities: `For the "${categoryNameForQuery}" category, how many unique entities currently have an active license? Consider a license active if its issueDate is on or before June 4, 2025, its expiryDate is after June 4, 2025 (or not specified), and its licenseStatus is 'Active' (or null/empty, which should be treated as Active). Provide only the number.`,
          newLicensesLastYear: `How many new licenses were issued for the "${categoryNameForQuery}" category in the 12 months leading up to June 4, 2025? Provide only the number.`,
          entitiesWithHighSeverityIncidents: `For the "${categoryNameForQuery}" category, how many unique entities with currently active licenses have reported incidents with 'High' or 'Significant' severity in the 90 days leading up to June 4, 2025? Provide only the number.`,
          entitiesWithOverdueSubmissions: `For the "${categoryNameForQuery}" category, how many unique entities with currently active licenses have one or more submissions that are overdue as of June 4, 2025 (i.e., submissionDate is null/empty, dueDate is before June 4, 2025, and status is not 'Cancelled')? Provide only the number.`,
        };
        
        const results = await Promise.all([
          fetchAIAnalytics(queries.totalActiveEntities, true), // true for quick number
          fetchAIAnalytics(queries.newLicensesLastYear, true),
          fetchAIAnalytics(queries.entitiesWithHighSeverityIncidents, true),
          fetchAIAnalytics(queries.entitiesWithOverdueSubmissions, true),
        ]);
        
        setBaseMetrics({
          totalActiveEntities: results[0],
          newLicensesLastYear: results[1],
          entitiesWithHighSeverityIncidents: results[2],
          entitiesWithOverdueSubmissions: results[3],
        });
      } else {
        setError(`Could not find category details for ID: ${categoryId}`);
      }
    } catch (err) {
      console.error(`Error fetching data for category ${categoryId}:`, err);
      setError(`Failed to load page data: ${err.message}`);
      setCategory(null);
    } finally {
      setIsLoadingPage(false);
      setIsLoadingBaseMetrics(false);
    }
  }, [categoryId, fetchAIAnalytics]); // Dependency array reverted

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

  const handleInteractiveQuerySubmit = async (e) => {
    e.preventDefault();
    if (!naturalLanguageQuery.trim()) return;
    if (!category) {
        setQueryError("Category context is missing. Cannot submit query.");
        return;
    }
    setIsQueryLoading(true);
    setInteractiveQueryResult(null);
    setQueryError(null);
    try {
      let fullQuery = naturalLanguageQuery;
      if (category && !naturalLanguageQuery.toLowerCase().includes(category.name.toLowerCase()) && !naturalLanguageQuery.toLowerCase().includes("all categories")) {
        fullQuery = `${naturalLanguageQuery} (for the "${category.name}" category)`;
      }
      const result = await fetchAIAnalytics(fullQuery);
      setInteractiveQueryResult(result);
    } catch (err) {
      setQueryError(err.message || "Failed to fetch AI response.");
      setInteractiveQueryResult({ displayType: 'scalar', data: `Error: ${err.message}` });
    } finally {
      setIsQueryLoading(false);
    }
  };

  const handleQuickQuerySubmit = async (e) => {
    e.preventDefault();
    if (!quickQueryInput.trim()) return;
    if (!category) {
        setQuickQueryError("Category context is missing. Cannot submit quick query.");
        return;
    }
    setIsLoadingQuickQuery(true);
    setQuickQueryResult(null);
    setQuickQueryError(null);
    try {
      let fullQuery = quickQueryInput;
      if (category && !quickQueryInput.toLowerCase().includes(category.name.toLowerCase()) && !quickQueryInput.toLowerCase().includes("all categories")) {
        fullQuery = `${quickQueryInput} (specifically within the "${category.name}" category)`;
      }
      const result = await fetchAIAnalytics(fullQuery, true); 
      setQuickQueryResult(result);
    } catch (err) {
      setQuickQueryError(err.message || "Failed to fetch quick query response.");
      setQuickQueryResult({ displayType: 'scalar', data: `Error: ${err.message}`});
    } finally {
      setIsLoadingQuickQuery(false);
    }
  };

  if (!category) {
    // Loading and error states for category remain the same
    if (isLoadingPage) return <div className="p-6 text-center text-gray-600 text-lg">Loading category details...</div>;
    if (error) return <div className="p-6 text-center text-red-700 bg-red-100 rounded-md shadow"><p className="font-semibold mb-2">Error Loading Page:</p><p>{error}</p><button onClick={onBack} className="mt-4 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200">&larr; Back to Categories Dashboard</button></div>;
    return <div className="p-6 text-center text-gray-500">Category details not found or unavailable.<button onClick={onBack} className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:underline">&larr; Back to Categories Dashboard</button></div>;
  }

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="mb-4 px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-500 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        >
          &larr; Back to Categories Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-800">{category.name}</h1>
        <p className="text-gray-600 mt-1">{category.description}</p>
      </div>

      <div className="mb-8 p-6 bg-white rounded-xl shadow-lg">
        {/* Changed title back */}
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Category Snapshot (AI Generated)</h2>
        {isLoadingBaseMetrics ? (
          <p className="text-gray-500 italic">Loading key metrics...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <AIQueryResultDisplay result={baseMetrics.totalActiveEntities} label="Total Active Entities" />
            <AIQueryResultDisplay result={baseMetrics.newLicensesLastYear} label="New Licenses (Last Year)" />
            <AIQueryResultDisplay result={baseMetrics.entitiesWithHighSeverityIncidents} label="Entities w/ High Severity Incidents (90d)" />
            <AIQueryResultDisplay result={baseMetrics.entitiesWithOverdueSubmissions} label="Entities w/ Overdue Submissions" />
            
            <div className="p-3 bg-gray-50 rounded-md shadow flex flex-col justify-between min-h-[150px]">
              <form onSubmit={handleQuickQuerySubmit} className="flex flex-col h-full">
                <label htmlFor="quickQuery" className="text-sm font-medium text-gray-700 mb-1 text-center">Quick Query (AI)</label>
                <input
                  type="text"
                  id="quickQuery"
                  value={quickQueryInput}
                  onChange={(e) => setQuickQueryInput(e.target.value)}
                  placeholder="e.g., Incidents by type?"
                  className="w-full p-1.5 border border-gray-300 rounded-md shadow-sm text-xs mb-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={isLoadingQuickQuery}
                  className="w-full px-2 py-1 text-xs text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                >
                  {isLoadingQuickQuery ? 'Asking...' : 'Ask AI'}
                </button>
                <div className="mt-2 text-center flex-grow flex flex-col items-center justify-center min-h-[40px]">
                  {isLoadingQuickQuery && !quickQueryResult && <p className="text-gray-400 italic text-xs">...</p>}
                  {quickQueryError && <p className="text-red-500 text-xs p-1">{quickQueryError}</p>}
                  {quickQueryResult && (
                     <AIQueryResultDisplay result={quickQueryResult} label="" isQuickQueryBox={true} />
                  )}
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <div className="mb-8 p-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Ask the AI Agent (Detailed Queries & Charts)</h2>
        <form onSubmit={handleInteractiveQuerySubmit}>
          <textarea
            value={naturalLanguageQuery}
            onChange={(e) => setNaturalLanguageQuery(e.target.value)}
            placeholder={`Ask a detailed question or request a chart about the ${category.name} category... e.g., "Show me a bar chart of incidents by type" or "List entities with suspended licenses"`}
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            rows="3"
          />
          <button
            type="submit"
            disabled={isQueryLoading || !category}
            className="mt-3 px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:opacity-50"
          >
            {isQueryLoading ? 'Asking AI...' : 'Ask Question'}
          </button>
        </form>

        {isQueryLoading && interactiveQueryResult === null && <p className="mt-4 text-gray-500 italic">AI is thinking...</p>}
        {queryError && interactiveQueryResult === null && <p className="mt-4 text-red-600 bg-red-100 p-3 rounded-md">{queryError}</p>}
        {interactiveQueryResult && <AIQueryResultDisplay result={interactiveQueryResult} label="AI Response" />}
      </div>

      <div className="mb-8 p-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Relevant Compliance Report Types (Context)</h2>
        {category.relevantComplianceReportTypes && category.relevantComplianceReportTypes.length > 0 ? (
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            {category.relevantComplianceReportTypes.map(reportType => (
              <li key={reportType}>{reportType.replace(/_/g, ' ')}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">No specific compliance report types listed for this category.</p>
        )}
      </div>
      
      <div>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Licensed Entities in this Category (Context)</h2>
        {isLoadingPage ? <p>Loading entities...</p> : entities.length > 0 ? (
          <div className="bg-white shadow-xl rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Legal Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Primary Supervisor</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compliance Status</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">View Details</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {entities.map(entity => (
                  <EntityRow
                    key={entity.entityId}
                    entity={entity}
                    onEntitySelect={onSelectEntity}
                    supervisorName={supervisorNames[entity.assignedOfficerId]}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 italic bg-white p-6 rounded-lg shadow">No entities found for this license category.</p>
        )}
      </div>
    </div>
  );
};

export default LicenseCategoryReportsPage;