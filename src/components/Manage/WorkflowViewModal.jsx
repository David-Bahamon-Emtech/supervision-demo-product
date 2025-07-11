// src/components/Manage/WorkflowViewModal.js
import React from 'react';
import regulatorStaff from '../../data/regulatorStaff.js';

const WorkflowViewModal = ({ isOpen, onClose, onApprove, workflow, currentUser }) => {
  if (!isOpen || !workflow) return null;

  const getStatusClass = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-200 text-green-800';
      case 'Pending Approval': return 'bg-blue-200 text-blue-800';
      case 'Suspended': return 'bg-orange-200 text-orange-800';
      case 'Draft':
      default: return 'bg-yellow-200 text-yellow-800';
    }
  };

  const staffMap = regulatorStaff.reduce((map, staff) => {
    map[staff.staffId] = staff.name;
    return map;
  }, {});

  const requiredApproverNames = workflow.requiredApprovers.map(id => staffMap[id] || id);
  const existingApprovalIds = workflow.approvals.map(app => app.staffId);
  const awaitingApprovalNames = workflow.requiredApprovers
    .filter(id => !existingApprovalIds.includes(id))
    .map(id => staffMap[id] || id);

  const canApprove =
    workflow.status === 'Pending Approval' &&
    workflow.requiredApprovers.includes(currentUser?.staffId) &&
    !existingApprovalIds.includes(currentUser?.staffId);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
      <div className="bg-theme-bg-secondary rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-theme-border">
        {/* Header */}
        <div className="px-6 py-4 border-b border-theme-border flex justify-between items-center">
          <h3 className="text-lg font-semibold text-theme-text-primary">{workflow.name}</h3>
          <button onClick={onClose} className="text-theme-text-secondary hover:text-white text-2xl font-bold focus:outline-none">×</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Details Section */}
          <div>
            <h4 className="text-sm font-medium text-theme-text-secondary">Status</h4>
            <p className="mt-1">
              <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${getStatusClass(workflow.status)}`}>
                {workflow.status}
              </span>
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-theme-text-secondary">Description</h4>
            <p className="mt-1 text-sm text-theme-text-primary">{workflow.description || 'No description provided.'}</p>
          </div>

          {/* Stages Section */}
          <div>
            <h4 className="text-sm font-medium text-theme-text-secondary mb-2">Stages</h4>
            <ul className="border border-theme-border rounded-md divide-y divide-theme-border">
              {workflow.stages.length > 0 ? workflow.stages.map((stage, index) => (
                <li key={index} className="px-4 py-3 grid grid-cols-3 gap-4 hover:bg-theme-bg">
                  <span className="text-sm font-medium text-theme-text-primary">{stage.name}</span>
                  <span className="text-sm text-theme-text-secondary">Role: {stage.assignedToRole}</span>
                  <span className="text-sm text-theme-text-secondary">SLA: {stage.slaDays} days</span>
                </li>
              )) : <li className="px-4 py-3 text-sm text-theme-text-secondary italic">No stages defined.</li>}
            </ul>
          </div>
          
          {/* Approval Status Section */}
          <div>
            <h4 className="text-sm font-medium text-theme-text-secondary mb-2">Approval Status</h4>
            <div className="bg-theme-bg p-4 rounded-md border border-theme-border grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-xs font-semibold text-theme-text-secondary uppercase mb-2">Required Approvers</h5>
                <ul className="text-sm list-disc list-inside space-y-1 text-theme-text-primary">
                  {requiredApproverNames.map(name => <li key={name}>{name}</li>)}
                </ul>
              </div>
              <div>
                 <h5 className="text-xs font-semibold text-theme-text-secondary uppercase mb-2">Approvals Received</h5>
                 {workflow.approvals.length > 0 ? (
                    <ul className="text-sm list-disc list-inside space-y-1 text-theme-text-primary">
                      {workflow.approvals.map(app => (
                        <li key={app.staffId}>
                          <span className="font-medium">{staffMap[app.staffId]}</span> <span className="text-theme-text-secondary">on {formatDate(app.date)}</span>
                        </li>
                      ))}
                    </ul>
                 ) : <p className="text-sm text-theme-text-secondary italic">No approvals yet.</p>}
                 {awaitingApprovalNames.length > 0 && workflow.status === 'Pending Approval' && (
                    <p className="text-xs text-blue-400 mt-2">Awaiting approval from: {awaitingApprovalNames.join(', ')}</p>
                 )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-theme-border flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-theme-text-primary bg-gray-700 border border-transparent rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-bg-secondary focus:ring-gray-500">
            Close
          </button>
          {canApprove && (
            <button
              onClick={() => onApprove(workflow.id)}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-bg-secondary focus:ring-green-500"
            >
              Approve Workflow
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowViewModal;