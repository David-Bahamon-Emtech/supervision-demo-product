// src/components/RegulatoryUpdates/RegulatoryUpdateDetailPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { getFullContentDetails } from './regulatoryUpdatesService.js';
import RegulatoryUpdateEditor from './RegulatoryUpdateEditor.jsx';
import { getEntitiesByLicenseCategory } from '../Reporting/reportingService.js'; // To get entities

// Reusable Minor Components
const InfoRow = ({ label, value, children, className = "" }) => (
  <div className={`py-2 sm:grid sm:grid-cols-3 sm:gap-4 ${className}`}>
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


const RegulatoryUpdateDetailPage = ({ updateId: contentId, onBack }) => {
  const [content, setContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [applicableEntities, setApplicableEntities] = useState([]);

  const fetchAndSetApplicableEntities = useCallback(async (categories) => {
    if (!categories || categories.length === 0) {
        setApplicableEntities([]);
        return;
    }
    // Fetch entities for each applicable category and flatten the array
    const entityArrays = await Promise.all(
        categories.map(cat => getEntitiesByLicenseCategory(cat.id))
    );
    // Create a Set to store unique entities by their ID
    const uniqueEntities = new Map();
    entityArrays.flat().forEach(entity => {
        if (!uniqueEntities.has(entity.entityId)) {
            uniqueEntities.set(entity.entityId, entity);
        }
    });
    setApplicableEntities(Array.from(uniqueEntities.values()));
  }, []);

  const fetchData = useCallback(async () => {
    if (!contentId) {
      setError("No Content ID provided.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await getFullContentDetails(contentId);
      if (!data) {
        setError(`Content with ID ${contentId} not found.`);
      } else {
        setContent(data);
        if (data.contentType === 'Update' && data.categoryDetails) {
            fetchAndSetApplicableEntities(data.categoryDetails);
        }
      }
    } catch (err) {
      setError("Failed to load content details.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [contentId, fetchAndSetApplicableEntities]);

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
      fetchData(); 
  };
  
  const handleAcknowledge = (entityId) => {
      setContent(prevContent => {
          const newAcks = [...(prevContent.acknowledgments || [])];
          const existingAckIndex = newAcks.findIndex(ack => ack.entityId === entityId);
          if (existingAckIndex === -1) {
              newAcks.push({ entityId: entityId, acknowledgedAt: new Date().toISOString() });
          }
          return { ...prevContent, acknowledgments: newAcks };
      });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return <div className="p-6 text-center text-gray-600 text-lg">Loading details...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-700 bg-red-100 rounded-md shadow">{error}</div>;
  }

  if (!content) {
    return <div className="p-6 text-center text-gray-500">No data found for this item.</div>;
  }

  const canEdit = content.status === 'Draft' || content.status === 'Published';
  const isPublication = content.contentType === 'Publication';

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <button onClick={onBack} className="mb-4 text-sm text-blue-600 hover:text-blue-800 focus:outline-none">
          &larr; Back to All Content
        </button>
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">{content.title}</h1>
                <p className="text-gray-600 mt-1">Details for {content.contentType} ID: {content.id}</p>
            </div>
            <button 
                onClick={handleOpenEditor}
                disabled={!canEdit}
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Edit Content
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Full Document Content</h3>
                <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-gray-800">
                    {content.textContent || "No full text content available for this item."}
                </pre>
                </div>
            </div>

            {!isPublication && (
                 <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Acknowledgment Status</h3>
                     <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Entity Name</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date Acknowledged</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {applicableEntities.map(entity => {
                                    const ack = content.acknowledgments?.find(a => a.entityId === entity.entityId);
                                    return (
                                        <tr key={entity.entityId}>
                                            <td className="px-4 py-2 text-sm">{entity.companyName}</td>
                                            <td className="px-4 py-2 text-sm">{ack ? <span className="text-green-600 font-semibold">Acknowledged</span> : <span className="text-gray-500">Pending</span>}</td>
                                            <td className="px-4 py-2 text-sm">{ack ? formatDate(ack.acknowledgedAt) : 'N/A'}</td>
                                            <td className="px-4 py-2 text-sm">
                                                {!ack && <button onClick={() => handleAcknowledge(entity.entityId)} className="text-blue-600 hover:underline text-xs">Simulate Ack.</button>}
                                            </td>
                                        </tr>
                                    )
                                })}
                                {applicableEntities.length === 0 && <tr><td colSpan="4" className="text-center text-gray-500 py-4">No entities found for the applicable categories.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                 </div>
            )}

        </div>
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Details</h3>
                <dl className="divide-y divide-gray-200">
                    <InfoRow label="Status"><StatusBadge status={content.status} /></InfoRow>
                    <InfoRow label="Type / Category" value={content.type} />
                    <InfoRow label="Summary" value={content.summary} className="whitespace-pre-wrap" />
                    <InfoRow label={isPublication ? "Publication Date" : "Issue Date"} value={formatDate(content.issueDate)} />
                    {!isPublication && <InfoRow label="Effective Date" value={formatDate(content.effectiveDate)} />}
                    <InfoRow label={isPublication ? "Published By" : "Created By"} value={content.creatorDetails?.name || content.createdByStaffId} />
                    {isPublication && <InfoRow label="Author / Department" value={content.author} />}
                    <InfoRow label="Official Document">
                        <FileLink document={content.documentDetails} />
                    </InfoRow>
                    {!isPublication && (
                        <InfoRow label="Applicable License Categories">
                            {content.categoryDetails && content.categoryDetails.length > 0 ? (
                                <ul className="list-disc list-inside space-y-1">
                                    {content.categoryDetails.map(cat => <li key={cat.id}>{cat.name}</li>)}
                                </ul>
                            ) : 'None specified.'}
                        </InfoRow>
                    )}
                     {isPublication && (
                        <InfoRow label="Tags">
                           {content.tags && content.tags.length > 0 ? (
                             <div className="flex flex-wrap gap-2">
                               {content.tags.map(tag => (
                                 <span key={tag} className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-md">{tag}</span>
                               ))}
                             </div>
                           ) : 'No tags specified.'}
                        </InfoRow>
                    )}
                </dl>
            </div>
            {content.promptUsed && (
              <div className="bg-white p-6 rounded-xl shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">AI Prompt Used</h3>
                  <p className="text-sm text-gray-600 italic whitespace-pre-wrap">
                      {content.promptUsed}
                  </p>
              </div>
            )}
        </div>
      </div>

        {isEditorModalOpen && (
            <RegulatoryUpdateEditor
                contentToEdit={content}
                contentType={content.contentType}
                onClose={handleCloseEditor}
                onSave={handleSaveSuccess}
            />
        )}
    </div>
  );
};

export default RegulatoryUpdateDetailPage;