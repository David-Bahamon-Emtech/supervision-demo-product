// src/components/RegulatoryUpdates/RegulatoryUpdateDetailPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { getFullUpdateDetails } from './regulatoryUpdatesService.js';
import RegulatoryUpdateEditor from './RegulatoryUpdateEditor.jsx'; // Import the editor

// Reusable Minor Components
const InfoRow = ({ label, value, children }) => (
  <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
      {children || value || 'N/A'}
    </dd>
  </div>
);

const FileLink = ({ document }) => {
  if (!document) return <div className="text-sm text-gray-500 italic">No document attached.</div>;
  return (
    <a
      href={document.dummyFileContentLink || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center"
      title={document.fileName}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
      {document.fileName} ({document.documentType})
    </a>
  );
};

const StatusBadge = ({ status }) => {
  let bgColorClass = 'bg-gray-100';
  let textColorClass = 'text-gray-700';
  switch (status) {
    case 'Published': bgColorClass = 'bg-green-100'; textColorClass = 'text-green-800'; break;
    case 'Draft': bgColorClass = 'bg-yellow-100'; textColorClass = 'text-yellow-800'; break;
    case 'Archived': case 'Superseded': bgColorClass = 'bg-gray-200'; textColorClass = 'text-gray-600'; break;
    default: break;
  }
  return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${bgColorClass} ${textColorClass}`}>{status}</span>;
};


const RegulatoryUpdateDetailPage = ({ updateId, onBack }) => {
  const [update, setUpdate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!updateId) {
      setError("No Update ID provided.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await getFullUpdateDetails(updateId);
      if (!data) {
        setError(`Regulatory update with ID ${updateId} not found.`);
      }
      setUpdate(data);
    } catch (err) {
      setError("Failed to load update details.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [updateId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenEditor = () => {
    setIsEditorModalOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorModalOpen(false);
  };
  
  const handleSaveSuccess = () => {
      setIsEditorModalOpen(false);
      fetchData(); // Refresh the details page with the new data
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (isLoading) {
    return <div className="p-6 text-center text-gray-600 text-lg">Loading update details...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-700 bg-red-100 rounded-md shadow">{error}</div>;
  }

  if (!update) {
    return <div className="p-6 text-center text-gray-500">No data found for this update.</div>;
  }

  const canEdit = update.status === 'Draft' || update.status === 'Published'; // Example logic

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <button onClick={onBack} className="mb-4 text-sm text-blue-600 hover:text-blue-800 focus:outline-none">
          &larr; Back to All Updates
        </button>
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">{update.title}</h1>
                <p className="text-gray-600 mt-1">Details for update: {update.updateId}</p>
            </div>
            <button 
                onClick={handleOpenEditor}
                disabled={!canEdit}
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Edit Update
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Full Document Content</h3>
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-gray-800">
                {update.textContent || "No full text content available for this update."}
              </pre>
            </div>
        </div>
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Details</h3>
                <dl className="divide-y divide-gray-200">
                    <InfoRow label="Status"><StatusBadge status={update.status} /></InfoRow>
                    <InfoRow label="Update Type" value={update.type} />
                    <InfoRow label="Summary" value={update.summary} />
                    <InfoRow label="Issue Date" value={formatDate(update.issueDate)} />
                    <InfoRow label="Effective Date" value={formatDate(update.effectiveDate)} />
                    <InfoRow label="Created By" value={update.creatorDetails?.name || update.createdByStaffId} />
                    <InfoRow label="Official Document">
                        <FileLink document={update.documentDetails} />
                    </InfoRow>
                    <InfoRow label="Applicable License Categories">
                        {update.categoryDetails && update.categoryDetails.length > 0 ? (
                            <ul className="list-disc list-inside space-y-1">
                                {update.categoryDetails.map(cat => <li key={cat.id}>{cat.name}</li>)}
                            </ul>
                        ) : 'None specified.'}
                    </InfoRow>
                </dl>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Prompt Used</h3>
                <p className="text-sm text-gray-600 italic whitespace-pre-wrap">
                    {update.promptUsed || "No prompt was recorded for this update."}
                </p>
            </div>
        </div>
      </div>

        {isEditorModalOpen && (
            <RegulatoryUpdateEditor
                update={update}
                onClose={handleCloseEditor}
                onSave={handleSaveSuccess}
            />
        )}
    </div>
  );
};

export default RegulatoryUpdateDetailPage;