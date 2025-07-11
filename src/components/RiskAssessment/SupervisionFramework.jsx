// src/components/RiskAssessment/SupervisionFramework.jsx

import React, { useState, useEffect } from 'react';
import {
  getICAAPStatus,
  getORSAStatus,
  getSupervisoryActions,
} from '../../services/supervisionService.js';
import entitiesData from '../../data/entities.js';

// --- Reusable Components ---

const StatusPill = ({ status }) => {
    let colorClasses = 'bg-gray-200 text-gray-800';
    switch (status) {
        case 'Compliant':
        case 'Completed':
            colorClasses = 'bg-green-200 text-green-800';
            break;
        case 'Under Review':
        case 'In Progress':
            colorClasses = 'bg-blue-200 text-blue-800';
            break;
        case 'Issues Found':
            colorClasses = 'bg-yellow-200 text-yellow-800';
            break;
        default:
            break;
    }
    return (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${colorClasses}`}>
            {status}
        </span>
    );
};

const AssessmentCard = ({ title, entityName, assessment, type }) => {
    if (!assessment) {
        return (
            <div className="bg-theme-bg-secondary p-4 rounded-lg shadow border border-theme-border">
                <h4 className="font-bold text-theme-text-primary">{entityName}</h4>
                <p className="text-sm text-theme-text-secondary italic mt-2">No {type} assessment data available.</p>
            </div>
        );
    }

    return (
        <div className="bg-theme-bg-secondary p-4 rounded-lg shadow-lg border-l-4 border-blue-400">
            <h4 className="font-bold text-theme-text-primary">{entityName}</h4>
            <div className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between">
                    <span className="text-theme-text-secondary">Status:</span>
                    <StatusPill status={assessment.status} />
                </div>
                <div className="flex justify-between">
                    <span className="text-theme-text-secondary">Last Assessed:</span>
                    <span className="text-theme-text-primary">{assessment.lastAssessment}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-theme-text-secondary">Next Due:</span>
                    <span className="text-theme-text-primary">{assessment.nextDue}</span>
                </div>
                 {assessment.riskAppetite && (
                    <div className="flex justify-between pt-1 border-t border-theme-border mt-2">
                        <span className="text-theme-text-secondary">Risk Appetite:</span>
                        <span className="font-medium text-theme-text-primary">{assessment.riskAppetite}</span>
                    </div>
                )}
                 {assessment.capitalPlanning && (
                    <div className="flex justify-between">
                        <span className="text-theme-text-secondary">Capital Planning:</span>
                        <span className="font-medium text-theme-text-primary">{assessment.capitalPlanning}</span>
                    </div>
                )}
            </div>
        </div>
    );
};


const SupervisionFramework = () => {
    const [icaapData, setIcaapData] = useState([]);
    const [orsaData, setOrsaData] = useState([]);
    const [actionsData, setActionsData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true);
            try {
                // Get all entity IDs that have either an ICAAP or ORSA assessment
                const icaapEntityIds = await Promise.all(entitiesData.map(e => getICAAPStatus(e.entityId)));
                const orsaEntityIds = await Promise.all(entitiesData.map(e => getORSAStatus(e.entityId)));
                const actionEntityIds = await Promise.all(entitiesData.map(e => getSupervisoryActions(e.entityId)));
                
                const populatedIcaap = icaapEntityIds
                    .map((assessment, index) => ({ assessment, entity: entitiesData[index] }))
                    .filter(item => item.assessment);

                const populatedOrsa = orsaEntityIds
                    .map((assessment, index) => ({ assessment, entity: entitiesData[index] }))
                    .filter(item => item.assessment);
                    
                const populatedActions = actionEntityIds
                    .flat()
                    .map(action => ({
                        ...action,
                        entityName: entitiesData.find(e => e.entityId === action.entityId)?.companyName || 'Unknown Entity'
                    }));

                setIcaapData(populatedIcaap);
                setOrsaData(populatedOrsa);
                setActionsData(populatedActions);

            } catch (err) {
                console.error("Failed to load supervision framework data:", err);
                setError("Could not load supervision framework data.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllData();
    }, []);

    if (isLoading) {
        return <div className="p-6 text-center text-theme-text-secondary">Loading Supervision Framework Data...</div>;
    }

    if (error) {
        return <div className="p-6 text-center text-red-400 bg-red-900 bg-opacity-30 rounded-md">{error}</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-semibold text-theme-text-primary">ICAAP/ORSA Assessments</h2>
                <p className="text-sm text-theme-text-secondary mt-1">Status of Internal Capital/Risk and Solvency Adequacy Assessment Processes.</p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {icaapData.map(({ entity, assessment }) => (
                        <AssessmentCard key={entity.entityId} title="ICAAP" entityName={entity.companyName} assessment={assessment} type="ICAAP" />
                    ))}
                    {orsaData.map(({ entity, assessment }) => (
                        <AssessmentCard key={entity.entityId} title="ORSA" entityName={entity.companyName} assessment={assessment} type="ORSA" />
                    ))}
                </div>
            </div>

            <div>
                 <h2 className="text-2xl font-semibold text-theme-text-primary mt-10">Outstanding Supervisory Actions</h2>
                 <p className="text-sm text-theme-text-secondary mt-1">Tracking mandatory actions and remediation plans issued to institutions.</p>
                <div className="mt-4 overflow-x-auto bg-theme-bg-secondary rounded-lg shadow-lg border border-theme-border">
                    <table className="min-w-full divide-y divide-theme-border">
                        <thead className="bg-black bg-opacity-20">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase">Entity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase">Action Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase">Priority</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase">Due Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-theme-border">
                           {actionsData.map(action => (
                                <tr key={action.actionId} className="hover:bg-theme-bg">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-theme-text-primary">{action.entityName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary">{action.actionType}</td>
                                    <td className="px-6 py-4 whitespace-normal text-sm text-theme-text-secondary max-w-sm">{action.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`font-semibold ${action.priority === 'High' ? 'text-red-400' : 'text-yellow-400'}`}>{action.priority}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm"><StatusPill status={action.status} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary">{action.dueDate}</td>
                                </tr>
                           ))}
                           {actionsData.length === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center py-4 text-sm text-theme-text-secondary italic">No outstanding supervisory actions.</td>
                            </tr>
                           )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SupervisionFramework;