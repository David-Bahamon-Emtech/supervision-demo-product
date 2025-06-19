// src/components/Licensing/LicenseActionPage.js
import React, { useEffect, useState, useMemo } from 'react';
import {
    getLicenseById,
    getEntityById,
    getProductById,
    createLicenseAction,
    getLicenseActionById,
    updateLicenseAction,
    updateLicenseStatus,
    getDocumentById,
    getStaffById // Added for fetching staff names for notes
} from './licensingService.js';
// MODIFICATION START: Added predefinedRevocationReasons
import { predefinedSuspensionReasons, predefinedLiftSuspensionReasons, predefinedRevocationReasons } from '../../data/licenseActions.js';
// MODIFICATION END

// Helper to format date
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

const InfoRow = ({ label, value, children, className = "" }) => (
    <div className={`py-2 sm:grid sm:grid-cols-3 sm:gap-4 ${className}`}>
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 break-words">
        {children || value || 'N/A'}
      </dd>
    </div>
);

const SectionTitle = ({ title }) => (
    <h3 className="text-lg leading-6 font-semibold text-gray-800 mb-4 mt-6 pb-2 border-b border-gray-300">
      {title}
    </h3>
);

// Checklist Item Component
const ChecklistItem = ({ id, label, checked, onChange, disabled }) => (
    <div className="flex items-center py-2 border-b border-gray-100 last:border-b-0">
        <input
            id={id}
            name={id}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-75"
        />
        <label htmlFor={id} className={`ml-3 block text-sm ${checked && !disabled ? 'text-gray-700 line-through' : 'text-gray-700'} ${disabled ? 'text-gray-500' : ''}`}>
            {label}
        </label>
    </div>
);

// FileLink Component
const FileLink = ({ document }) => {
    if (!document) return <div className="py-1 text-sm text-gray-500">Document not found.</div>;
    return (
        <div className="py-1.5 flex items-center group border-b border-gray-100 last:border-b-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400 group-hover:text-blue-500 transition-colors duration-150 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <a href={document.dummyFileContentLink || '#'} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 hover:underline truncate flex-grow" title={document.fileName}>
                {document.fileName || 'Unnamed Document'}
            </a>
            {document.documentType && <span className="ml-2 text-xs text-gray-400 group-hover:text-gray-600 whitespace-nowrap">({document.documentType})</span>}
        </div>
    );
};

// Note Item Component
const NoteItem = ({ note, staffName }) => {
    return (
        <div className="py-3 px-4 bg-gray-50 rounded-md border border-gray-200 mb-3 shadow-sm">
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.text}</p>
            <div className="mt-2 text-xs text-gray-500 flex justify-between items-center">
                <span>
                    Added by: <span className="font-medium">{staffName || note.staffId}</span>
                </span>
                <span>{formatDate(note.date, true)}</span>
            </div>
        </div>
    );
};

