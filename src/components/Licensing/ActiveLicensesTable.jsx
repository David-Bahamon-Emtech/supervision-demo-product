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
  let bgColorClass = 'bg-gray-200';
  let textColorClass = 'text-gray-800';
  let effectiveStatus = status;

  const today = new Date("2025-07-10");
  const daysUntilExpiry = calculateDaysDifference(expiryDate, today.toISOString().split('T')[0]);

  if (status === "Active") {
    if (renewalStatus && renewalStatus !== "Not Started" && renewalStatus !== "Renewal Approved" && renewalStatus !== "Renewal Denied") {
      effectiveStatus = `Renewal: ${renewalStatus}`;
      bgColorClass = 'bg-blue-200';
      textColorClass = 'text-blue-800';
    } else if (daysUntilExpiry !== null && daysUntilExpiry <= 60 && daysUntilExpiry > 0) {
      effectiveStatus = `Expires in ${daysUntilExpiry}d`;
      bgColorClass = 'bg-yellow-200';
      textColorClass = 'text-yellow-800';
    } else {
      effectiveStatus = "Active";
      bgColorClass = 'bg-green-200';
      textColorClass = 'text-green-800';
    }
  } else if (status === "Pending Renewal") {
    effectiveStatus = 'Pending';
    bgColorClass = 'bg-indigo-200';
    textColorClass = 'text-indigo-800';
  } else {
    switch (status) {
      case 'Expired':
        bgColorClass = 'bg-red-200'; textColorClass = 'text-red-800'; break;
      case 'Suspended':
        bgColorClass = 'bg-orange-200'; textColorClass = 'text-orange-800'; break;
      case 'Revoked':
        bgColorClass = 'bg-purple-200'; textColorClass = 'text-purple-800'; break;
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
const IconManageRenewal = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>;
const IconSuspend = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>;
const IconLiftSuspension = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" /></svg>;
const IconRevoke = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09 1.02-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>;


// --- ActionButton Component ---
const ActionButton = ({ icon, label, onClick, disabled, activeColorClass = "text-theme-text-secondary" }) => (
  <div className="relative flex items-center group">
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={label}
      className={`p-1.5 rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-bg-secondary focus:ring-theme-accent
        ${disabled ? 'text-gray-600 cursor-not-allowed' : `${activeColorClass} hover:text-theme-accent hover:bg-black hover:bg-opacity-20`
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
    return <div className="text-center p-4 text-theme-text-secondary">Loading active licenses...</div>;
  }
  if (error) {
    return <div className="text-center p-4 text-red-500 bg-red-100 rounded-md">{error}</div>;
  }

  return (
    <div className="bg-theme-bg-secondary p-0 sm:p-6 rounded-xl shadow-lg mt-8">
      <h2 className="text-xl font-semibold text-theme-text-primary mb-4 px-6 sm:px-0">Active & Expiring Licenses</h2>
      {licenses.length === 0 && !isLoading ? (
         <div className="text-center p-10 text-theme-text-secondary">No licenses found.</div>
      ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-theme-border">
          <thead className="bg-black bg-opacity-20">
            <tr>
              {[
                { label: 'License No.', key: 'licenseNumber' },
                { label: 'Company Name', key: 'companyName' },
                { label: 'Type', key: 'licenseType' },
                { label: 'Issue Date', key: 'issueDate' },
                { label: 'Expiry Date', key: 'expiryDate' },
                { label: 'Renewal Due', key: 'nextRenewalDueDate' },
                { label: 'Status', key: 'licenseStatus' },
                { label: 'Actions', key: null, thClassName: 'text-center' },
              ].map(({ label, key, thClassName }) => (
                <th
                  key={key || label}
                  scope="col"
                  className={`px-4 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider ${thClassName || ''}`}
                  onClick={() => key && requestSort(key)}
                  style={{ cursor: key ? 'pointer' : 'default' }}
                >
                  {label}
                  {key && getSortIndicator(key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-theme-border">
            {sortedLicenses.map((lic) => {
              const isManageRenewalAvailable = (lic.licenseStatus === "Active" || lic.licenseStatus === "Pending Renewal");
              const isSuspendAvailable = lic.licenseStatus === "Active";
              const isLiftSuspensionAvailable = lic.licenseStatus === "Suspended";
              const isRevokeAvailable = (lic.licenseStatus === "Active" || lic.licenseStatus === "Suspended");

              return (
                <tr key={lic.licenseId} className="hover:bg-theme-bg">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-theme-accent">{lic.licenseNumber}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-theme-text-primary">{lic.companyName}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-theme-text-secondary">{formatLicenseType(lic.licenseType)}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-theme-text-secondary">{formatDate(lic.issueDate)}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-theme-text-secondary">{formatDate(lic.expiryDate)}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-theme-text-secondary">
                      {formatDate(lic.nextRenewalDueDate) || 'N/A'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <LicenseStatusBadge status={lic.licenseStatus} renewalStatus={lic.renewalStatus} expiryDate={lic.expiryDate} />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center justify-center space-x-1">
                        {isManageRenewalAvailable && (
                            <ActionButton
                                icon={<IconManageRenewal />}
                                label="Manage Renewal"
                                onClick={() => onManageRenewalClick(lic.licenseId)}
                                activeColorClass="text-blue-400"
                            />
                        )}
                        {isSuspendAvailable && (
                            <ActionButton
                                icon={<IconSuspend />}
                                label="Suspend License"
                                onClick={() => onManageLicenseAction(lic.licenseId, 'Suspend License')}
                                activeColorClass="text-orange-400"
                            />
                        )}
                        {isLiftSuspensionAvailable && (
                            <ActionButton
                                icon={<IconLiftSuspension />}
                                label="Lift Suspension"
                                onClick={() => onManageLicenseAction(lic.licenseId, 'Lift Suspension')}
                                activeColorClass="text-green-400"
                            />
                        )}
                        {isRevokeAvailable && (
                            <ActionButton
                                icon={<IconRevoke />}
                                label="Revoke License"
                                onClick={() => onManageLicenseAction(lic.licenseId, 'Revoke License')}
                                activeColorClass="text-red-500"
                            />
                        )}
                        {!isManageRenewalAvailable && !isSuspendAvailable && !isLiftSuspensionAvailable && !isRevokeAvailable && (
                            <span className="text-xs text-gray-600 italic">No actions</span>
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