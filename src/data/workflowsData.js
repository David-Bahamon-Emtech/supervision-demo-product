// src/data/workflowsData.js

/**
 * @typedef {Object} WorkflowStage
 * @property {string} id - Unique ID for the stage (e.g., "stg_1").
 * @property {string} name - The name of the workflow stage.
 * @property {string} assignedToRole - The role responsible for this stage.
 * @property {number} slaDays - Service Level Agreement in days for stage completion.
 */

/**
 * @typedef {Object} WorkflowApproval
 * @property {string} staffId - The ID of the staff member who approved.
 * @property {string} date - The ISO date string of when the approval was given.
 */

/**
 * @typedef {Object} Workflow
 * @property {string} id - Unique ID for the workflow (e.g., "wf_001").
 * @property {string} name - The name of the workflow.
 * @property {string} description - A brief description of the workflow's purpose.
 * @property {'Draft' | 'Pending Approval' | 'Active' | 'Suspended'} status - The current lifecycle status of the workflow.
 * @property {WorkflowStage[]} stages - An array of stages that make up the workflow.
 * @property {string[]} requiredApprovers - An array of staffId's required for activation.
 * @property {WorkflowApproval[]} approvals - An array of approval objects, tracks who has approved.
 * @property {string} createdAt - ISO date string of when the workflow was created.
 * @property {string} updatedAt - ISO date string of the last modification.
 */

/** @type {Workflow[]} */
export const initialWorkflows = [
  {
    id: 'wf_001',
    name: 'New PI License Application Review',
    description: 'Standard workflow for processing new Payment Institution license applications.',
    status: 'Active',
    stages: [
      { id: 'stg_1_1', name: 'Initial Submission Review', assignedToRole: 'Licensing Officer', slaDays: 5 },
      { id: 'stg_1_2', name: 'Detailed Assessment', assignedToRole: 'Senior Licensing Officer', slaDays: 10 },
      { id: 'stg_1_3', name: 'Decision Making', assignedToRole: 'Head of Licensing', slaDays: 3 }
    ],
    requiredApprovers: ['reg_001', 'reg_005'], // Alice Wonderland and Eve Moneypenny
    approvals: [
      { staffId: 'reg_001', date: '2025-01-10T10:00:00Z' },
      { staffId: 'reg_005', date: '2025-01-11T11:00:00Z' }
    ],
    createdAt: '2025-01-08T12:00:00Z',
    updatedAt: '2025-01-11T11:00:00Z'
  },
  {
    id: 'wf_002',
    name: 'Crypto Asset Provider Onboarding',
    description: 'Specialized workflow for CASP applications.',
    status: 'Draft',
    stages: [], // Starts with no stages, to be added via "Edit"
    requiredApprovers: ['reg_001', 'reg_004'], // Alice Wonderland and David Copperfield
    approvals: [],
    createdAt: '2025-03-15T09:00:00Z',
    updatedAt: '2025-03-15T09:00:00Z'
  },
  {
    id: 'wf_003',
    name: 'License Renewal Process',
    description: 'Standard workflow for handling license renewals.',
    status: 'Pending Approval',
    stages: [
      { id: 'stg_3_1', name: 'Renewal Application Submitted', assignedToRole: 'Licensing Officer', slaDays: 2 },
      { id: 'stg_3_2', name: 'Compliance Check', assignedToRole: 'Compliance Analyst', slaDays: 7 },
      { id: 'stg_3_3', name: 'Renewal Decision', assignedToRole: 'Head of Licensing', slaDays: 3 }
    ],
    requiredApprovers: ['reg_003', 'reg_007'], // Carol Danvers and Grace Hopper
    approvals: [
      { staffId: 'reg_003', date: '2025-04-20T14:30:00Z' }
    ],
    createdAt: '2025-04-18T16:00:00Z',
    updatedAt: '2025-04-20T14:30:00Z'
  },
  {
    id: 'wf_004',
    name: 'Emergency Sanction Review',
    description: 'Accelerated workflow for reviewing entities against new sanction lists.',
    status: 'Suspended',
    stages: [
      { id: 'stg_4_1', name: 'Initial Screening', assignedToRole: 'Compliance Analyst', slaDays: 1 },
      { id: 'stg_4_2', name: 'Supervisory Review', assignedToRole: 'Supervisory Lead', slaDays: 2 },
      { id: 'stg_4_3', name: 'Enforcement Action', assignedToRole: 'Enforcement Officer', slaDays: 1 }
    ],
    requiredApprovers: ['reg_006', 'reg_008'], // Frank Castle and Henry Jekyll
    approvals: [
      { staffId: 'reg_006', date: '2025-02-01T09:00:00Z' },
      { staffId: 'reg_008', date: '2025-02-01T15:00:00Z' }
    ],
    createdAt: '2025-02-01T08:00:00Z',
    updatedAt: '2025-05-20T10:00:00Z' // Updated date reflects suspension
  }
];