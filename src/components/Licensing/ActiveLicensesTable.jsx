// src/components/Licensing/ActiveLicensesTable.js
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { getAllLicenses, getEntityById, getProductById } from './licensingService.js';

// Helper function to format date strings
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  return date.toLocaleDateString(undefined, options);
};

const formatLicenseType = (licenseTypeString) => {
    if (!licenseTypeString) return 'N/A';
    return licenseTypeString.replace(/ License$/i, '').trim();
};

const calculateDaysDifference = (dateString1, dateString2) => {
    if (!dateString1 || !dateString2) return null;
    const date1 = new Date(dateString1);
    const date2 = new Date(dateString2);
    if (isNaN(date1.getTime()) || isNaN(date2.getTime())) return null;
    const diffTime = date1.getTime() - date2.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

const LicenseStatusBadge = ({ status, renewalStatus, expiryDate }) => {
  let bgColorClass = 'bg-gray-100';
  let textColorClass = 'text-gray-700';
  let effectiveStatus = status;

  const today = new Date("2025-05-15");
  const daysUntilExpiry = calculateDaysDifference(expiryDate, today.toISOString().split('T')[0]);

  if (status === "Active") {
    if (renewalStatus === "Pending Submission") {
      effectiveStatus = "Renew-Sub";
      bgColorClass = 'bg-blue-100';
      textColorClass = 'text-blue-700';
    } else if (renewalStatus && renewalStatus !== "Not Started" && renewalStatus !== "Renewal Approved" && renewalStatus !== "Renewal Denied") {
      effectiveStatus = `Renewal: ${renewalStatus}`;
      bgColorClass = 'bg-blue-100';
      textColorClass = 'text-blue-700';
    } else if (daysUntilExpiry !== null && daysUntilExpiry <= 60 && daysUntilExpiry > 0) {
      effectiveStatus = `Active (Expires Soon: ${daysUntilExpiry}d)`;
      bgColorClass = 'bg-yellow-100';
      textColorClass = 'text-yellow-700';
    } else {
      effectiveStatus = "Active";
      bgColorClass = 'bg-green-100';
      textColorClass = 'text-green-700';
    }
  } else if (status === "Pending Renewal") {
    effectiveStatus = 'Pending';
    bgColorClass = 'bg-indigo-100';
    textColorClass = 'text-indigo-700';
  } else {
    switch (status) {
      case 'Expired':
        bgColorClass = 'bg-red-100'; textColorClass = 'text-red-700'; break;
      case 'Suspended':
        bgColorClass = 'bg-orange-100'; textColorClass = 'text-orange-700'; break;
      case 'Revoked':
        bgColorClass = 'bg-purple-100'; textColorClass = 'text-purple-700'; break;
      default:
        break;
    }
  }

  return (
    <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${bgColorClass} ${textColorClass} whitespace-nowrap`}>
      {effectiveStatus}
    </span>
  );
};

// --- SVG Icon Components ---
const IconManageRenewal = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

const IconSuspend = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636M12 12H9.75M12 12V9.75m0 2.25L14.25 12M12 12V14.25m0-2.25L9.75 12M14.25 12L12 14.25" />
     {/* A more common ban icon: <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />*/}
     {/* Pause icon: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />*/}
  </svg>
);

const IconLiftSuspension = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
    {/* Play icon: <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /> */}
  </svg>
);

const IconRevoke = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09 1.02-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    {/* Gavel icon: <path strokeLinecap="round" strokeLinejoin="round" d="M11.412 15.655L9.75 21.75l3.745-4.012M9.255 9.755L15.345 3.66m0 0L21.75 9.75M15.345 3.66l-6.09 6.09m6.09-6.09L9.255 9.755m0 0l3.273 3.273c.26.26.26.681 0 .941L10.5 16.5M9.255 9.755L10.5 11.25" /> */}
  </svg>
);


// --- ActionButton Component ---
const ActionButton = ({ icon, label, onClick, disabled, activeColorClass = "text-gray-700", disabledColorClass = "text-gray-300", hoverColorClass = "text-blue-600" }) => (
  <div className="relative flex items-center group">
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={label}
      className={`p-1.5 rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400
        ${disabled ? `${disabledColorClass} cursor-not-allowed` : `${activeColorClass} hover:${hoverColorClass} hover:bg-gray-100`
      }`}
    >
      {icon}
    </button>
    <div
      className="absolute bottom-full left-1/2 z-20 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded-md shadow-sm 
                 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap
                 transform -translate-x-1/2"
    >
      {label}
    </div>
  </div>
);


const ActiveLicensesTable = ({ onManageRenewalClick, onManageLicenseAction }) => {
  const [licenses, setLicenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'nextRenewalDueDate', direction: 'ascending' });

  const fetchLicensesData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const licensesDataResult = await getAllLicenses();
      if (licensesDataResult) {
        const enrichedLicenses = await Promise.all(
          licensesDataResult.map(async (lic) => {
            const entity = await getEntityById(lic.entityId);
            const product = await getProductById(lic.productId);
            return {
              ...lic,
              companyName: entity ? entity.companyName : 'N/A',
              productName: product ? product.productName : 'N/A',
            };
          })
        );
        setLicenses(enrichedLicenses);
      } else {
        setLicenses([]);
        setError("Could not fetch licenses.");
      }
    } catch (err) {
      console.error("Error fetching licenses:", err);
      setError("Failed to load licenses.");
      setLicenses([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLicensesData();
  }, [fetchLicensesData]);

  const sortedLicenses = useMemo(() => {
    let sortableItems = [...licenses];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        if (sortConfig.key === 'expiryDate' || sortConfig.key === 'nextRenewalDueDate' || sortConfig.key === 'issueDate') {
          valA = valA ? new Date(valA).getTime() : (sortConfig.direction === 'ascending' ? Infinity : -Infinity);
          valB = valB ? new Date(valB).getTime() : (sortConfig.direction === 'ascending' ? Infinity : -Infinity);
        } else {
          valA = valA === null || typeof valA === 'undefined' ? '' : String(valA).toLowerCase();
          valB = valB === null || typeof valB === 'undefined' ? '' : String(valB).toLowerCase();
        }
        if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [licenses, sortConfig]);

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

  if (isLoading) {
    return <div className="text-center p-4 text-gray-500">Loading active licenses...</div>;
  }
  if (error) {
    return <div className="text-center p-4 text-red-600 bg-red-100 rounded-md">{error}</div>;
  }

  return (
    <div className="bg-white p-0 sm:p-6 rounded-xl shadow-lg mt-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 px-6 sm:px-0">Active & Expiring Licenses</h2>
      {licenses.length === 0 && !isLoading ? (
         <div className="text-center p-10 text-gray-500">No licenses found.</div>
      ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                { label: 'License No.', key: 'licenseNumber' },
                { label: 'Company Name', key: 'companyName' },
                { label: 'Type', key: 'licenseType' },
                { label: 'Issue Date', key: 'issueDate' },
                { label: 'Expiry Date', key: 'expiryDate' },
                { label: 'Renewal Due', key: 'nextRenewalDueDate' },
                { label: 'Status', key: 'licenseStatus' },
                { label: 'Actions', key: null, thClassName: 'text-center' }, // Centered actions header
              ].map(({ label, key, thClassName }) => (
                <th
                  key={key || label}
                  scope="col"
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${thClassName || ''}`}
                  onClick={() => key && requestSort(key)}
                  style={{ cursor: key ? 'pointer' : 'default' }}
                >
                  {label}
                  {key && getSortIndicator(key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedLicenses.map((lic) => {
              const isManageRenewalAvailable = (lic.licenseStatus === "Active" || lic.licenseStatus === "Pending Renewal");
              const isSuspendAvailable = lic.licenseStatus === "Active";
              const isLiftSuspensionAvailable = lic.licenseStatus === "Suspended";
              const isRevokeAvailable = (lic.licenseStatus === "Active" || lic.licenseStatus === "Suspended");

              return (
                <tr key={lic.licenseId} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{lic.licenseNumber}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{lic.companyName}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{formatLicenseType(lic.licenseType)}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(lic.issueDate)}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(lic.expiryDate)}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(lic.nextRenewalDueDate) || 'N/A'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <LicenseStatusBadge status={lic.licenseStatus} renewalStatus={lic.renewalStatus} expiryDate={lic.expiryDate} />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center justify-center space-x-1"> {/* Centered actions */}
                        {isManageRenewalAvailable && (
                            <ActionButton
                                icon={<IconManageRenewal />}
                                label="Manage Renewal"
                                onClick={() => onManageRenewalClick(lic.licenseId)}
                                activeColorClass="text-blue-600"
                                hoverColorClass="text-blue-800"
                            />
                        )}
                        {isSuspendAvailable && (
                            <ActionButton
                                icon={<IconSuspend />}
                                label="Suspend License"
                                onClick={() => onManageLicenseAction(lic.licenseId, 'Suspend License')}
                                activeColorClass="text-orange-500"
                                hoverColorClass="text-orange-700"
                            />
                        )}
                        {isLiftSuspensionAvailable && (
                            <ActionButton
                                icon={<IconLiftSuspension />}
                                label="Lift Suspension"
                                onClick={() => onManageLicenseAction(lic.licenseId, 'Lift Suspension')}
                                activeColorClass="text-green-500"
                                hoverColorClass="text-green-700"
                            />
                        )}
                        {isRevokeAvailable && (
                            <ActionButton
                                icon={<IconRevoke />}
                                label="Revoke License"
                                onClick={() => onManageLicenseAction(lic.licenseId, 'Revoke License')}
                                activeColorClass="text-red-600"
                                hoverColorClass="text-red-800"
                            />
                        )}
                        {!isManageRenewalAvailable && !isSuspendAvailable && !isLiftSuspensionAvailable && !isRevokeAvailable && (
                            <span className="text-xs text-gray-400 italic">No actions</span>
                        )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
};

export default ActiveLicensesTable;