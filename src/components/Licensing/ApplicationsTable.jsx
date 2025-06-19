// src/components/Licensing/ApplicationsTable.js
import React, { useEffect, useState, useMemo } from 'react';
import { getAllApplications, getEntityById, getProductById } from './licensingService.js';

// Helper function to format date strings
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Component to display a status badge
const StatusBadge = ({ status }) => {
  let bgColorClass = 'bg-gray-200';
  let textColorClass = 'text-gray-700';
  switch (status) {
    case 'Approved': bgColorClass = 'bg-green-100'; textColorClass = 'text-green-700'; break;
    case 'Denied': bgColorClass = 'bg-red-100'; textColorClass = 'text-red-700'; break;
    case 'In Review': case 'Initial Review': case 'Detailed Review': case 'Awaiting Decision':
      bgColorClass = 'bg-yellow-100'; textColorClass = 'text-yellow-700'; break;
    case 'Submitted': bgColorClass = 'bg-blue-100'; textColorClass = 'text-blue-700'; break;
    default: break;
  }
  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${bgColorClass} ${textColorClass}`}>
      {status}
    </span>
  );
};

const ApplicationsTable = ({ 
  onRowClick, 
  statusFilter, 
  sourceFilter, 
  companyNameFilter,
  applicationIdFilter // For general search term if needed
}) => {
  const [rawApplications, setRawApplications] = useState([]); // Store applications before enrichment
  const [enrichedApplications, setEnrichedApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'submissionDate', direction: 'descending' });

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        const appsData = await getAllApplications();
        if (appsData) {
          setRawApplications(appsData);
        } else {
          setRawApplications([]);
          setError("Could not fetch applications.");
        }
      } catch (err) {
        console.error("Error fetching applications:", err);
        setError("Failed to load applications.");
        setRawApplications([]);
      }
    };
    fetchApplications();
  }, []);

  useEffect(() => {
    if (rawApplications.length === 0) {
      setEnrichedApplications([]);
      setIsLoading(false);
      return;
    }
    
    const enrichData = async () => {
      // No need to set isLoading to true here again if already loading from fetchApplications
      // or if rawApplications just updated. Let parent's loader handle initial, this is background.
      const enriched = await Promise.all(
        rawApplications.map(async (app) => {
          try {
            const entity = await getEntityById(app.entityId);
            const product = await getProductById(app.productId);
            return {
              ...app,
              companyName: entity ? entity.companyName : 'N/A',
              productName: product ? product.productName : 'N/A',
            };
          } catch (e) {
            console.error(`Error enriching application ${app.applicationId}:`, e);
            return { ...app, companyName: 'Error', productName: 'Error' };
          }
        })
      );
      setEnrichedApplications(enriched);
      setIsLoading(false); // Set loading false after enrichment
      setError(null);
    };

    enrichData();
  }, [rawApplications]);


  const sortedAndFilteredApplications = useMemo(() => {
    let filteredItems = [...enrichedApplications];

    // Apply filters received from props
    if (statusFilter) {
      filteredItems = filteredItems.filter(app => app.applicationStatus === statusFilter);
    }
    if (sourceFilter) {
      filteredItems = filteredItems.filter(app => app.source === sourceFilter);
    }
    if (companyNameFilter) {
      filteredItems = filteredItems.filter(app => 
        app.companyName?.toLowerCase().includes(companyNameFilter.toLowerCase())
      );
    }
    // Optional: For a general Application ID search bar if still desired from parent
    if (applicationIdFilter) {
        filteredItems = filteredItems.filter(app =>
            app.applicationId.toLowerCase().includes(applicationIdFilter.toLowerCase())
        );
    }


    // Sort items
    if (sortConfig.key !== null) {
      filteredItems.sort((a, b) => {
        // Handle cases where a[sortConfig.key] or b[sortConfig.key] might be null or undefined
        const valA = a[sortConfig.key] === null || typeof a[sortConfig.key] === 'undefined' ? '' : a[sortConfig.key];
        const valB = b[sortConfig.key] === null || typeof b[sortConfig.key] === 'undefined' ? '' : b[sortConfig.key];

        if (valA < valB) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return filteredItems;
  }, [enrichedApplications, statusFilter, sourceFilter, companyNameFilter, applicationIdFilter, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
    }
    return '';
  };
  
  // The main isLoading and error for the table will now primarily reflect the enrichment step
  // The initial fetch can be considered part of the overall dashboard loading.
  if (isLoading && enrichedApplications.length === 0 && rawApplications.length > 0) {
    return <div className="text-center p-4 text-gray-500">Enriching application data...</div>;
  }
  if (isLoading && rawApplications.length === 0) { // Still loading raw applications
     return <div className="text-center p-4 text-gray-500">Loading applications list...</div>;
  }


  if (error) { 
    return <div className="text-center p-4 text-red-600 bg-red-100 rounded-md">{error}</div>;
  }

  return (
    <div className="bg-white p-0 sm:p-6 rounded-xl shadow-lg">
      {/* Search input removed from here, will be in parent */}
      {enrichedApplications.length === 0 && !isLoading ? (
         <div className="text-center p-10 text-gray-500">No applications match the current filters.</div>
      ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                { label: 'Application No.', key: 'applicationId' },
                { label: 'Company Name', key: 'companyName' },
                { label: 'Product Name', key: 'productName' },
                { label: 'Submitted On', key: 'submissionDate' },
                { label: 'Status', key: 'applicationStatus' },
                { label: 'Applied From', key: 'source' },
              ].map(({ label, key }) => (
                <th
                  key={key}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort(key)}
                >
                  {label}
                  {getSortIndicator(key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedAndFilteredApplications.map((app) => (
              <tr key={app.applicationId} className="hover:bg-gray-50 cursor-pointer" onClick={() => onRowClick && onRowClick(app.applicationId)}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-800">
                  {app.applicationId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{app.companyName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{app.productName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(app.submissionDate)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <StatusBadge status={app.applicationStatus} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
};

export default ApplicationsTable;