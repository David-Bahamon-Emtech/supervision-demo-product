// src/components/RegulatoryUpdates/RegulatoryUpdateDetailPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { getFullContentDetails } from './regulatoryUpdatesService.js';
import RegulatoryUpdateEditor from './RegulatoryUpdateEditor.jsx';
import { getEntitiesByLicenseCategory } from '../Reporting/reportingService.js'; // To get entities

// Reusable Minor Components (Updated for Dark Theme)
const InfoRow = ({ label, value, children, className = "" }) => (
  <div className={`py-2 sm:grid sm:grid-cols-3 sm:gap-4 ${className}`}>
    <dt className="text-sm font-medium text-theme-text-secondary">{label}</dt>
    <dd className="mt-1 text-sm text-theme-text-primary sm:mt-0 sm:col-span-2 break-words">
      {children || value || 'N/A'}
    </dd>
  </div>
);

const FileLink = ({ document }) => {
  if (!document) return <div className="text-sm text-theme-text-secondary italic">No document attached.</div>;
  return (
    <a
      href={document.dummyFileContentLink || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-blue-400 hover:text-theme-accent hover:underline flex items-center group"
      title={document.fileName}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-theme-text-secondary group-hover:text-theme-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
      {document.fileName} ({document.documentType})
    </a>
  );
};

const StatusBadge = ({ status }) => {
  let bgColorClass = 'bg-gray-700 text-gray-200';
  switch (status) {
    case 'Published': bgColorClass = 'bg-green-900 bg-opacity-50 text-green-300'; break;
    case 'Draft': bgColorClass = 'bg-yellow-900 bg-opacity-50 text-yellow-300'; break;
    case 'Archived': case 'Superseded': bgColorClass = 'bg-gray-800 bg-opacity-80 text-gray-300'; break;
    case 'Scheduled': bgColorClass = 'bg-blue-900 bg-opacity-50 text-blue-300'; break;
    default: break;
  }
  return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${bgColorClass}`}>{status}</span>;
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
    return <div className="p-6 text-center text-theme-text-secondary text-lg">Loading details...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-400 bg-red-900 bg-opacity-30 rounded-md shadow">{error}</div>;
  }

  if (!content) {
    return <div className="p-6 text-center text-theme-text-secondary">No data found for this item.</div>;
  }

  const canEdit = content.status === 'Draft' || content.status === 'Published';
  const isPublication = content.contentType === 'Publication';

  return (
    <div className="p-4 md:p-6 min-h-screen">
      <div className="mb-6">
        <button onClick={onBack} className="mb-4 text-sm text-blue-400 hover:text-theme-accent focus:outline-none">
          &larr; Back to All Content
        </button>
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold text-theme-text-primary">{content.title}</h1>
                <p className="text-theme-text-secondary mt-1">Details for {content.contentType} ID: {content.id}</p>
            </div>
            <button
                onClick={handleOpenEditor}
                disabled={!canEdit}
                className="px-4 py-2 bg-theme-accent text-sidebar-bg font-semibold rounded-md shadow-sm hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-bg focus:ring-theme-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Edit Content
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-theme-bg-secondary p-6 rounded-xl shadow-lg border border-theme-border">
                <h3 className="text-lg font-semibold text-theme-text-primary mb-4 border-b border-theme-border pb-2">Full Document Content</h3>
                <div className="prose prose-sm max-w-none prose-invert">
                <pre className="whitespace-pre-wrap font-sans text-theme-text-primary bg-theme-bg p-4 rounded-md">
                    {content.textContent || "No full text content available for this item."}
                </pre>
                </div>
            </div>

            {!isPublication && (
                 <div className="bg-theme-bg-secondary p-6 rounded-xl shadow-lg border border-theme-border">
                    <h3 className="text-lg font-semibold text-theme-text-primary mb-4 border-b border-theme-border pb-2">Acknowledgment Status</h3>
                     <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-theme-border">
                            <thead className="bg-black bg-opacity-20">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-theme-text-secondary">Entity Name</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-theme-text-secondary">Status</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-theme-text-secondary">Date Acknowledged</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-theme-text-secondary">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-theme-border">
                                {applicableEntities.map(entity => {
                                    const ack = content.acknowledgments?.find(a => a.entityId === entity.entityId);
                                    return (
                                        <tr key={entity.entityId} className="hover:bg-theme-bg">
                                            <td className="px-4 py-2 text-sm text-theme-text-primary">{entity.companyName}</td>
                                            <td className="px-4 py-2 text-sm">{ack ? <span className="text-green-400 font-semibold">Acknowledged</span> : <span className="text-gray-400">Pending</span>}</td>
                                            <td className="px-4 py-2 text-sm text-theme-text-secondary">{ack ? formatDate(ack.acknowledgedAt) : 'N/A'}</td>
                                            <td className="px-4 py-2 text-sm">
                                                {!ack && <button onClick={() => handleAcknowledge(entity.entityId)} className="text-blue-400 hover:underline text-xs">Simulate Ack.</button>}
                                            </td>
                                        </tr>
                                    )
                                })}
                                {applicableEntities.length === 0 && <tr><td colSpan="4" className="text-center text-theme-text-secondary py-4">No entities found for the applicable categories.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                 </div>
            )}

        </div>
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-theme-bg-secondary p-6 rounded-xl shadow-lg border border-theme-border">
                <h3 className="text-lg font-semibold text-theme-text-primary mb-4 border-b border-theme-border pb-2">Details</h3>
                <dl className="divide-y divide-theme-border">
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
                                 <span key={tag} className="px-2 py-1 text-xs font-medium bg-gray-700 text-gray-200 rounded-md">{tag}</span>
                               ))}
                             </div>
                           ) : 'No tags specified.'}
                        </InfoRow>
                    )}
                </dl>
            </div>
            {content.promptUsed && (
              <div className="bg-theme-bg-secondary p-6 rounded-xl shadow-lg border border-theme-border">
                  <h3 className="text-lg font-semibold text-theme-text-primary mb-4 border-b pb-2">AI Prompt Used</h3>
                  <p className="text-sm text-theme-text-secondary italic whitespace-pre-wrap">
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