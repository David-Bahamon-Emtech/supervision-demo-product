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

  const inputStyles = "mt-1 block w-full p-2 bg-theme-bg border-theme-border rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 text-theme-text-primary placeholder:text-gray-500";
  const labelStyles = "block text-sm font-medium text-theme-text-secondary";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
      <div className="bg-theme-bg-secondary rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-theme-border">
        {/* Header */}
        <div className="px-6 py-4 border-b border-theme-border">
          <h3 className="text-lg font-semibold text-theme-text-primary">
            {isEditing ? 'Edit Workflow' : 'Create New Workflow'}
          </h3>
        </div>

        {/* Content - Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && <div className="p-3 bg-red-900 bg-opacity-30 text-red-300 border border-red-500 rounded-md text-sm">{error}</div>}
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label htmlFor="workflow-name" className={labelStyles}>Workflow Name <span className="text-red-500">*</span></label>
              <input type="text" id="workflow-name" value={name} onChange={(e) => setName(e.target.value)} className={inputStyles} />
            </div>
            <div>
              <label htmlFor="workflow-description" className={labelStyles}>Description</label>
              <textarea id="workflow-description" value={description} onChange={(e) => setDescription(e.target.value)} rows="3" className={inputStyles}></textarea>
            </div>
          </div>

          {/* Stages */}
          <div>
            <h4 className="text-md font-medium text-theme-text-primary mb-2">Stages</h4>
            <div className="space-y-3 bg-theme-bg p-4 rounded-md border border-theme-border">
              {stages.map((stage, index) => (
                <div key={stage.id} className="grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-12 sm:col-span-4">
                    <label className="text-xs text-theme-text-secondary">Stage Name</label>
                    <input type="text" value={stage.name} onChange={(e) => handleStageChange(index, 'name', e.target.value)} placeholder="e.g., Initial Review" className={inputStyles} />
                  </div>
                  <div className="col-span-12 sm:col-span-4">
                    <label className="text-xs text-theme-text-secondary">Assigned Role</label>
                    <input type="text" value={stage.assignedToRole} onChange={(e) => handleStageChange(index, 'assignedToRole', e.target.value)} placeholder="e.g., Licensing Officer" className={inputStyles} />
                  </div>
                  <div className="col-span-6 sm:col-span-2">
                    <label className="text-xs text-theme-text-secondary">SLA (Days)</label>
                    <input type="number" value={stage.slaDays} onChange={(e) => handleStageChange(index, 'slaDays', e.target.value)} placeholder="e.g., 5" className={inputStyles} />
                  </div>
                  <div className="col-span-6 sm:col-span-2 pt-5 text-right sm:text-left">
                    <button onClick={() => handleRemoveStage(index)} disabled={stages.length <= 1} className="px-2 py-1 text-sm text-red-400 hover:text-red-300 disabled:text-gray-600 disabled:cursor-not-allowed">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <button onClick={handleAddStage} className="mt-3 px-3 py-1 text-sm text-blue-400 border border-blue-500 rounded-md hover:bg-blue-900 hover:bg-opacity-30 transition-colors">
                + Add Stage
              </button>
            </div>
          </div>

          {/* Approvers */}
          <div>
            <label htmlFor="workflow-approvers" className={labelStyles}>Required Approvers</label>
            <p className="text-xs text-theme-text-secondary mb-1">Select one or more staff members who must approve this workflow. (Hold Ctrl/Cmd to select multiple)</p>
            <select
              id="workflow-approvers"
              multiple
              value={requiredApprovers}
              onChange={handleApproverChange}
              className={`${inputStyles} h-32`}
            >
              {regulatorStaff.map(staff => (
                <option key={staff.staffId} value={staff.staffId} className="p-1">{staff.name} ({staff.role})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-theme-border flex justify-end space-x-3 bg-black bg-opacity-20">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-theme-text-primary bg-gray-700 border border-transparent rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-bg-secondary focus:ring-gray-500">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-bg-secondary focus:ring-blue-500">
            Save Workflow
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkflowEditorModal;