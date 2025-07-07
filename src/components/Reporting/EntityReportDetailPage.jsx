import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getComplianceSubmissionsForEntity,
  getComplianceSubmissionDetail,
  getDocumentById,
  assignReportSectionReviewer,
  updateSectionReview,
  getAIAssessmentForSubmission
} from './reportingService.js';
import {
  getAllRegulatorStaff,
  getEntityById,
} from '../Licensing/licensingService.js';

// --- Helper Components ---

const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  return date.toLocaleDateString(undefined, options);
};

const FileLink = ({ documentId }) => {
  const [doc, setDoc] = useState(null);
  useEffect(() => {
    if (documentId) {
      getDocumentById(documentId).then(setDoc);
    }
  }, [documentId]);

  if (!doc) return <div className="text-xs text-gray-400 italic">Loading doc...</div>;

  // If the document object contains a File object (from a recent upload),
  // create a temporary URL for it. Otherwise, use the placeholder link.
  const href = doc.fileObject ? URL.createObjectURL(doc.fileObject) : doc.dummyFileContentLink;

  return (
    <a 
      href={href || '#'} 
      download={doc.fileName}
      className="flex items-center text-sm text-blue-600 hover:underline group"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
      {doc.fileName}
    </a>
  );
};

const SectionStatusBadge = ({ status }) => {
  let bgColorClass = 'bg-gray-100 text-gray-700';
  switch (status) {
    case 'Compliant': bgColorClass = 'bg-green-100 text-green-700'; break;
    case 'Non-Compliant': bgColorClass = 'bg-red-100 text-red-700'; break;
    case 'Partially Compliant': bgColorClass = 'bg-yellow-100 text-yellow-700'; break;
    case 'Under Review': bgColorClass = 'bg-blue-100 text-blue-700'; break;
    case 'Pending Review': bgColorClass = 'bg-indigo-100 text-indigo-700'; break;
  }
  return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${bgColorClass}`}>{status}</span>;
};

const AIAssessmentResult = ({ assessment, isLoading, error }) => {
    if (isLoading) {
        return (
            <div className="text-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                <p className="text-sm text-purple-700 italic mt-2">AI is analyzing the submission...</p>
            </div>
        );
    }
    if (error) {
        return (
             <div className="p-3 bg-red-100 text-red-800 rounded-md">
                <p className="font-semibold text-sm">AI Analysis Failed</p>
                <p className="text-xs mt-1">{error}</p>
            </div>
        )
    }
    if (!assessment) {
        return <p className="text-center text-xs text-gray-500 p-4 italic">Click 'Assess with AI' to analyze submission content.</p>
    }

    const scoreColor = assessment.complianceScore >= 85 ? 'text-green-600' : assessment.complianceScore >= 60 ? 'text-yellow-600' : 'text-red-600';

    return (
        <div>
            <div className="flex justify-between items-center mb-3">
                <h5 className="font-bold text-purple-800">{assessment.reportTitle || "AI Assessment Results"}</h5>
                <div>
                    <span className="text-sm text-gray-600">Compliance Score: </span>
                    <span className={`text-2xl font-bold ${scoreColor}`}>{assessment.complianceScore}/100</span>
                </div>
            </div>
            <div className="space-y-4">
                <div>
                    <h6 className="font-semibold text-sm text-gray-700 mb-1">AI Summary:</h6>
                    <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded-md border">{assessment.summary}</p>
                </div>
                {assessment.keyFindings && assessment.keyFindings.length > 0 && (
                     <div>
                        <h6 className="font-semibold text-sm text-gray-700 mb-1">Key Findings:</h6>
                        <ul className="list-disc list-inside space-y-2 text-sm">
                            {assessment.keyFindings.map((finding, index) => (
                                <li key={index} className="text-gray-800">
                                   <span className="font-semibold text-red-600">[{finding.status}]</span>
                                   <span className="ml-2 font-medium">{finding.sectionName}:</span>
                                   <span className="ml-2 italic">"{finding.details}"</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Main Component ---
const EntityReportDetailPage = ({ entityId, onBack }) => {
  const [entity, setEntity] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [allStaff, setAllStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [expandedSubmissionId, setExpandedSubmissionId] = useState(null);
  const [detailedSubmission, setDetailedSubmission] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterYear, setFilterYear] = useState('All');
  
  const [aiAssessment, setAIAssessment] = useState({});
  const [isAILoading, setIsAILoading] = useState(null);
  const [aiError, setAIError] = useState({});

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [entityData, submissionsData, staffData] = await Promise.all([
        getEntityById(entityId),
        getComplianceSubmissionsForEntity(entityId),
        getAllRegulatorStaff(),
      ]);
      setEntity(entityData);
      setSubmissions(submissionsData || []);
      setAllStaff(staffData || []);
    } catch (err) {
      setError(`Failed to load compliance details for entity ${entityId}.`);
    } finally {
      setIsLoading(false);
    }
  }, [entityId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleExpand = async (submissionId) => {
    if (expandedSubmissionId === submissionId) {
        setExpandedSubmissionId(null);
        setDetailedSubmission(null);
    } else {
        setExpandedSubmissionId(submissionId);
        setIsDetailLoading(true);
        try {
            const details = await getComplianceSubmissionDetail(submissionId);
            setDetailedSubmission(details);
        } catch (e) {
            setError(`Failed to load details for submission ${submissionId}`);
            setDetailedSubmission(null);
        } finally {
            setIsDetailLoading(false);
        }
    }
  };

  const { filteredSubmissions, filterOptions } = useMemo(() => {
    const options = {
      reportTypes: ['All', ...new Set(submissions.map(s => s.reportType))],
      statuses: ['All', ...new Set(submissions.map(s => s.status))],
      years: ['All', ...new Set(submissions.map(s => new Date(s.dueDate).getFullYear().toString()))].sort((a,b) => b-a),
    };

    const filtered = submissions.filter(sub => {
      const typeMatch = filterType === 'All' || sub.reportType === filterType;
      const statusMatch = filterStatus === 'All' || sub.status === filterStatus;
      const yearMatch = filterYear === 'All' || new Date(sub.dueDate).getFullYear().toString() === filterYear;
      return typeMatch && statusMatch && yearMatch;
    });

    return { filteredSubmissions: filtered, filterOptions: options };
  }, [submissions, filterType, filterStatus, filterYear]);

  const handleAIAssessment = async (submissionId) => {
    setIsAILoading(submissionId);
    setAIError(prev => ({...prev, [submissionId]: null }));
    setAIAssessment(prev => ({...prev, [submissionId]: null }));

    try {
        const result = await getAIAssessmentForSubmission(submissionId);
        setAIAssessment(prev => ({ ...prev, [submissionId]: result }));
    } catch(err) {
        console.error("AI Assessment failed for submission", submissionId, err);
        setAIError(prev => ({...prev, [submissionId]: err.message || "An unknown error occurred."}));
    } finally {
        setIsAILoading(null);
    }
  };

  if (isLoading) return <div className="p-6 text-center text-gray-600">Loading...</div>;
  if (error) return <div className="p-6 text-center text-red-700">{error}</div>;
  if (!entity) return <div className="p-6 text-center text-gray-500">Entity data not available.</div>;

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
       <div className="mb-6">
        <button onClick={onBack} className="mb-4 px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-500 rounded-md hover:bg-blue-50">
          &larr; Back to Category Reports
        </button>
        <h1 className="text-3xl font-bold text-gray-800">{entity.companyName}</h1>
        <p className="text-gray-600 mt-1">Compliance Submission History</p>
      </div>
      
      <div className="p-4 bg-white rounded-xl shadow-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <h3 className="text-lg font-semibold text-gray-600 md:col-span-1">Filter Reports</h3>
                <div className="md:col-span-1">
                    <label htmlFor="filterType" className="block text-sm font-medium text-gray-700">Report Type</label>
                    <select id="filterType" value={filterType} onChange={e => setFilterType(e.target.value)} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm">
                        {filterOptions.reportTypes.map(opt => <option key={opt} value={opt}>{opt.replace(/_/g, ' ')}</option>)}
                    </select>
                </div>
                 <div className="md:col-span-1">
                    <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700">Status</label>
                    <select id="filterStatus" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm">
                        {filterOptions.statuses.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
                 <div className="md:col-span-1">
                    <label htmlFor="filterYear" className="block text-sm font-medium text-gray-700">Year</label>
                    <select id="filterYear" value={filterYear} onChange={e => setFilterYear(e.target.value)} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm">
                         {filterOptions.years.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
            </div>
        </div>

        <div className="space-y-6">
            {filteredSubmissions.map(submission => (
              <div key={submission.submissionId} className="bg-white shadow-xl rounded-lg">
                <button
                  onClick={() => handleToggleExpand(submission.submissionId)}
                  className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-t-lg flex justify-between items-center"
                >
                   <div>
                    <h3 className="text-lg font-semibold text-blue-700">{submission.reportType.replace(/_/g, ' ')} - {submission.reportingPeriod}</h3>
                    <p className="text-xs text-gray-500">Submitted: {formatDate(submission.submissionDate)} | Status: <span className="font-medium">{submission.status}</span></p>
                   </div>
                   <span className={`transform transition-transform duration-200 ${expandedSubmissionId === submission.submissionId ? 'rotate-180' : ''}`}>▼</span>
                </button>

                {expandedSubmissionId === submission.submissionId && (
                  <div className="p-4 md:p-6 border-t border-gray-200">
                      {isDetailLoading && <p className="text-center text-gray-500">Loading details...</p>}
                      {detailedSubmission && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-md font-semibold text-gray-700 mb-2 border-b pb-1">Submitted Metrics</h4>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                    {Object.entries(detailedSubmission.sections[0].fieldValues || {}).map(([key, value]) => (
                                        <div key={key}>
                                            <span className="font-medium text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
                                            <span className="text-gray-800">{value}</span>
                                        </div>
                                    ))}
                                </div>
                                <h4 className="text-md font-semibold text-gray-700 mt-4 mb-2 border-b pb-1">Attachments</h4>
                                <div className="space-y-2">
                                    {detailedSubmission.attachments.length > 0 ? (
                                        detailedSubmission.attachments.map(docId => <FileLink key={docId} documentId={docId} />)
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">No documents were attached to this submission.</p>
                                    )}
                                </div>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg shadow-inner">
                                <AIAssessmentResult 
                                    isLoading={isAILoading === submission.submissionId} 
                                    assessment={aiAssessment[submission.submissionId]} 
                                    error={aiError[submission.submissionId]}
                                />
                                {!aiAssessment[submission.submissionId] && !aiError[submission.submissionId] && (
                                    <div className="text-center mt-2">
                                        <button 
                                            onClick={() => handleAIAssessment(submission.submissionId)} 
                                            className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-md shadow-sm hover:bg-purple-700 disabled:opacity-50"
                                            disabled={isAILoading === submission.submissionId}
                                        >
                                            {isAILoading === submission.submissionId ? 'Assessing...' : 'Assess with AI'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
            ))}
            {filteredSubmissions.length === 0 && (
                <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500 italic">
                    No submissions match the current filters.
                </div>
            )}
        </div>
    </div>
  );
};

export default EntityReportDetailPage;
