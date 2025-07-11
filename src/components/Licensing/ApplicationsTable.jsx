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
  let textColorClass = 'text-gray-800';
  switch (status) {
    case 'Approved': bgColorClass = 'bg-green-100'; textColorClass = 'text-green-800'; break;
    case 'Denied': bgColorClass = 'bg-red-100'; textColorClass = 'text-red-800'; break;
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
  applicationIdFilter
}) => {
  const [rawApplications, setRawApplications] = useState([]);
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
      setIsLoading(false);
      setError(null);
    };

    enrichData();
  }, [rawApplications]);


  const sortedAndFilteredApplications = useMemo(() => {
    let filteredItems = [...enrichedApplications];

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
    if (applicationIdFilter) {
        filteredItems = filteredItems.filter(app =>
            app.applicationId.toLowerCase().includes(applicationIdFilter.toLowerCase())
        );
    }

    if (sortConfig.key !== null) {
      filteredItems.sort((a, b) => {
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

  if (isLoading && enrichedApplications.length === 0) {
    return <div className="text-center p-4 text-theme-text-secondary">Loading & Enriching application data...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500 bg-red-100 rounded-md">{error}</div>;
  }

  return (
    <div className="bg-theme-bg-secondary p-0 sm:p-6 rounded-xl shadow-lg">
      {sortedAndFilteredApplications.length === 0 && !isLoading ? (
         <div className="text-center p-10 text-theme-text-secondary">No applications match the current filters.</div>
      ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-theme-border">
          <thead className="bg-black bg-opacity-20">
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
                  className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider cursor-pointer hover:bg-black hover:bg-opacity-20"
                  onClick={() => requestSort(key)}
                >
                  {label}
                  {getSortIndicator(key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-theme-bg-secondary divide-y divide-theme-border">
            {sortedAndFilteredApplications.map((app) => (
              <tr key={app.applicationId} className="hover:bg-theme-bg cursor-pointer" onClick={() => onRowClick && onRowClick(app.applicationId)}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-theme-accent hover:text-white">
                  {app.applicationId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-text-primary">{app.companyName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary">{app.productName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary">{formatDate(app.submissionDate)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <StatusBadge status={app.applicationStatus} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary">{app.source}</td>
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