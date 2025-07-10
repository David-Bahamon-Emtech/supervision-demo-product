// src/services/supervisionService.js

import { supervisionFramework } from '../data/supervisionFrameworkData.js';

// Mock API call delay
const SIMULATED_DELAY = 50;

const simulateApiCall = (dataFunction) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(dataFunction());
    }, SIMULATED_DELAY);
  });
};

export const getICAAPStatus = async (entityId) => {
  return simulateApiCall(() => supervisionFramework.icaapAssessments[entityId] || null);
};

export const getORSAStatus = async (entityId) => {
  return simulateApiCall(() => supervisionFramework.orsaAssessments[entityId] || null);
};

export const getSupervisoryActions = async (entityId) => {
  return simulateApiCall(() => supervisionFramework.supervisoryActions.filter(a => a.entityId === entityId));
};

export const createSupervisoryAction = async (entityId, actionType, description) => {
  return simulateApiCall(() => {
    const newAction = {
      actionId: `sup_${Date.now()}`,
      entityId,
      actionType,
      description,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      status: 'New',
      priority: 'Medium',
    };
    supervisionFramework.supervisoryActions.push(newAction);
    return newAction;
  });
};

export const updateActionStatus = async (actionId, status) => {
  return simulateApiCall(() => {
    const action = supervisionFramework.supervisoryActions.find(a => a.actionId === actionId);
    if (action) {
      action.status = status;
      return action;
    }
    return null;
  });
};
