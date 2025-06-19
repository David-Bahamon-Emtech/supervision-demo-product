import React, { createContext, useState, useEffect, useCallback } from 'react';
import { initialWorkflows } from '../data/workflowsData';

export const WorkflowContext = createContext();

export const WorkflowProvider = ({ children }) => {
  // Initialize state from localStorage or from the initial data file
  const [workflows, setWorkflows] = useState(() => {
    try {
      const savedWorkflows = localStorage.getItem('workflows');
      return savedWorkflows ? JSON.parse(savedWorkflows) : initialWorkflows;
    } catch (error) {
      console.error("Error parsing workflows from localStorage", error);
      return initialWorkflows;
    }
  });

  // Initialize the next ID based on the current highest ID
  const [nextId, setNextId] = useState(() => {
    if (!workflows || workflows.length === 0) return 1;
    const maxId = Math.max(...workflows.map(wf => parseInt(wf.id.split('_')[1] || 0)));
    return maxId + 1;
  });

  // Persist the workflows state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('workflows', JSON.stringify(workflows));
  }, [workflows]);

  // --- CRUD AND LIFECYCLE FUNCTIONS ---

  const addWorkflow = useCallback((workflowData) => {
    const newWorkflow = {
      ...workflowData,
      id: `wf_${nextId}`,
      status: 'Draft',
      approvals: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setWorkflows(prev => [...prev, newWorkflow]);
    setNextId(prev => prev + 1);
  }, [nextId]);

  const updateWorkflow = useCallback((workflowId, updatedData) => {
    setWorkflows(prev =>
      prev.map(wf =>
        wf.id === workflowId
          ? { ...wf, ...updatedData, updatedAt: new Date().toISOString() }
          : wf
      )
    );
  }, []);

  const deleteWorkflow = useCallback((workflowId) => {
    setWorkflows(prev => prev.filter(wf => wf.id !== workflowId));
  }, []);
  
  const updateWorkflowStatus = useCallback((workflowId, newStatus) => {
    setWorkflows(prev =>
      prev.map(wf =>
        wf.id === workflowId
          ? { ...wf, status: newStatus, updatedAt: new Date().toISOString() }
          : wf
      )
    );
  }, []);

  const approveWorkflow = useCallback((workflowId, staffId) => {
    setWorkflows(prev => {
      const newWorkflows = [...prev];
      const wfIndex = newWorkflows.findIndex(wf => wf.id === workflowId);
      if (wfIndex === -1) return prev; // workflow not found

      const workflow = { ...newWorkflows[wfIndex] };

      // Ensure it's pending approval and the user is a required approver who hasn't approved yet
      if (
        workflow.status === 'Pending Approval' &&
        workflow.requiredApprovers.includes(staffId) &&
        !workflow.approvals.some(app => app.staffId === staffId)
      ) {
        // Add new approval
        workflow.approvals = [...workflow.approvals, { staffId, date: new Date().toISOString() }];
        workflow.updatedAt = new Date().toISOString();

        // Check if all approvals are met
        if (workflow.approvals.length === workflow.requiredApprovers.length) {
          workflow.status = 'Active';
        }

        newWorkflows[wfIndex] = workflow;
        return newWorkflows;
      }
      
      return prev; // No change if conditions not met
    });
  }, []);


  const value = {
    workflows,
    addWorkflow,
    updateWorkflow,
    deleteWorkflow,
    updateWorkflowStatus,
    approveWorkflow,
  };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
};