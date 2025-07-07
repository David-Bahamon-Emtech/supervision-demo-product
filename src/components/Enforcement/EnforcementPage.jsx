import React, { useState } from 'react';
import { ShieldExclamationIcon, DocumentTextIcon, BanknotesIcon, UserGroupIcon, BeakerIcon, ArrowDownOnSquareIcon, ArrowUpOnSquareIcon, CheckBadgeIcon, ClockIcon } from '@heroicons/react/24/outline';

// --- Mock Data ---
const mockEnforcementCases = [
    { 
        id: 'ENF-2025-001', 
        institution: 'Pioneer Holdings',
        breachSummary: 'Failure to report suspicious transactions within the required timeframe.',
        trigger: 'High-severity finding in Examination EXAM-2024-008',
        status: 'Investigation', 
        assignedOfficer: 'Frank Castle',
        caseOpened: '2025-06-15',
        evidence: ['EXAM-2024-008-Finding-03', 'TransactionLogs-May2025.csv'],
        actionLog: [{ date: '2025-06-15', action: 'Case initiated and assigned.'}, { date: '2025-06-20', action: 'Show Cause notice issued to entity.' }]
    },
    { 
        id: 'ENF-2025-002', 
        institution: 'Lighthouse Financial Services',
        breachSummary: 'Misleading advertising claiming "guaranteed returns" on a high-risk investment product.',
        trigger: 'Market Conduct module flag on public advertisement.',
        status: 'Sanction Fulfillment', 
        assignedOfficer: 'Carol Danvers',
        caseOpened: '2025-05-10',
        evidence: ['Ad-Screenshot-2025-05-09.png'],
        actionLog: [{ date: '2025-05-10', action: 'Case initiated.' }, { date: '2025-05-25', action: 'Management approved sanction.'}, {date: '2025-06-01', action: 'Monetary penalty of $50,000 issued.'}],
        sanction: { type: 'Monetary Penalty', amount: '$50,000', status: 'Payment Overdue'}
    },
     { 
        id: 'ENF-2025-003', 
        institution: 'Pinnacle Stone Investments',
        breachSummary: 'Critical failure of AML/CFT controls leading to unmitigated risk.',
        trigger: 'Risk Assessment module score downgrade.',
        status: 'Management Approval', 
        assignedOfficer: 'Frank Castle',
        caseOpened: '2025-06-01',
        evidence: ['Risk-Assessment-Report-Q2-2025.pdf'],
        actionLog: [{ date: '2025-06-01', action: 'Case initiated.' }, { date: '2025-06-18', action: 'Legal review completed. Recommending license suspension.'}, { date: '2025-06-22', action: 'Case escalated for management approval.'}]
    },
];

const mockSanctionsLibrary = [
    { type: 'Monetary Penalty', range: '$5,000 - $1,000,000' },
    { type: 'Public Reprimand', description: 'Official public statement of non-compliance.' },
    { type: 'Business Restriction', description: 'Prohibition on offering specific products or services.' },
    { type: 'License Suspension', description: 'Temporary suspension of the operating license.' },
    { type: 'License Revocation', description: 'Permanent revocation of the operating license.' },
];

// --- Helper Components ---
const PageSection = ({ title, icon, children, ...props }) => (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-8" {...props}>
        <div className="flex items-center text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
            {React.cloneElement(icon, { className: 'w-6 h-6 mr-3 text-gray-500' })}
            {title}
        </div>
        <div>{children}</div>
    </div>
);

const KPICard = ({ title, value, icon }) => (
    <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center">
            {React.cloneElement(icon, { className: 'w-8 h-8 mr-4 text-gray-400' })}
            <div>
                <p className="text-sm text-gray-600">{title}</p>
                <p className="text-3xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    </div>
);

