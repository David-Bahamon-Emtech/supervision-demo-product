// src/components/Manage/WorkflowEditorModal.js
import React, { useState, useEffect } from 'react';
import regulatorStaff from '../../data/regulatorStaff.js'; // To populate the approvers list

const WorkflowEditorModal = ({ isOpen, onClose, onSave, workflowToEdit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [stages, setStages] = useState([]);
  const [requiredApprovers, setRequiredApprovers] = useState([]);
  const [error, setError] = useState('');

  const isEditing = workflowToEdit !== null;

  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
        setName(workflowToEdit.name || '');
        setDescription(workflowToEdit.description || '');
        setStages(workflowToEdit.stages || []);
        setRequiredApprovers(workflowToEdit.requiredApprovers || []);
      } else {
        // Reset form for creation
        setName('');
        setDescription('');
        setStages([{ id: `new_${Date.now()}`, name: '', assignedToRole: '', slaDays: '' }]);
        setRequiredApprovers([]);
      }
      setError('');
    }
  }, [isOpen, workflowToEdit, isEditing]);

  const handleStageChange = (index, field, value) => {
    const newStages = [...stages];
    newStages[index][field] = value;
    setStages(newStages);
  };

  const handleAddStage = () => {
    setStages([...stages, { id: `new_${Date.now()}`, name: '', assignedToRole: '', slaDays: '' }]);
  };

  const handleRemoveStage = (index) => {
    if (stages.length > 1) {
      const newStages = stages.filter((_, i) => i !== index);
      setStages(newStages);
    }
  };

  const handleApproverChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setRequiredApprovers(selectedOptions);
  };

  const handleSave = () => {
    if (!name.trim()) {
      setError('Workflow Name is required.');
      return;
    }
    setError('');

    const finalStages = stages.map(({ id, ...stage }) => stage); // Remove temporary 'id' from new stages

    const workflowData = {
      name,
      description,
      stages: finalStages,
      requiredApprovers,
    };

    onSave(workflowData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            {isEditing ? 'Edit Workflow' : 'Create New Workflow'}
          </h3>
        </div>

        {/* Content - Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label htmlFor="workflow-name" className="block text-sm font-medium text-gray-700">Workflow Name <span className="text-red-500">*</span></label>
              <input type="text" id="workflow-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label htmlFor="workflow-description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea id="workflow-description" value={description} onChange={(e) => setDescription(e.target.value)} rows="3" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"></textarea>
            </div>
          </div>

          {/* Stages */}
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-2">Stages</h4>
            <div className="space-y-3 bg-gray-50 p-4 rounded-md border">
              {stages.map((stage, index) => (
                <div key={stage.id} className="grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-4">
                    <label className="text-xs text-gray-600">Stage Name</label>
                    <input type="text" value={stage.name} onChange={(e) => handleStageChange(index, 'name', e.target.value)} placeholder="e.g., Initial Review" className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div className="col-span-4">
                    <label className="text-xs text-gray-600">Assigned Role</label>
                    <input type="text" value={stage.assignedToRole} onChange={(e) => handleStageChange(index, 'assignedToRole', e.target.value)} placeholder="e.g., Licensing Officer" className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-gray-600">SLA (Days)</label>
                    <input type="number" value={stage.slaDays} onChange={(e) => handleStageChange(index, 'slaDays', e.target.value)} placeholder="e.g., 5" className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div className="col-span-2 pt-5">
                    <button onClick={() => handleRemoveStage(index)} disabled={stages.length <= 1} className="px-2 py-1 text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <button onClick={handleAddStage} className="mt-3 px-3 py-1 text-sm text-blue-600 border border-blue-500 rounded-md hover:bg-blue-50">
                + Add Stage
              </button>
            </div>
          </div>

          {/* Approvers */}
          <div>
            <label htmlFor="workflow-approvers" className="block text-sm font-medium text-gray-700">Required Approvers</label>
            <p className="text-xs text-gray-500 mb-1">Select one or more staff members who must approve this workflow before it can become active. (Hold Ctrl/Cmd to select multiple)</p>
            <select
              id="workflow-approvers"
              multiple
              value={requiredApprovers}
              onChange={handleApproverChange}
              className="mt-1 block w-full p-2 h-32 border border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              {regulatorStaff.map(staff => (
                <option key={staff.staffId} value={staff.staffId}>{staff.name} ({staff.role})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
            Save Workflow
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkflowEditorModal;