// src/components/Manage/WorkflowViewModal.js
import React from 'react';
import regulatorStaff from '../../data/regulatorStaff.js';

const WorkflowViewModal = ({ isOpen, onClose, onApprove, workflow, currentUser }) => {
  if (!isOpen || !workflow) return null;

  const getStatusClass = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Pending Approval': return 'bg-blue-100 text-blue-800';
      case 'Suspended': return 'bg-orange-100 text-orange-800';
      case 'Draft':
      default: return 'bg-yellow-100 text-yellow-800';
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
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">{workflow.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Details Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-500">Status</h4>
            <p className="mt-1">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(workflow.status)}`}>
                {workflow.status}
              </span>
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Description</h4>
            <p className="mt-1 text-sm text-gray-900">{workflow.description || 'No description provided.'}</p>
          </div>

          {/* Stages Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Stages</h4>
            <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
              {workflow.stages.length > 0 ? workflow.stages.map((stage, index) => (
                <li key={index} className="px-4 py-3 grid grid-cols-3 gap-4">
                  <span className="text-sm font-medium text-gray-900">{stage.name}</span>
                  <span className="text-sm text-gray-600">Role: {stage.assignedToRole}</span>
                  <span className="text-sm text-gray-600">SLA: {stage.slaDays} days</span>
                </li>
              )) : <li className="px-4 py-3 text-sm text-gray-500">No stages defined.</li>}
            </ul>
          </div>
          
          {/* Approval Status Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Approval Status</h4>
            <div className="bg-gray-50 p-4 rounded-md border grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-xs font-semibold text-gray-700 uppercase mb-2">Required Approvers</h5>
                <ul className="text-sm list-disc list-inside space-y-1">
                  {requiredApproverNames.map(name => <li key={name}>{name}</li>)}
                </ul>
              </div>
              <div>
                 <h5 className="text-xs font-semibold text-gray-700 uppercase mb-2">Approvals Received</h5>
                 {workflow.approvals.length > 0 ? (
                    <ul className="text-sm list-disc list-inside space-y-1">
                      {workflow.approvals.map(app => (
                        <li key={app.staffId}>
                          <span className="font-medium">{staffMap[app.staffId]}</span> on {formatDate(app.date)}
                        </li>
                      ))}
                    </ul>
                 ) : <p className="text-sm text-gray-500">No approvals yet.</p>}
                 {awaitingApprovalNames.length > 0 && workflow.status === 'Pending Approval' && (
                    <p className="text-xs text-blue-600 mt-2">Awaiting approval from: {awaitingApprovalNames.join(', ')}</p>
                 )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Close
          </button>
          {canApprove && (
            <button
              onClick={() => onApprove(workflow.id)}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
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