const EnforcementPage = () => {
    const [selectedCase, setSelectedCase] = useState(null);

    const handleInitiateCase = () => alert("This would open a form to create a new enforcement case, allowing the supervisor to link it to a trigger (e.g., an examination finding) and add initial details.");

    if (selectedCase) {
        return <EnforcementCaseFile caseData={selectedCase} onBack={() => setSelectedCase(null)} />;
    }

    return (
        <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Enforcement Dashboard</h1>
                <button onClick={handleInitiateCase} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700">
                    + Initiate New Case
                </button>
            </div>

            {/* 8. Enforcement Dashboard */}
            <PageSection title="Live Case Overview" icon={<UserGroupIcon />}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <KPICard title="Active Cases" value={mockEnforcementCases.length} icon={<ShieldExclamationIcon />} />
                    <KPICard title="Pending Approval" value={mockEnforcementCases.filter(c => c.status === 'Management Approval').length} icon={<ClockIcon />} />
                    <KPICard title="Sanctions Overdue" value={mockEnforcementCases.filter(c => c.sanction?.status === 'Payment Overdue').length} icon={<BanknotesIcon />} />
                    <KPICard title="Avg. Case Age" value="28 Days" icon={<ClockIcon />} />
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Case ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Institution</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Officer</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {mockEnforcementCases.map(c => (
                                <tr key={c.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-blue-600">{c.id}</td>
                                    <td className="px-6 py-4 text-sm">{c.institution}</td>
                                    <td className="px-6 py-4 text-sm">{c.status}</td>
                                    <td className="px-6 py-4 text-sm">{c.assignedOfficer}</td>
                                    <td className="px-6 py-4 text-right"><button onClick={() => setSelectedCase(c)} className="text-sm text-blue-600 hover:underline">View Case</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </PageSection>

            {/* 9. Analytical Reports */}
            <PageSection title="Enforcement Analytics" icon={<BeakerIcon />}>
                 <div className="text-center text-gray-500 italic p-8 bg-gray-50 rounded-lg">
                    (Placeholder: Charts and trend analysis on violation types, affected sectors, and case resolution times would be displayed here to inform supervisory priorities.)
                 </div>
            </PageSection>
        </div>
    );
};

// --- Sub-component for Case File View ---
const EnforcementCaseFile = ({ caseData, onBack }) => {
    return (
        <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
             <button onClick={onBack} className="text-sm text-blue-600 hover:underline mb-4">&larr; Back to Enforcement Dashboard</button>
             <h1 className="text-3xl font-bold text-gray-800">{caseData.id}: {caseData.institution}</h1>
             <p className="text-gray-600">Opened: {caseData.caseOpened} | Status: <span className="font-semibold">{caseData.status}</span></p>

             <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* 3. Case Management System */}
                    <PageSection title="Case Details" icon={<DocumentTextIcon />}>
                        <p className="text-sm"><strong className="text-gray-600">Breach Summary:</strong> {caseData.breachSummary}</p>
                        <p className="text-sm mt-2"><strong className="text-gray-600">Trigger:</strong> {caseData.trigger}</p>
                        <div className="mt-4">
                            <h4 className="text-sm font-semibold text-gray-600 mb-1">Supporting Evidence:</h4>
                            <ul className="list-disc list-inside pl-2 text-sm text-blue-600">
                                {caseData.evidence.map(e => <li key={e}><a href="#" className="hover:underline">{e}</a></li>)}
                            </ul>
                        </div>
                    </PageSection>

                    {/* 4. Investigative Process */}
                    <PageSection title="Investigative Actions" icon={<ArrowDownOnSquareIcon />}>
                         <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600 italic">
                            (Placeholder: A list of official notices sent to the entity would appear here. Supervisors could use templates to issue new notices like "Show Cause" or "Notice of Penalty" through the secure portal.)
                        </div>
                        <button className="mt-2 px-3 py-1 bg-gray-200 text-sm rounded hover:bg-gray-300">Issue New Notice...</button>
                    </PageSection>

                     {/* 7. Sanction Fulfillment */}
                    {caseData.sanction && (
                        <PageSection title="Sanction Fulfillment" icon={<CheckBadgeIcon />}>
                             <p className="text-sm"><strong className="text-gray-600">Sanction Type:</strong> {caseData.sanction.type}</p>
                             <p className="text-sm mt-2"><strong className="text-gray-600">Details:</strong> {caseData.sanction.amount}</p>
                             <p className="text-sm mt-2"><strong className="text-gray-600">Fulfillment Status:</strong> <span className="font-bold text-red-600">{caseData.sanction.status}</span></p>
                             <div className="mt-3 p-3 bg-gray-50 rounded-lg text-gray-600 italic text-sm">(Placeholder: Supervisors would monitor fine payments or adherence to business restrictions here.)</div>
                        </PageSection>
                    )}
                </div>

                <div className="space-y-6">
                    {/* 6. Internal Workflow */}
                    <PageSection title="Internal Workflow" icon={<ArrowUpOnSquareIcon />}>
                        <ol className="relative border-l border-gray-200">
                            {caseData.actionLog.map((log, index) => (
                                <li key={index} className="mb-4 ml-4">
                                    <div className="absolute w-3 h-3 bg-gray-400 rounded-full mt-1.5 -left-1.5 border border-white"></div>
                                    <time className="mb-1 text-sm font-normal leading-none text-gray-500">{log.date}</time>
                                    <p className="text-base font-semibold text-gray-900">{log.action}</p>
                                </li>
                            ))}
                        </ol>
                    </PageSection>
                    {/* 5. Sanctions Library */}
                    <PageSection title="Sanctions Library" icon={<BanknotesIcon />}>
                        <div className="text-sm text-gray-600 italic">
                             (Placeholder: Supervisors would select from this configurable library when recommending a sanction.)
                        </div>
                         <select className="mt-2 w-full p-2 border border-gray-300 rounded-md">
                            <option>-- Select a Sanction --</option>
                            {mockSanctionsLibrary.map(s => <option key={s.type}>{s.type}</option>)}
                         </select>
                    </PageSection>
                </div>
             </div>
        </div>
    );
};

export default EnforcementPage;