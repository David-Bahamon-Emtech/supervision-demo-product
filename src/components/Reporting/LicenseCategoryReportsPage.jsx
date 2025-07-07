// src/components/Reporting/LicenseCategoryReportsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// --- MOCK SERVICE FUNCTIONS FOR NEW DASHBOARD ---
// In a real implementation, these functions would be in './reportingService.js'
import {
  getLicenseCategoryById,
  getEntitiesByLicenseCategoryWithHealth, // We'll need a new or modified service function
  getStaffById
} from './reportingService.js';

ChartJS.register(ArcElement, Tooltip, Legend, Title);


// --- Reusable Components for the New Page ---

const EntityRow = ({ entity, onEntitySelect, supervisorName }) => {
  // Determine color for the 'Current Standing' marker
  let statusColor = 'bg-gray-200 text-gray-800'; // Default for On-Time
  switch (entity.complianceStanding) {
    case 'Overdue':
      statusColor = 'bg-red-100 text-red-700';
      break;
    case 'Deficient':
      statusColor = 'bg-yellow-100 text-yellow-700';
      break;
    case 'On-Time':
      statusColor = 'bg-green-100 text-green-700';
      break;
    default:
        // Keep default
      break;
  }

  return (
    <tr
      onClick={() => onEntitySelect(entity.entityId)}
      className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
    >
      <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{entity.companyName}</td>
      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{supervisorName || 'N/A'}</td>
      <td className="px-6 py-3 whitespace-nowrap text-sm">
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusColor}`}>
          {entity.complianceStanding || 'Unknown'}
        </span>
      </td>
       <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{entity.riskRating || 'N/A'}</td>
      <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
        <span className="text-blue-600 hover:text-blue-800">
          View Submissions &rarr;
        </span>
      </td>
    </tr>
  );
};


const LicenseCategoryReportsPage = ({ categoryId, onBack, onSelectEntity }) => {
  const [category, setCategory] = useState(null);
  const [entities, setEntities] = useState([]);
  const [healthData, setHealthData] = useState(null);
  const [supervisorNames, setSupervisorNames] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPageData = useCallback(async () => {
    if (!categoryId) {
      setError("No category ID provided.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const catDetails = await getLicenseCategoryById(categoryId);
      if (!catDetails) {
        throw new Error(`Could not find category details for ID: ${categoryId}`);
      }
      setCategory(catDetails);

      const { entitiesWithHealth, healthStats } = await getEntitiesByLicenseCategoryWithHealth(categoryId);
      setEntities(entitiesWithHealth || []);
      setHealthData(healthStats);

      if (entitiesWithHealth && entitiesWithHealth.length > 0) {
        const staffIdsToFetch = new Set(entitiesWithHealth.map(e => e.assignedOfficerId).filter(Boolean));
        const names = {};
        for (const staffId of staffIdsToFetch) {
          const staff = await getStaffById(staffId);
          if (staff) names[staffId] = staff.name;
        }
        setSupervisorNames(names);
      }
    } catch (err) {
      console.error(`Error fetching data for category ${categoryId}:`, err);
      setError(`Failed to load category data: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);


  // Chart data and options
  const doughnutData = {
    labels: ['Compliant / Low Risk', 'Medium Risk', 'High Risk'],
    datasets: [
      {
        label: '# of Entities',
        data: [
          healthData?.lowRisk || 0,
          healthData?.mediumRisk || 0,
          healthData?.highRisk || 0,
        ],
        backgroundColor: [
          'rgba(52, 211, 153, 0.7)', // Green
          'rgba(251, 191, 36, 0.7)', // Yellow
          'rgba(239, 68, 68, 0.7)',   // Red
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(220, 38, 38, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Compliance Risk Distribution',
        font: {
            size: 16
        }
      },
    },
  };


  if (isLoading) {
    return <div className="p-6 text-center text-gray-600 text-lg">Loading category details...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-700 bg-red-100 rounded-md shadow"><p>{error}</p></div>;
  }

  if (!category) {
    return <div className="p-6 text-center text-gray-500">Category details not found.</div>;
  }


  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="mb-4 px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-500 rounded-md hover:bg-blue-50"
        >
          &larr; Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-800">{category.name}</h1>
        <p className="text-gray-600 mt-1">{category.description}</p>
      </div>

       {/* Compliance Health Dashboard */}
      <div className="mb-8 p-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Compliance Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
                <div className="h-64 relative">
                    {healthData ? <Doughnut data={doughnutData} options={doughnutOptions} /> : <p>Loading chart...</p>}
                </div>
            </div>
            <div className="md:col-span-2 grid grid-cols-2 gap-5 content-center">
                 <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-4xl font-bold text-gray-800">{healthData?.totalEntities || 0}</p>
                    <p className="text-sm font-medium text-gray-500">Total Licensed Entities</p>
                </div>
                 <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-4xl font-bold text-red-600">{healthData?.overdueSubmissions || 0}</p>
                    <p className="text-sm font-medium text-gray-500">With Overdue Submissions</p>
                </div>
                 <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-4xl font-bold text-yellow-600">{healthData?.deficientSubmissions || 0}</p>
                    <p className="text-sm font-medium text-gray-500">With Deficient Submissions</p>
                </div>
                 <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-4xl font-bold text-green-600">{healthData?.fullyCompliant || 0}</p>
                    <p className="text-sm font-medium text-gray-500">Fully Compliant</p>
                </div>
            </div>
        </div>
      </div>

      {/* Licensed Entities List */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Licensed Entities</h2>
        {isLoading ? <p>Loading entities...</p> : entities.length > 0 ? (
          <div className="bg-white shadow-xl rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Primary Supervisor</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Standing</th>
                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Rating</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">View Submissions</span></th>
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