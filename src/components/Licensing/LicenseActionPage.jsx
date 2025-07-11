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
    getStaffById
} from './licensingService.js';
import { predefinedSuspensionReasons, predefinedLiftSuspensionReasons, predefinedRevocationReasons } from '../../data/licenseActions.js';

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
      <dt className="text-sm font-medium text-theme-text-secondary">{label}</dt>
      <dd className="mt-1 text-sm text-theme-text-primary sm:mt-0 sm:col-span-2 break-words">
        {children || value || 'N/A'}
      </dd>
    </div>
);

const SectionTitle = ({ title }) => (
    <h3 className="text-lg leading-6 font-semibold text-theme-text-primary mb-4 mt-6 pb-2 border-b border-theme-border">
      {title}
    </h3>
);

const ChecklistItem = ({ id, label, checked, onChange, disabled }) => (
    <div className="flex items-center py-2 border-b border-theme-border last:border-b-0">
        <input
            id={id}
            name={id}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="h-4 w-4 text-blue-500 bg-theme-bg border-gray-500 rounded focus:ring-blue-500 disabled:opacity-75"
        />
        <label htmlFor={id} className={`ml-3 block text-sm ${checked && !disabled ? 'text-theme-text-secondary line-through' : 'text-theme-text-primary'} ${disabled ? 'text-gray-500' : ''}`}>
            {label}
        </label>
    </div>
);

const FileLink = ({ document }) => {
    if (!document) return <div className="py-1 text-sm text-theme-text-secondary italic">Document not found.</div>;
    return (
        <div className="py-1.5 flex items-center group border-b border-theme-border last:border-b-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-theme-text-secondary group-hover:text-theme-accent transition-colors duration-150 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <a href={document.dummyFileContentLink || '#'} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-theme-accent hover:underline truncate flex-grow" title={document.fileName}>
                {document.fileName || 'Unnamed Document'}
            </a>
            {document.documentType && <span className="ml-2 text-xs text-theme-text-secondary group-hover:text-theme-text-primary whitespace-nowrap">({document.documentType})</span>}
        </div>
    );
};

const NoteItem = ({ note, staffName }) => {
    return (
        <div className="py-3 px-4 bg-theme-bg rounded-md border border-theme-border mb-3 shadow-sm">
            <p className="text-sm text-theme-text-primary whitespace-pre-wrap">{note.text}</p>
            <div className="mt-2 text-xs text-theme-text-secondary flex justify-between items-center">
                <span>
                    Added by: <span className="font-medium text-theme-text-primary">{staffName || note.staffId}</span>
                </span>
                <span>{formatDate(note.date, true)}</span>
            </div>
        </div>
    );
};

