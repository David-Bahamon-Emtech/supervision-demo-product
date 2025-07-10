// src/components/RiskAssessment/RiskReportingDashboard.jsx

import React, { useState, useEffect } from 'react';
import {
  getReportingSchedule,
  checkReportingCompliance,
} from '../../services/riskReportingService.js';
import { riskReportingTemplates } from '../../data/riskReportingTemplates.js';
import entitiesData from '../../data/entities.js';

// --- Reusable Components ---
const ReportRow = ({ schedule, template }) => {
    let statusColor = 'bg-gray-100 text-gray-700';
    if (schedule.status === 'Overdue') {
        statusColor = 'bg-red-100 text-red-700';
    } else if (schedule.status === 'Current') {
        statusColor = 'bg-green-100 text-green-700';
    }

    return (
        <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{template.name}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{template.frequency}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{schedule.lastSubmitted || 'N/A'}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{schedule.nextDue}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColor}`}>
                    {schedule.status}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                <button className="text-blue-600 hover:text-blue-800 hover:underline">View History</button>
            </td>
        </tr>
    );
};

const RiskReportingDashboard = () => {
    const [selectedEntityId, setSelectedEntityId] = useState('ent_001');
    const [reportingData, setReportingData] = useState(null);
    const [complianceStatus, setComplianceStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReportingData = async () => {
            if (!selectedEntityId) return;
            setIsLoading(true);
            setError(null);
            try {
                const [schedule, compliance] = await Promise.all([
                    getReportingSchedule(selectedEntityId),
                    checkReportingCompliance(selectedEntityId),
                ]);
                
                if (schedule) {
                    const enrichedSchedule = Object.entries(schedule).map(([templateId, scheduleDetails]) => ({
                        templateId,
                        template: riskReportingTemplates.templates[templateId],
                        schedule: scheduleDetails,
                    }));
                    setReportingData(enrichedSchedule);
                } else {
                    setReportingData([]);
                }

                setComplianceStatus(compliance);

            } catch (err) {
                console.error(`Failed to load reporting data for ${selectedEntityId}:`, err);
                setError(`Could not load reporting data.`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReportingData();
    }, [selectedEntityId]);

    const entityName = entitiesData.find(e => e.entityId === selectedEntityId)?.companyName || 'Selected Entity';

    return (
        <div className="space-y-8">
            <div>
                 <h2 className="text-2xl font-semibold text-gray-800">Risk-Based Reporting</h2>
                 <p className="text-sm text-gray-600 mt-1">Track submission deadlines, generate reports, and monitor reporting compliance.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Entity Selection */}
                <div className="lg:col-span-1">
                    <label htmlFor="entitySelectReporting" className="block text-sm font-medium text-gray-700">Select Entity</label>
                    <select 
                        id="entitySelectReporting" 
                        value={selectedEntityId} 
                        onChange={e => setSelectedEntityId(e.target.value)} 
                        className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm"
                    >
                        {entitiesData.map(e => <option key={e.entityId} value={e.entityId}>{e.companyName}</option>)}
                    </select>
                </div>

                {/* Compliance Status */}
                <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
                    <div>
                        <h4 className="font-semibold text-gray-700">Reporting Compliance for {entityName}</h4>
                        {complianceStatus && !complianceStatus.compliant && (
                             <p className="text-sm text-red-600">Overdue reports found: {complianceStatus.overdueReports.join(', ')}</p>
                        )}
                         {complianceStatus && complianceStatus.compliant && (
                             <p className="text-sm text-green-600">All reports are up-to-date.</p>
                        )}
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">
                        Generate Report
                    </button>
                </div>
            </div>

            {/* Reporting Schedule Table */}
            <div>
                <h3 className="text-xl font-semibold text-gray-800 mt-4">Reporting Schedule for {entityName}</h3>
                <div className="mt-4 overflow-x-auto bg-white rounded-lg shadow">
                     {isLoading ? (
                        <div className="p-6 text-center">Loading schedule...</div>
                     ) : error ? (
                        <div className="p-6 text-center text-red-600">{error}</div>
                     ) : reportingData && reportingData.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Report Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Submitted</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Due</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {reportingData.map(item => (
                                    <ReportRow key={item.templateId} schedule={item.schedule} template={item.template} />
                                ))}
                            </tbody>
                        </table>
                     ) : (
                        <div className="p-6 text-center text-gray-500 italic">No reporting schedule found for this entity.</div>
                     )}
                </div>
            </div>
        </div>
    );
};

export default RiskReportingDashboard;