const LicenseActionPage = ({
    licenseId,
    actionType,
    existingActionId,
    onBackToList,
    onActionCompleted,
    currentStaffId = "reg_001"
}) => {
    const [license, setLicense] = useState(null);
    const [entity, setEntity] = useState(null);
    const [product, setProduct] = useState(null);
    const [currentLicenseAction, setCurrentLicenseAction] = useState(null);

    const [reasonCategory, setReasonCategory] = useState('');
    const [reasonDetails, setReasonDetails] = useState('');
    const [decisionOutcome, setDecisionOutcome] = useState('');
    const [decisionNotes, setDecisionNotes] = useState('');

    // MODIFICATION START: Added item6_revoke to initialChecklistState
    const initialChecklistState = useMemo(() => ({ item1: false, item2: false, item3: false, item4: false, item5: false, item6_suspend: false, item6_lift: false, item6_revoke: false }), []);
    // MODIFICATION END
    const [internalReviewChecklist, setInternalReviewChecklist] = useState(initialChecklistState);
    const [supportingDocuments, setSupportingDocuments] = useState([]);
    const [newDocumentIdInput, setNewDocumentIdInput] = useState('');
    const [actionNotesWithStaffNames, setActionNotesWithStaffNames] = useState([]);
    const [newNoteText, setNewNoteText] = useState('');

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('ACTION_DETAILS');

    const handleChecklistItemChange = (event) => {
        const { name, checked } = event.target;
        setInternalReviewChecklist(prevState => ({ ...prevState, [name]: checked }));
    };

    // MODIFICATION START: Updated reasonsList for 'Revoke License'
    const reasonsList = useMemo(() => {
        const type = currentLicenseAction?.actionType || actionType;
        if (type === 'Suspend License') return predefinedSuspensionReasons;
        if (type === 'Lift Suspension') return predefinedLiftSuspensionReasons;
        if (type === 'Revoke License') return predefinedRevocationReasons; // ADDED THIS
        return [];
    }, [currentLicenseAction?.actionType, actionType]);
    // MODIFICATION END

    // MODIFICATION START: Updated decisionOutcomesOptions for 'Revoke License'
    const decisionOutcomesOptions = useMemo(() => {
        const type = currentLicenseAction?.actionType || actionType;
        if (type === 'Suspend License') return ["Proceed with Suspension", "Reject Suspension Request"];
        if (type === 'Lift Suspension') return ["Proceed with Lifting Suspension", "Reject Lift Suspension Request"];
        if (type === 'Revoke License') return ["Proceed with Revocation", "Reject Revocation Request"]; // ADDED THIS
        return [];
    }, [currentLicenseAction?.actionType, actionType]);
    // MODIFICATION END

    useEffect(() => {
        const fetchDocs = async () => {
            if (currentLicenseAction?.supportingDocumentIds?.length > 0) {
                try {
                    const fetchedDocs = await Promise.all(currentLicenseAction.supportingDocumentIds.map(docId => getDocumentById(docId)));
                    setSupportingDocuments(fetchedDocs.filter(doc => doc !== null));
                } catch (docError) { console.error("Error fetching supporting documents:", docError); }
            } else { setSupportingDocuments([]); }
        };
        if (currentLicenseAction) fetchDocs();
    }, [currentLicenseAction?.supportingDocumentIds]);

    useEffect(() => {
        const fetchNoteStaff = async () => {
            if (currentLicenseAction?.internalReviewNotes?.length > 0) {
                try {
                    const notesWithNames = await Promise.all(currentLicenseAction.internalReviewNotes.map(async (note) => {
                        const staff = await getStaffById(note.staffId);
                        return { ...note, staffName: staff ? staff.name : note.staffId };
                    }));
                    notesWithNames.sort((a, b) => new Date(b.date) - new Date(a.date));
                    setActionNotesWithStaffNames(notesWithNames);
                } catch (noteError) { console.error("Error fetching staff names for notes:", noteError); }
            } else { setActionNotesWithStaffNames([]); }
        };
        if (currentLicenseAction) fetchNoteStaff();
    }, [currentLicenseAction?.internalReviewNotes]);

    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                let targetLicenseId = licenseId;
                let initialActionType = actionType;

                if (existingActionId) {
                    const fetchedAction = await getLicenseActionById(existingActionId);
                    if (!fetchedAction) throw new Error(`License Action with ID ${existingActionId} not found.`);
                    setCurrentLicenseAction(fetchedAction);
                    targetLicenseId = fetchedAction.licenseId;
                    initialActionType = fetchedAction.actionType;
                    setReasonCategory(fetchedAction.reasonCategory || '');
                    setReasonDetails(fetchedAction.reasonDetails || '');
                    setDecisionOutcome(fetchedAction.decision || '');
                    setDecisionNotes(fetchedAction.decisionNotes || '');
                    setInternalReviewChecklist(fetchedAction.internalReviewChecklistData || initialChecklistState);
                    // Supporting documents & notes will be fetched by their own useEffects
                }

                if (!targetLicenseId) throw new Error("Could not determine License ID.");

                const licData = await getLicenseById(targetLicenseId);
                if (!licData) throw new Error(`License with ID ${targetLicenseId} not found.`);
                setLicense(licData);

                const [entityData, productData] = await Promise.all([
                    getEntityById(licData.entityId),
                    getProductById(licData.productId)
                ]);
                setEntity(entityData);
                setProduct(productData);

                if (!existingActionId && licData) {
                    const newActionDraft = {
                        actionId: null, licenseId: targetLicenseId, actionType: initialActionType,
                        creationDate: new Date().toISOString(), initiatingStaffId: currentStaffId,
                        status: 'Draft', originalLicenseStatus: licData.licenseStatus,
                        reasonCategory: '', reasonDetails: '', supportingDocumentIds: [],
                        internalReviewNotes: [],
                        internalReviewChecklistData: { ...initialChecklistState }, // Will pick up new item6_revoke
                    };
                    setCurrentLicenseAction(newActionDraft);
                    setInternalReviewChecklist({ ...initialChecklistState }); // Ensures fresh state for new draft
                    setSupportingDocuments([]);
                    setActionNotesWithStaffNames([]);
                }
            } catch (err) {
                console.error("Error loading page data:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        loadInitialData();
    }, [licenseId, actionType, existingActionId, currentStaffId, initialChecklistState]);

    const handleAddDocumentId = async () => {
        if (!newDocumentIdInput.trim()) { alert("Please enter a document ID."); return; }
        try {
            const docExists = await getDocumentById(newDocumentIdInput.trim());
            if (!docExists) { alert(`Document ID "${newDocumentIdInput.trim()}" not found.`); return; }
        } catch (e) { alert(`Error verifying document ID.`); return; }

        setCurrentLicenseAction(prevAction => {
            const currentDocIds = prevAction.supportingDocumentIds || [];
            if (currentDocIds.includes(newDocumentIdInput.trim())) {
                alert("Document ID already added."); return prevAction;
            }
            return { ...prevAction, supportingDocumentIds: [...currentDocIds, newDocumentIdInput.trim()] };
        });
        setNewDocumentIdInput('');
    };

    const handleRemoveDocumentId = (docIdToRemove) => {
        setCurrentLicenseAction(prevAction => ({
            ...prevAction,
            supportingDocumentIds: (prevAction.supportingDocumentIds || []).filter(id => id !== docIdToRemove)
        }));
    };

    const handleAddNote = () => {
        if (!newNoteText.trim()) { alert("Note text cannot be empty."); return; }
        if (!currentLicenseAction) return;
        const newNoteEntry = {
            noteId: `lcan_${currentLicenseAction.actionId || 'new'}_${Date.now()}`,
            staffId: currentStaffId, date: new Date().toISOString(), text: newNoteText.trim(),
        };
        setCurrentLicenseAction(prevAction => ({
            ...prevAction, internalReviewNotes: [...(prevAction.internalReviewNotes || []), newNoteEntry]
        }));
        setNewNoteText('');
    };

    const handleSaveDraft = async () => {
        if (!currentLicenseAction || isSubmitting) return;
        setIsSubmitting(true); setError(null);
        const actionDataPayload = {
            ...currentLicenseAction, reasonCategory, reasonDetails,
            internalReviewChecklistData: internalReviewChecklist, status: 'Draft',
        };
        try {
            let savedAction;
            if (currentLicenseAction.actionId) {
                savedAction = await updateLicenseAction(currentLicenseAction.actionId, actionDataPayload);
            } else {
                savedAction = await createLicenseAction(actionDataPayload);
            }
            setCurrentLicenseAction(savedAction);
            setReasonCategory(savedAction.reasonCategory || '');
            setReasonDetails(savedAction.reasonDetails || '');
            setInternalReviewChecklist(savedAction.internalReviewChecklistData || initialChecklistState);
            alert("Draft saved successfully!");
            if (onActionCompleted) onActionCompleted(savedAction);
        } catch (err) { setError(`Failed to save draft: ${err.message}`); } finally { setIsSubmitting(false); }
    };

    const handleSubmitForReview = async () => {
        if (!currentLicenseAction || isSubmitting) return;
        if (!reasonCategory || !reasonDetails.trim()) { alert("Reason category and details are required."); return; }
        setIsSubmitting(true); setError(null);
        const actionDataPayload = {
            ...currentLicenseAction, reasonCategory, reasonDetails,
            internalReviewChecklistData: internalReviewChecklist, status: 'Pending Review',
        };
        try {
            let submittedAction;
            if (currentLicenseAction.actionId) {
                submittedAction = await updateLicenseAction(currentLicenseAction.actionId, actionDataPayload);
            } else {
                submittedAction = await createLicenseAction(actionDataPayload);
            }
            setCurrentLicenseAction(submittedAction);
            alert("Action submitted for review!");
            if (onActionCompleted) onActionCompleted(submittedAction, true);
        } catch (err) { setError(`Failed to submit action: ${err.message}`); } finally { setIsSubmitting(false); }
    };

    const handleProcessDecision = async () => {
        if (!currentLicenseAction || !currentLicenseAction.actionId || isSubmitting) return;
        if (!decisionOutcome) { alert("A decision outcome is required."); return; }
        if (!decisionNotes.trim()) { alert("Decision notes are required."); return; }
        setIsSubmitting(true); setError(null);
        const finalActionStatusOnWorkflow = decisionOutcome.startsWith("Proceed") ? 'Approved' : 'Rejected';
        const effectiveDate = new Date().toISOString();
        const actionUpdatePayload = {
            status: finalActionStatusOnWorkflow, decision: decisionOutcome, decisionNotes,
            decisionByStaffId: currentStaffId, decisionDate: effectiveDate,
            effectiveDate: finalActionStatusOnWorkflow === 'Approved' ? effectiveDate : undefined,
        };
        try {
            const updatedAction = await updateLicenseAction(currentLicenseAction.actionId, actionUpdatePayload);
            setCurrentLicenseAction(prev => ({ ...prev, ...updatedAction }));
            if (finalActionStatusOnWorkflow === 'Approved') {
                let newLicenseStatus = license.licenseStatus;
                let licenseStatusReason = license.statusReason || "";
                const actionReasonCat = currentLicenseAction.reasonCategory;
                const actionReasonDet = currentLicenseAction.reasonDetails;

                if (currentLicenseAction.actionType === 'Suspend License') {
                    newLicenseStatus = 'Suspended';
                    licenseStatusReason = `Suspended: ${actionReasonCat} - ${actionReasonDet}. Ref: ${updatedAction.actionId}`;
                } else if (currentLicenseAction.actionType === 'Lift Suspension') {
                    newLicenseStatus = 'Active';
                    licenseStatusReason = `Suspension Lifted: ${actionReasonCat} - ${actionReasonDet}. Ref: ${updatedAction.actionId}`;
                // MODIFICATION START: Added logic for 'Revoke License'
                } else if (currentLicenseAction.actionType === 'Revoke License') {
                    newLicenseStatus = 'Revoked';
                    licenseStatusReason = `Revoked: ${actionReasonCat} - ${actionReasonDet}. Ref: ${updatedAction.actionId}`;
                }
                // MODIFICATION END

                if (newLicenseStatus !== license.licenseStatus) {
                    await updateLicenseStatus(license.licenseId, newLicenseStatus, licenseStatusReason);
                }
                alert(`License action processed. License status updated to ${newLicenseStatus}.`);
            } else {
                alert(`License action to '${currentLicenseAction.actionType}' was not executed: ${decisionOutcome}.`);
            }
            if (onActionCompleted) onActionCompleted(updatedAction, true);
            if (onBackToList) onBackToList();
        } catch (err) { setError(`Failed to process decision: ${err.message}`); } finally { setIsSubmitting(false); }
    };

    const renderActionDetailsTab = () => {
        if (!currentLicenseAction) return <p className="text-gray-500">Initializing action details...</p>;
        const currentActionTypeForDisplay = currentLicenseAction.actionType || actionType;
        const canEditDetails = currentLicenseAction.status === 'Draft';
        return (
            <div className="space-y-6">
                <InfoRow label="Action Type"><span className="font-semibold">{currentActionTypeForDisplay}</span></InfoRow>
                <InfoRow label="Original License Status" value={currentLicenseAction.originalLicenseStatus} />
                <div>
                    <label htmlFor="reasonCategory" className="block text-sm font-medium text-gray-700">Reason Category <span className="text-red-500">*</span></label>
                    <select id="reasonCategory" value={reasonCategory} onChange={(e) => setReasonCategory(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        disabled={isSubmitting || !canEditDetails}>
                        <option value="">-- Select a Reason --</option>
                        {reasonsList.map(reason => (<option key={reason} value={reason}>{reason}</option>))}
                    </select>
                </div>
                <div>
                    <label htmlFor="reasonDetails" className="block text-sm font-medium text-gray-700">Reason Details / Justification <span className="text-red-500">*</span></label>
                    <textarea id="reasonDetails" value={reasonDetails} onChange={(e) => setReasonDetails(e.target.value)} rows="4"
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder={`Provide detailed reasons for ${currentActionTypeForDisplay?.toLowerCase()}...`}
                        disabled={isSubmitting || !canEditDetails} />
                </div>
                <div>
                    <SectionTitle title="Supporting Documents" />
                    {canEditDetails && (
                        <div className="mb-4 p-3 bg-gray-50 border border-dashed border-gray-300 rounded-md">
                            <label htmlFor="newDocumentIdInput" className="block text-sm font-medium text-gray-700 mb-1">Add Document ID (e.g., doc_001):</label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <input type="text" id="newDocumentIdInput" value={newDocumentIdInput} onChange={(e) => setNewDocumentIdInput(e.target.value)}
                                    placeholder="Enter known document ID"
                                    className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 p-2"
                                    disabled={isSubmitting} />
                                <button onClick={handleAddDocumentId} disabled={isSubmitting || !newDocumentIdInput.trim()}
                                    className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-r-md text-sm font-medium disabled:bg-gray-200 disabled:text-gray-400">
                                    Add Document
                                </button>
                            </div>
                        </div>
                    )}
                    {supportingDocuments.length > 0 ? (
                        <div className="space-y-1">
                            {supportingDocuments.map(doc => (
                                <div key={doc.documentId} className="flex items-center justify-between group">
                                    <FileLink document={doc} />
                                    {canEditDetails && (
                                        <button onClick={() => handleRemoveDocumentId(doc.documentId)} disabled={isSubmitting}
                                            className="ml-3 text-red-500 hover:text-red-700 text-xs p-1 opacity-50 group-hover:opacity-100 transition-opacity" title="Remove Document">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (<p className="text-sm text-gray-500 italic">No supporting documents added.</p>)}
                </div>
            </div>
        );
    };

    const renderInternalReviewTab = () => {
        const canInteractWithChecklist = currentLicenseAction?.status === 'Draft' || currentLicenseAction?.status === 'Pending Review';
        let checklistTitle = "Internal Review Checklist";
        if (currentLicenseAction?.actionType === 'Suspend License') checklistTitle = "Pre-Suspension Review";
        else if (currentLicenseAction?.actionType === 'Lift Suspension') checklistTitle = "Pre-Lifting Suspension Review";
        // MODIFICATION START: Added title for Revoke License
        else if (currentLicenseAction?.actionType === 'Revoke License') checklistTitle = "Pre-Revocation Review";
        // MODIFICATION END

        return (
            <div className="min-h-[200px]">
                <SectionTitle title={checklistTitle} />
                <div className="space-y-3 p-4 bg-gray-50 rounded-md border">
                    <ChecklistItem id="item1" label="Justification & Reasonableness check complete." checked={internalReviewChecklist.item1} onChange={handleChecklistItemChange} disabled={!canInteractWithChecklist || isSubmitting} />
                    <ChecklistItem id="item2" label="Evidence Review check complete." checked={internalReviewChecklist.item2} onChange={handleChecklistItemChange} disabled={!canInteractWithChecklist || isSubmitting} />
                    <ChecklistItem id="item3" label="Impact Assessment check complete." checked={internalReviewChecklist.item3} onChange={handleChecklistItemChange} disabled={!canInteractWithChecklist || isSubmitting} />
                    <ChecklistItem id="item4" label="Communication Plan (if applicable) reviewed." checked={internalReviewChecklist.item4} onChange={handleChecklistItemChange} disabled={!canInteractWithChecklist || isSubmitting} />
                    <ChecklistItem id="item5" label="Legal & Compliance Concurrence obtained." checked={internalReviewChecklist.item5} onChange={handleChecklistItemChange} disabled={!canInteractWithChecklist || isSubmitting} />
                    {currentLicenseAction?.actionType === 'Suspend License' && (<ChecklistItem id="item6_suspend" label="Suspension Duration & Conditions defined." checked={internalReviewChecklist.item6_suspend} onChange={handleChecklistItemChange} disabled={!canInteractWithChecklist || isSubmitting} />)}
                    {currentLicenseAction?.actionType === 'Lift Suspension' && (<ChecklistItem id="item6_lift" label="Verification of Rectification complete." checked={internalReviewChecklist.item6_lift} onChange={handleChecklistItemChange} disabled={!canInteractWithChecklist || isSubmitting} />)}
                    {/* MODIFICATION START: Added checklist item for Revoke License */}
                    {currentLicenseAction?.actionType === 'Revoke License' && (
                        <ChecklistItem
                            id="item6_revoke"
                            label="Final Notification Procedures for Revocation Confirmed."
                            checked={internalReviewChecklist.item6_revoke || false} // Ensure it defaults to false if not present
                            onChange={handleChecklistItemChange}
                            disabled={!canInteractWithChecklist || isSubmitting}
                        />
                    )}
                    {/* MODIFICATION END */}
                </div>
                {!canInteractWithChecklist && currentLicenseAction?.status !== 'Draft' && (<p className="mt-4 text-sm text-gray-500 italic">Checklist is read-only (Status: {currentLicenseAction?.status}).</p>)}
            </div>
        );
    };

    const renderCommentsNotesTab = () => {
        const canAddNotes = currentLicenseAction?.status === 'Draft' || currentLicenseAction?.status === 'Pending Review' || currentLicenseAction?.status === 'Awaiting Decision';
        return (
            <div className="min-h-[200px]">
                <SectionTitle title="Internal Comments & Notes (for this Action)" />
                {canAddNotes && (
                    <div className="mb-6 p-4 bg-gray-50 border border-dashed rounded-md">
                        <label htmlFor="newNoteText" className="block text-sm font-medium text-gray-700 mb-1">Add New Note:</label>
                        <textarea id="newNoteText" value={newNoteText} onChange={(e) => setNewNoteText(e.target.value)} rows="3"
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="Type your internal note here..." disabled={isSubmitting} />
                        <button onClick={handleAddNote} disabled={isSubmitting || !newNoteText.trim()}
                            className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:bg-gray-300 transition-colors">
                            Add Note
                        </button>
                    </div>
                )}
                {actionNotesWithStaffNames.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {actionNotesWithStaffNames.map(note => (<NoteItem key={note.noteId} note={note} staffName={note.staffName} />))}
                    </div>
                ) : (<p className="text-sm text-gray-500 italic">No internal notes added for this action yet.</p>)}
            </div>
        );
    };

    const renderDecisionSection = () => {
        if (!currentLicenseAction || (currentLicenseAction.status !== 'Pending Review' && currentLicenseAction.status !== 'Awaiting Decision')) return null;
        return (
            <div className="mt-8 pt-6 border-t border-gray-200">
                <SectionTitle title="Process Decision" />
                <div className="space-y-4 max-w-xl">
                    <div>
                        <label htmlFor="decisionOutcome" className="block text-sm font-medium text-gray-700">Decision Outcome <span className="text-red-500">*</span></label>
                        <select id="decisionOutcome" value={decisionOutcome} onChange={(e) => setDecisionOutcome(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            disabled={isSubmitting}>
                            <option value="">-- Select Decision --</option>
                            {decisionOutcomesOptions.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="decisionNotes" className="block text-sm font-medium text-gray-700">Decision Notes / Rationale <span className="text-red-500">*</span></label>
                        <textarea id="decisionNotes" value={decisionNotes} onChange={(e) => setDecisionNotes(e.target.value)} rows="3"
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Provide notes for the decision..." disabled={isSubmitting} />
                    </div>
                    <button onClick={handleProcessDecision}
                        disabled={isSubmitting || !decisionOutcome || !decisionNotes.trim()}
                        className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500 disabled:opacity-50">
                        Process and Finalize Decision
                    </button>
                </div>
            </div>
        );
    };

    if (isLoading) return <div className="p-6 text-center text-gray-600 text-lg">Loading...</div>;
    if (error) return <div className="p-6 text-center text-red-700 bg-red-100 rounded-md shadow-md">Error: {error} {onBackToList && <button onClick={onBackToList} className="ml-4 px-3 py-1.5 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded">Go Back</button>}</div>;
    if (!license || !currentLicenseAction) return <div className="p-6 text-center text-gray-500">Required license or action data is not available. {onBackToList && <button onClick={onBackToList} className="ml-2 text-sm text-blue-600 hover:underline">Go Back</button>}</div>;
    
    const canEditActionDetails = currentLicenseAction.status === 'Draft';

    return (
        <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
            <div className="mb-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                        License Action: <span className="text-blue-600">{currentLicenseAction.actionType || actionType}</span>
                    </h1>
                    {onBackToList && (
                        <button onClick={onBackToList} className="text-sm text-blue-600 hover:text-blue-800">
                            &larr; Back to Dashboard
                        </button>
                    )}
                </div>
                <div className="mt-2 p-4 bg-white rounded-lg shadow-sm border">
                    <InfoRow label="License Number" value={license.licenseNumber} />
                    <InfoRow label="Company Name" value={entity?.companyName} />
                    <InfoRow label="License Type" value={product?.licenseTypeRequired} />
                    <InfoRow label="Current License Status">
                         <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                            license.licenseStatus === 'Active' ? 'bg-green-100 text-green-700' : 
                            license.licenseStatus === 'Suspended' ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-700' 
                         }`}>{license.licenseStatus}</span>
                    </InfoRow>
                    <InfoRow label="Action Initiated By" value={currentLicenseAction.initiatingStaffId} />
                    <InfoRow label="Action Creation Date" value={formatDate(currentLicenseAction.creationDate, true)} />
                    <InfoRow label="Action Last Updated" value={currentLicenseAction.lastUpdated ? formatDate(currentLicenseAction.lastUpdated, true) : 'N/A'} />
                    <InfoRow label="Action Status"><span className="font-medium">{currentLicenseAction.status}</span></InfoRow>
                </div>
            </div>

            <div className="mb-6 border-b border-gray-300">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {['ACTION_DETAILS', 'INTERNAL_REVIEW', 'COMMENTS_NOTES'].map(tabName => (
                        <button key={tabName} onClick={() => setActiveTab(tabName)}
                            className={`${activeTab === tabName ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none`}
                            disabled={isSubmitting}>
                            {tabName.replace('_', ' ')}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="bg-white p-6 shadow-lg rounded-xl">
                {activeTab === 'ACTION_DETAILS' && renderActionDetailsTab()}
                {activeTab === 'INTERNAL_REVIEW' && renderInternalReviewTab()}
                {activeTab === 'COMMENTS_NOTES' && renderCommentsNotesTab()}
                
                {renderDecisionSection()}

                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-3">
                     {currentLicenseAction.status === 'Draft' && (
                        <>
                            <button onClick={handleSaveDraft} disabled={isSubmitting}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 disabled:opacity-50">
                                Save Draft
                            </button>
                            <button onClick={handleSubmitForReview}
                                disabled={isSubmitting || !reasonCategory || !reasonDetails.trim()}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 disabled:opacity-50">
                                Submit for Review
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LicenseActionPage;