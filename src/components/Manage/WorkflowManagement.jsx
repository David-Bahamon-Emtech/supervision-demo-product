// src/components/Manage/WorkflowManagement.js
import React, { useState, useContext } from 'react';
import { WorkflowContext } from '../../context/WorkflowContext.jsx';
import WorkflowEditorModal from './WorkflowEditorModal.jsx';
import WorkflowViewModal from './WorkflowViewModal.jsx'; // Import the new View Modal
import regulatorStaff from '../../data/regulatorStaff.js';

// --- Icon Components (No changes here) ---
const IconView = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639l4.433-7.467a1.012 1.012 0 011.616 0l4.433 7.467a1.012 1.012 0 010 .639l-4.433 7.467a1.012 1.012 0 01-1.616 0l-4.433-7.467z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const IconEdit = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>;
const IconDelete = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09 1.02-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>;
const IconRequestApproval = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconSuspend = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9v6m-4.5 0V9M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconReactivate = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></svg>;

const ActionButton = ({ icon, onClick, disabled, label, activeColor }) => (
  <div className="relative flex items-center group">
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={label}
      className={`p-1 rounded-full transition-colors duration-200 
        ${disabled 
          ? 'text-gray-300 cursor-not-allowed' 
          : `${activeColor} hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400`
        }`}
    >
      {icon}
    </button>
    <div
      className="absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap 
                 rounded bg-gray-800 px-2 py-1 text-xs text-white 
                 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none"
    >
      {label}
    </div>
  </div>
);


const WorkflowManagement = () => {
  const { 
    workflows, 
    addWorkflow, 
    updateWorkflow, 
    deleteWorkflow, 
    updateWorkflowStatus,
    approveWorkflow // Get the approveWorkflow function from context
  } = useContext(WorkflowContext);

  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [workflowToEdit, setWorkflowToEdit] = useState(null);
  
  const [isViewModalOpen, setIsViewModalOpen] = useState(false); // State for View Modal
  const [workflowToView, setWorkflowToView] = useState(null);   // State for workflow to view

  const [currentUser, setCurrentUser] = useState(regulatorStaff[0]);

  // --- Editor Modal Handlers ---
  const handleOpenCreateModal = () => {
    setWorkflowToEdit(null);
    setIsEditorModalOpen(true);
  };

  const handleOpenEditModal = (workflow) => {
    setWorkflowToEdit(workflow);
    setIsEditorModalOpen(true);
  };

  const handleCloseEditorModal = () => {
    setIsEditorModalOpen(false);
    setWorkflowToEdit(null);
  };

  const handleSaveWorkflow = (workflowData) => {
    if (workflowToEdit && workflowToEdit.id) {
      updateWorkflow(workflowToEdit.id, workflowData);
    } else {
      addWorkflow(workflowData);
    }
    handleCloseEditorModal();
  };

  // --- View Modal Handlers ---
  const handleOpenViewModal = (workflow) => {
    setWorkflowToView(workflow);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setWorkflowToView(null);
  };

  const handleApproveWorkflowAction = (workflowId) => {
    if (currentUser) {
      approveWorkflow(workflowId, currentUser.staffId);
      // Optionally, close the modal or refresh data if needed,
      // though context update should re-render the table.
      // We might want to close the view modal to show the status change in the table immediately.
      handleCloseViewModal(); 
    } else {
      alert("No current user selected to perform approval.");
    }
  };

  // --- Action Handlers ---
  const handleDelete = (workflowId) => {
    if (window.confirm('Are you sure you want to delete this workflow? This action cannot be undone.')) {
      deleteWorkflow(workflowId);
    }
  };

  const handleRequestApproval = (workflowId) => {
    updateWorkflowStatus(workflowId, 'Pending Approval');
  };

  const handleSuspend = (workflowId) => {
    updateWorkflowStatus(workflowId, 'Suspended');
  };
  
  const handleReactivate = (workflowId) => {
    updateWorkflowStatus(workflowId, 'Active');
  };
  
  const getStatusClass = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Pending Approval': return 'bg-blue-100 text-blue-800';
      case 'Suspended': return 'bg-orange-100 text-orange-800';
      case 'Draft':
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Workflow Management</h2>
      <p className="text-gray-600 mb-6">
        Define, view, and manage application and operational workflows.
      </p>

      <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center space-x-4">
        <label htmlFor="user-switcher" className="text-sm font-medium text-gray-700">Simulate Logged-In User:</label>
        <select
          id="user-switcher"
          value={currentUser.staffId}
          onChange={(e) => setCurrentUser(regulatorStaff.find(s => s.staffId === e.target.value) || regulatorStaff[0])}
          className="p-2 border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
        >
          {regulatorStaff.map(staff => (
            <option key={staff.staffId} value={staff.staffId}>
              {staff.name} ({staff.role})
            </option>
          ))}
        </select>
        <p className="text-sm text-gray-600">(Use this to test the approval process.)</p>
      </div>

      <div className="mb-6">
        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
        >
          Create New Workflow
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Workflow Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {workflows.map((wf) => {
              const canEdit = ['Draft', 'Suspended'].includes(wf.status);
              const canDelete = ['Draft', 'Suspended'].includes(wf.status);
              const canRequestApproval = wf.status === 'Draft';
              const canSuspend = wf.status === 'Active';
              const canReactivate = wf.status === 'Suspended';

              return (
                <tr key={wf.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{wf.name}</td>
                  <td className="px-6 py-4 whitespace-normal text-sm text-gray-500 max-w-md">{wf.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(wf.status)}`}>
                      {wf.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                    <div className="flex items-center space-x-1">
                      <ActionButton 
                        icon={<IconView />} 
                        onClick={() => handleOpenViewModal(wf)} // Updated onClick
                        disabled={false} // View button is always enabled
                        label="View Workflow Details" 
                        activeColor="text-gray-500 hover:text-gray-800" 
                      />
                      <ActionButton icon={<IconEdit />} onClick={() => handleOpenEditModal(wf)} disabled={!canEdit} label="Edit Workflow" activeColor="text-blue-600" />
                      <ActionButton icon={<IconRequestApproval />} onClick={() => handleRequestApproval(wf.id)} disabled={!canRequestApproval} label="Request Approval" activeColor="text-green-500" />
                      <ActionButton icon={<IconSuspend />} onClick={() => handleSuspend(wf.id)} disabled={!canSuspend} label="Suspend Workflow" activeColor="text-orange-500" />
                      <ActionButton icon={<IconReactivate />} onClick={() => handleReactivate(wf.id)} disabled={!canReactivate} label="Reactivate Workflow" activeColor="text-green-600" />
                      <ActionButton icon={<IconDelete />} onClick={() => handleDelete(wf.id)} disabled={!canDelete} label="Delete Workflow" activeColor="text-red-600" />
                    </div>
                  </td>
                </tr>
              );
            })}
            {workflows.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                  No workflows defined yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <WorkflowEditorModal
        isOpen={isEditorModalOpen}
        onClose={handleCloseEditorModal}
        onSave={handleSaveWorkflow}
        workflowToEdit={workflowToEdit}
      />

      <WorkflowViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        workflow={workflowToView}
        currentUser={currentUser}
        onApprove={handleApproveWorkflowAction}
      />
    </div>
  );
};

export default WorkflowManagement;