const SuspendedLicenseWarning = ({ statusReason }) => (
    <div className="my-6 p-4 bg-orange-900 bg-opacity-30 border-l-4 border-orange-500 text-orange-200">
        <div className="flex">
            <div className="py-1">
                <svg className="fill-current h-6 w-6 text-orange-400 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM9 5v6h2V5H9zm0 8v2h2v-2H9z"/>
                </svg>
            </div>
            <div>
                <p className="font-bold">License Suspended</p>
                <p className="text-sm">{statusReason || "This license is currently suspended. Renewal actions are unavailable."}</p>
            </div>
        </div>
    </div>
);


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

    const initialChecklistState = useMemo(() => ({ item1: false, item2: false, item3: false, item4: false, item5: false, item6_suspend: false, item6_lift: false, item6_revoke: false }), []);
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

    const reasonsList = useMemo(() => {
        const type = currentLicenseAction?.actionType || actionType;
        if (type === 'Suspend License') return predefinedSuspensionReasons;
        if (type === 'Lift Suspension') return predefinedLiftSuspensionReasons;
        if (type === 'Revoke License') return predefinedRevocationReasons;
        return [];
    }, [currentLicenseAction?.actionType, actionType]);

    const decisionOutcomesOptions = useMemo(() => {
        const type = currentLicenseAction?.actionType || actionType;
        if (type === 'Suspend License') return ["Proceed with Suspension", "Reject Suspension Request"];
        if (type === 'Lift Suspension') return ["Proceed with Lifting Suspension", "Reject Lift Suspension Request"];
        if (type === 'Revoke License') return ["Proceed with Revocation", "Reject Revocation Request"];
        return [];
    }, [currentLicenseAction?.actionType, actionType]);

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
                        internalReviewChecklistData: { ...initialChecklistState },
                    };
                    setCurrentLicenseAction(newActionDraft);
                    setInternalReviewChecklist({ ...initialChecklistState });
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
                } else if (currentLicenseAction.actionType === 'Revoke License') {
                    newLicenseStatus = 'Revoked';
                    licenseStatusReason = `Revoked: ${actionReasonCat} - ${actionReasonDet}. Ref: ${updatedAction.actionId}`;
                }

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
        if (!currentLicenseAction) return <p className="text-theme-text-secondary">Initializing action details...</p>;
        const currentActionTypeForDisplay = currentLicenseAction.actionType || actionType;
        const canEditDetails = currentLicenseAction.status === 'Draft';
        return (
            <div className="space-y-6">
                <InfoRow label="Action Type"><span className="font-semibold">{currentActionTypeForDisplay}</span></InfoRow>
                <InfoRow label="Original License Status" value={currentLicenseAction.originalLicenseStatus} />
                <div>
                    <label htmlFor="reasonCategory" className="block text-sm font-medium text-theme-text-secondary">Reason Category <span className="text-red-500">*</span></label>
                    <select id="reasonCategory" value={reasonCategory} onChange={(e) => setReasonCategory(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-theme-bg border-theme-border focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        disabled={isSubmitting || !canEditDetails}>
                        <option value="">-- Select a Reason --</option>
                        {reasonsList.map(reason => (<option key={reason} value={reason}>{reason}</option>))}
                    </select>
                </div>
                <div>
                    <label htmlFor="reasonDetails" className="block text-sm font-medium text-theme-text-secondary">Reason Details / Justification <span className="text-red-500">*</span></label>
                    <textarea id="reasonDetails" value={reasonDetails} onChange={(e) => setReasonDetails(e.target.value)} rows="4"
                        className="mt-1 block w-full p-2 bg-theme-bg border border-theme-border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder={`Provide detailed reasons for ${currentActionTypeForDisplay?.toLowerCase()}...`}
                        disabled={isSubmitting || !canEditDetails} />
                </div>
                <div>
                    <SectionTitle title="Supporting Documents" />
                    {canEditDetails && (
                        <div className="mb-4 p-3 bg-theme-bg border border-dashed border-gray-600 rounded-md">
                            <label htmlFor="newDocumentIdInput" className="block text-sm font-medium text-theme-text-secondary mb-1">Add Document ID (e.g., doc_001):</label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <input type="text" id="newDocumentIdInput" value={newDocumentIdInput} onChange={(e) => setNewDocumentIdInput(e.target.value)}
                                    placeholder="Enter known document ID"
                                    className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm bg-theme-bg border-theme-border p-2"
                                    disabled={isSubmitting} />
                                <button onClick={handleAddDocumentId} disabled={isSubmitting || !newDocumentIdInput.trim()}
                                    className="inline-flex items-center px-3 py-2 border border-l-0 border-theme-border bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-r-md text-sm font-medium disabled:bg-gray-800 disabled:text-gray-500">
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
                                            className="ml-3 text-red-500 hover:text-red-400 text-xs p-1 opacity-50 group-hover:opacity-100 transition-opacity" title="Remove Document">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (<p className="text-sm text-theme-text-secondary italic">No supporting documents added.</p>)}
                </div>
            </div>
        );
    };

    const renderInternalReviewTab = () => {
        const canInteractWithChecklist = currentLicenseAction?.status === 'Draft' || currentLicenseAction?.status === 'Pending Review';
        let checklistTitle = "Internal Review Checklist";
        if (currentLicenseAction?.actionType === 'Suspend License') checklistTitle = "Pre-Suspension Review";
        else if (currentLicenseAction?.actionType === 'Lift Suspension') checklistTitle = "Pre-Lifting Suspension Review";
        else if (currentLicenseAction?.actionType === 'Revoke License') checklistTitle = "Pre-Revocation Review";

        return (
            <div className="min-h-[200px]">
                <SectionTitle title={checklistTitle} />
                <div className="space-y-3 p-4 bg-theme-bg rounded-md border border-theme-border">
                    <ChecklistItem id="item1" label="Justification & Reasonableness check complete." checked={internalReviewChecklist.item1} onChange={handleChecklistItemChange} disabled={!canInteractWithChecklist || isSubmitting} />
                    <ChecklistItem id="item2" label="Evidence Review check complete." checked={internalReviewChecklist.item2} onChange={handleChecklistItemChange} disabled={!canInteractWithChecklist || isSubmitting} />
                    <ChecklistItem id="item3" label="Impact Assessment check complete." checked={internalReviewChecklist.item3} onChange={handleChecklistItemChange} disabled={!canInteractWithChecklist || isSubmitting} />
                    <ChecklistItem id="item4" label="Communication Plan (if applicable) reviewed." checked={internalReviewChecklist.item4} onChange={handleChecklistItemChange} disabled={!canInteractWithChecklist || isSubmitting} />
                    <ChecklistItem id="item5" label="Legal & Compliance Concurrence obtained." checked={internalReviewChecklist.item5} onChange={handleChecklistItemChange} disabled={!canInteractWithChecklist || isSubmitting} />
                    {currentLicenseAction?.actionType === 'Suspend License' && (<ChecklistItem id="item6_suspend" label="Suspension Duration & Conditions defined." checked={internalReviewChecklist.item6_suspend} onChange={handleChecklistItemChange} disabled={!canInteractWithChecklist || isSubmitting} />)}
                    {currentLicenseAction?.actionType === 'Lift Suspension' && (<ChecklistItem id="item6_lift" label="Verification of Rectification complete." checked={internalReviewChecklist.item6_lift} onChange={handleChecklistItemChange} disabled={!canInteractWithChecklist || isSubmitting} />)}
                    {currentLicenseAction?.actionType === 'Revoke License' && (
                        <ChecklistItem
                            id="item6_revoke"
                            label="Final Notification Procedures for Revocation Confirmed."
                            checked={internalReviewChecklist.item6_revoke || false}
                            onChange={handleChecklistItemChange}
                            disabled={!canInteractWithChecklist || isSubmitting}
                        />
                    )}
                </div>
                {!canInteractWithChecklist && currentLicenseAction?.status !== 'Draft' && (<p className="mt-4 text-sm text-theme-text-secondary italic">Checklist is read-only (Status: {currentLicenseAction?.status}).</p>)}
            </div>
        );
    };

    const renderCommentsNotesTab = () => {
        const canAddNotes = currentLicenseAction?.status === 'Draft' || currentLicenseAction?.status === 'Pending Review' || currentLicenseAction?.status === 'Awaiting Decision';
        return (
            <div className="min-h-[200px]">
                <SectionTitle title="Internal Comments & Notes (for this Action)" />
                {canAddNotes && (
                    <div className="mb-6 p-4 bg-theme-bg border border-dashed border-gray-600 rounded-md">
                        <label htmlFor="newNoteText" className="block text-sm font-medium text-theme-text-secondary mb-1">Add New Note:</label>
                        <textarea id="newNoteText" value={newNoteText} onChange={(e) => setNewNoteText(e.target.value)} rows="3"
                            className="w-full p-2 bg-theme-bg border border-theme-border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="Type your internal note here..." disabled={isSubmitting} />
                        <button onClick={handleAddNote} disabled={isSubmitting || !newNoteText.trim()}
                            className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:bg-gray-700 transition-colors">
                            Add Note
                        </button>
                    </div>
                )}
                {actionNotesWithStaffNames.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {actionNotesWithStaffNames.map(note => (<NoteItem key={note.noteId} note={note} staffName={note.staffName} />))}
                    </div>
                ) : (<p className="text-sm text-theme-text-secondary italic">No internal notes added for this action yet.</p>)}
            </div>
        );
    };

    const renderDecisionSection = () => {
        if (!currentLicenseAction || (currentLicenseAction.status !== 'Pending Review' && currentLicenseAction.status !== 'Awaiting Decision')) return null;
        return (
            <div className="mt-8 pt-6 border-t border-theme-border">
                <SectionTitle title="Process Decision" />
                <div className="space-y-4 max-w-xl">
                    <div>
                        <label htmlFor="decisionOutcome" className="block text-sm font-medium text-theme-text-secondary">Decision Outcome <span className="text-red-500">*</span></label>
                        <select id="decisionOutcome" value={decisionOutcome} onChange={(e) => setDecisionOutcome(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-theme-bg border-theme-border focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            disabled={isSubmitting}>
                            <option value="">-- Select Decision --</option>
                            {decisionOutcomesOptions.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="decisionNotes" className="block text-sm font-medium text-theme-text-secondary">Decision Notes / Rationale <span className="text-red-500">*</span></label>
                        <textarea id="decisionNotes" value={decisionNotes} onChange={(e) => setDecisionNotes(e.target.value)} rows="3"
                            className="mt-1 block w-full p-2 bg-theme-bg border border-theme-border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Provide notes for the decision..." disabled={isSubmitting} />
                    </div>
                    <button onClick={handleProcessDecision}
                        disabled={isSubmitting || !decisionOutcome || !decisionNotes.trim()}
                        className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-theme-bg-secondary focus:ring-green-500 disabled:opacity-50">
                        Process and Finalize Decision
                    </button>
                </div>
            </div>
        );
    };

    if (isLoading) return <div className="p-6 text-center text-theme-text-secondary text-lg">Loading...</div>;
    if (error) return <div className="p-6 text-center text-red-400 bg-red-900 bg-opacity-20 rounded-md shadow-md">Error: {error} {onBackToList && <button onClick={onBackToList} className="ml-4 px-3 py-1.5 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded">Go Back</button>}</div>;
    if (!license || !currentLicenseAction) return <div className="p-6 text-center text-theme-text-secondary">Required license or action data is not available. {onBackToList && <button onClick={onBackToList} className="ml-2 text-sm text-blue-400 hover:underline">Go Back</button>}</div>;

    const canEditActionDetails = currentLicenseAction.status === 'Draft';

    return (
        <div className="p-4 md:p-6 bg-theme-bg min-h-screen">
            <div className="mb-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl sm:text-3xl font-bold text-theme-text-primary">
                        License Action: <span className="text-blue-400">{currentLicenseAction.actionType || actionType}</span>
                    </h1>
                    {onBackToList && (
                        <button onClick={onBackToList} className="text-sm text-blue-400 hover:text-theme-accent">
                            &larr; Back to Dashboard
                        </button>
                    )}
                </div>
                <div className="mt-2 p-4 bg-theme-bg-secondary rounded-lg shadow-sm border border-theme-border">
                    <InfoRow label="License Number" value={license.licenseNumber} />
                    <InfoRow label="Company Name" value={entity?.companyName} />
                    <InfoRow label="License Type" value={product?.licenseTypeRequired} />
                    <InfoRow label="Current License Status">
                         <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                            license.licenseStatus === 'Active' ? 'bg-green-200 text-green-800' :
                            license.licenseStatus === 'Suspended' ? 'bg-orange-200 text-orange-800' :
                            'bg-gray-200 text-gray-800'
                         }`}>{license.licenseStatus}</span>
                    </InfoRow>
                    <InfoRow label="Action Initiated By" value={currentLicenseAction.initiatingStaffId} />
                    <InfoRow label="Action Creation Date" value={formatDate(currentLicenseAction.creationDate, true)} />
                    <InfoRow label="Action Last Updated" value={currentLicenseAction.lastUpdated ? formatDate(currentLicenseAction.lastUpdated, true) : 'N/A'} />
                    <InfoRow label="Action Status"><span className="font-medium text-theme-text-primary">{currentLicenseAction.status}</span></InfoRow>
                </div>
            </div>

            <div className="mb-6 border-b border-theme-border">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {['ACTION_DETAILS', 'INTERNAL_REVIEW', 'COMMENTS_NOTES'].map(tabName => (
                        <button key={tabName} onClick={() => setActiveTab(tabName)}
                            className={`${activeTab === tabName ? 'border-theme-accent text-theme-accent' : 'border-transparent text-theme-text-secondary hover:text-theme-text-primary hover:border-gray-500'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none`}
                            disabled={isSubmitting}>
                            {tabName.replace('_', ' ')}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="bg-theme-bg-secondary p-6 shadow-lg rounded-xl border border-theme-border">
                {activeTab === 'ACTION_DETAILS' && renderActionDetailsTab()}
                {activeTab === 'INTERNAL_REVIEW' && renderInternalReviewTab()}
                {activeTab === 'COMMENTS_NOTES' && renderCommentsNotesTab()}

                {renderDecisionSection()}

                <div className="mt-8 pt-6 border-t border-theme-border flex justify-end space-x-3">
                     {currentLicenseAction.status === 'Draft' && (
                        <>
                            <button onClick={handleSaveDraft} disabled={isSubmitting}
                                className="px-4 py-2 text-sm font-medium text-theme-text-primary bg-gray-700 hover:bg-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-bg-secondary focus:ring-gray-500 disabled:opacity-50">
                                Save Draft
                            </button>
                            <button onClick={handleSubmitForReview}
                                disabled={isSubmitting || !reasonCategory || !reasonDetails.trim()}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-bg-secondary focus:ring-blue-500 disabled:opacity-50">
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