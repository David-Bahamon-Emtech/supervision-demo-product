// src/components/Reporting/LicenseCategoryReportsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { getChartColors } from '../../utils/chartColors.js';

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
  let statusColor = 'bg-theme-bg-secondary text-theme-text-secondary border border-theme-border'; // Default
  switch (entity.complianceStanding) {
    case 'Overdue':
      statusColor = 'bg-theme-error-bg text-theme-error-text border border-theme-error-border';
      break;
    case 'Deficient':
      statusColor = 'bg-theme-warning-bg text-theme-warning-text border border-theme-warning-border';
      break;
    case 'On-Time':
      statusColor = 'bg-theme-success-bg text-theme-success-text border border-theme-success-border';
      break;
    default:
        // Keep default
      break;
  }

  return (
    <tr
      onClick={() => onEntitySelect(entity.entityId)}
      className="hover:bg-theme-bg cursor-pointer transition-colors duration-150"
    >
      <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-theme-text-primary">{entity.companyName}</td>
      <td className="px-6 py-3 whitespace-nowrap text-sm text-theme-text-secondary">{supervisorName || 'N/A'}</td>
      <td className="px-6 py-3 whitespace-nowrap text-sm">
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusColor}`}>
          {entity.complianceStanding || 'Unknown'}
        </span>
      </td>
       <td className="px-6 py-3 whitespace-nowrap text-sm text-theme-text-secondary">{entity.riskRating || 'N/A'}</td>
      <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
        <span className="text-blue-400 hover:text-theme-accent">
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
          getChartColors().colors[3], // Green for low risk
          getChartColors().colors[2], // Yellow/amber for medium risk
          getChartColors().colors[0], // Red for high risk
        ],
        borderColor: [
          getChartColors().colors[3].replace('0.8', '1'), // Solid green
          getChartColors().colors[2].replace('0.8', '1'), // Solid yellow
          getChartColors().colors[0].replace('0.8', '1'), // Solid red
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
        labels: {
            color: getChartColors().textColor
        }
      },
      title: {
        display: true,
        text: 'Compliance Risk Distribution',
        font: {
            size: 16
        },
        color: getChartColors().titleColor
      },
    },
  };


  if (isLoading) {
    return <div className="p-6 text-center text-theme-text-secondary text-lg">Loading category details...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-400 bg-red-900 bg-opacity-30 rounded-md shadow"><p>{error}</p></div>;
  }

  if (!category) {
    return <div className="p-6 text-center text-theme-text-secondary">Category details not found.</div>;
  }


  return (
    <div className="p-4 md:p-6 min-h-screen">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="mb-4 text-sm text-blue-400 hover:text-theme-accent"
        >
          &larr; Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-theme-text-primary">{category.name}</h1>
        <p className="text-theme-text-secondary mt-1">{category.description}</p>
      </div>

       {/* Compliance Health Dashboard */}
      <div className="mb-8 p-6 bg-theme-bg-secondary rounded-xl shadow-lg border border-theme-border">
        <h2 className="text-2xl font-semibold text-theme-text-primary mb-4">Compliance Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
                <div className="h-64 relative">
                    {healthData ? <Doughnut data={doughnutData} options={doughnutOptions} /> : <p>Loading chart...</p>}
                </div>
            </div>
            <div className="md:col-span-2 grid grid-cols-2 gap-5 content-center">
                 <div className="bg-theme-bg p-4 rounded-lg text-center border border-theme-border">
                    <p className="text-4xl font-bold text-theme-text-primary">{healthData?.totalEntities || 0}</p>
                    <p className="text-sm font-medium text-theme-text-secondary">Total Licensed Entities</p>
                </div>
                 <div className="bg-theme-bg p-4 rounded-lg text-center border border-theme-border">
                    <p className="text-4xl font-bold text-red-400">{healthData?.overdueSubmissions || 0}</p>
                    <p className="text-sm font-medium text-theme-text-secondary">With Overdue Submissions</p>
                </div>
                 <div className="bg-theme-bg p-4 rounded-lg text-center border border-theme-border">
                    <p className="text-4xl font-bold text-yellow-400">{healthData?.deficientSubmissions || 0}</p>
                    <p className="text-sm font-medium text-theme-text-secondary">With Deficient Submissions</p>
                </div>
                 <div className="bg-theme-bg p-4 rounded-lg text-center border border-theme-border">
                    <p className="text-4xl font-bold text-green-400">{healthData?.fullyCompliant || 0}</p>
                    <p className="text-sm font-medium text-theme-text-secondary">Fully Compliant</p>
                </div>
            </div>
        </div>
      </div>

      {/* Licensed Entities List */}
      <div>
        <h2 className="text-2xl font-semibold text-theme-text-primary mb-4">Licensed Entities</h2>
        {isLoading ? <p>Loading entities...</p> : entities.length > 0 ? (
          <div className="bg-theme-bg-secondary shadow-xl rounded-lg overflow-x-auto border border-theme-border">
            <table className="min-w-full divide-y divide-theme-border">
              <thead className="bg-black bg-opacity-20">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Company Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Primary Supervisor</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Current Standing</th>
                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Risk Rating</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">View Submissions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border">
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
          <p className="text-theme-text-secondary italic bg-theme-bg-secondary p-6 rounded-lg shadow">No entities found for this license category.</p>
        )}
      </div>
    </div>
  );
};

export default LicenseCategoryReportsPage;