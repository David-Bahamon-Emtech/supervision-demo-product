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
    let colorClasses = 'bg-gray-100 text-gray-700';
    switch (status) {
        case 'Compliant':
        case 'Completed':
            colorClasses = 'bg-green-100 text-green-700';
            break;
        case 'Under Review':
        case 'In Progress':
            colorClasses = 'bg-blue-100 text-blue-700';
            break;
        case 'Issues Found':
            colorClasses = 'bg-yellow-100 text-yellow-700';
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
            <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="font-bold text-gray-800">{entityName}</h4>
                <p className="text-sm text-gray-500 italic mt-2">No {type} assessment data available.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-blue-500">
            <h4 className="font-bold text-gray-800">{entityName}</h4>
            <div className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <StatusPill status={assessment.status} />
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">Last Assessed:</span>
                    <span>{assessment.lastAssessment}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">Next Due:</span>
                    <span>{assessment.nextDue}</span>
                </div>
                 {assessment.riskAppetite && (
                    <div className="flex justify-between pt-1 border-t mt-2">
                        <span className="text-gray-500">Risk Appetite:</span>
                        <span className="font-medium">{assessment.riskAppetite}</span>
                    </div>
                )}
                 {assessment.capitalPlanning && (
                    <div className="flex justify-between">
                        <span className="text-gray-500">Capital Planning:</span>
                        <span className="font-medium">{assessment.capitalPlanning}</span>
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
        return <div className="p-6 text-center text-gray-500">Loading Supervision Framework Data...</div>;
    }

    if (error) {
        return <div className="p-6 text-center text-red-600 bg-red-100 rounded-md">{error}</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-semibold text-gray-800">ICAAP/ORSA Assessments</h2>
                <p className="text-sm text-gray-600 mt-1">Status of Internal Capital/Risk and Solvency Adequacy Assessment Processes.</p>
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
                 <h2 className="text-2xl font-semibold text-gray-800 mt-10">Outstanding Supervisory Actions</h2>
                 <p className="text-sm text-gray-600 mt-1">Tracking mandatory actions and remediation plans issued to institutions.</p>
                <div className="mt-4 overflow-x-auto bg-white rounded-lg shadow">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                           {actionsData.map(action => (
                                <tr key={action.actionId} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{action.entityName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{action.actionType}</td>
                                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-600 max-w-sm">{action.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        <span className={`font-semibold ${action.priority === 'High' ? 'text-red-600' : 'text-yellow-600'}`}>{action.priority}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm"><StatusPill status={action.status} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{action.dueDate}</td>
                                </tr>
                           ))}
                           {actionsData.length === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center py-4 text-sm text-gray-500 italic">No outstanding supervisory actions.</td>
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