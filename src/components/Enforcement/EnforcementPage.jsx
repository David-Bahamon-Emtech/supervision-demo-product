import React, { useState } from 'react';
import { ShieldExclamationIcon, DocumentTextIcon, BanknotesIcon, UserGroupIcon, BeakerIcon, ArrowDownOnSquareIcon, ArrowUpOnSquareIcon, CheckBadgeIcon, ClockIcon } from '@heroicons/react/24/outline';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


// --- Theme Classes (for reference) ---
// Main BG: bg-theme-bg
// Card BG: bg-theme-bg-secondary
// Primary Text: text-theme-text-primary
// Secondary Text: text-theme-text-secondary
// Accent Color: text-theme-accent / bg-theme-accent
// Borders: border-theme-border

// --- Mock Data ---
const mockEnforcementCases = [
    { id: 'ENF-2025-001', institution: 'Pioneer Holdings', breachSummary: 'Failure to report suspicious transactions within the required timeframe.', trigger: 'High-severity finding in Examination EXAM-2024-008', status: 'Investigation', assignedOfficer: 'Frank Castle', caseOpened: '2025-06-15', evidence: ['EXAM-2024-008-Finding-03', 'TransactionLogs-May2025.csv'], actionLog: [{ date: '2025-06-15', action: 'Case initiated and assigned.'}, { date: '2025-06-20', action: 'Show Cause notice issued to entity.' }] },
    { id: 'ENF-2025-002', institution: 'Lighthouse Financial Services', breachSummary: 'Misleading advertising claiming "guaranteed returns".', trigger: 'Market Conduct module flag on public advertisement.', status: 'Sanction Fulfillment', assignedOfficer: 'Carol Danvers', caseOpened: '2025-05-10', evidence: ['Ad-Screenshot-2025-05-09.png'], actionLog: [{ date: '2025-05-10', action: 'Case initiated.' }, { date: '2025-05-25', action: 'Management approved sanction.'}, {date: '2025-06-01', action: 'Monetary penalty of $50,000 issued.'}], sanction: { type: 'Monetary Penalty', amount: '$50,000', status: 'Payment Overdue'} },
    { id: 'ENF-2025-003', institution: 'Pinnacle Stone Investments', breachSummary: 'Critical failure of AML/CFT controls.', trigger: 'Risk Assessment module score downgrade.', status: 'Management Approval', assignedOfficer: 'Frank Castle', caseOpened: '2025-06-01', evidence: ['Risk-Assessment-Report-Q2-2025.pdf'], actionLog: [{ date: '2025-06-01', action: 'Case initiated.' }, { date: '2025-06-18', action: 'Legal review completed.'}, { date: '2025-06-22', action: 'Case escalated for management approval.'}] },
];

const mockSanctionsLibrary = [
    { type: 'Monetary Penalty', range: '$5,000 - $1,000,000' },
    { type: 'Public Reprimand', description: 'Official public statement of non-compliance.' },
    { type: 'Business Restriction', description: 'Prohibition on offering specific products or services.' },
    { type: 'License Suspension', description: 'Temporary suspension of the operating license.' },
    { type: 'License Revocation', description: 'Permanent revocation of the operating license.' },
];

const mockAnalyticsData = {
    caseTrend: [
        { month: 'Jan', cases: 5 }, { month: 'Feb', cases: 4 }, { month: 'Mar', cases: 6 },
        { month: 'Apr', cases: 8 }, { month: 'May', cases: 7 }, { month: 'Jun', cases: 9 },
    ],
    violationTypes: [
        { type: 'AML/CFT', count: 12 }, { type: 'Misleading Ads', count: 8 }, { type: 'Prudential Breach', count: 5 },
        { type: 'Consumer Harm', count: 4 }, { type: 'Reporting Failure', count: 3 },
    ]
};

// --- Helper Components ---
const PageSection = ({ title, icon, children, ...props }) => (
    <div className="bg-theme-bg-secondary p-6 rounded-xl shadow-lg border border-theme-border mb-8" {...props}>
        <div className="flex items-center text-xl font-semibold text-theme-text-primary mb-4 border-b border-theme-border pb-3">
            {React.cloneElement(icon, { className: 'w-6 h-6 mr-3 text-theme-accent' })}
            {title}
        </div>
        <div>{children}</div>
    </div>
);

const KPICard = ({ title, value, icon }) => (
    <div className="bg-theme-bg p-4 rounded-lg border border-theme-border">
        <div className="flex items-center">
            {React.cloneElement(icon, { className: 'w-8 h-8 mr-4 text-theme-text-secondary' })}
            <div>
                <p className="text-sm text-theme-text-secondary">{title}</p>
                <p className="text-3xl font-bold text-theme-text-primary">{value}</p>
            </div>
        </div>
    </div>
);

const ChartContainer = ({ title, children }) => (
    <div className="h-80 bg-theme-bg border border-theme-border rounded-lg p-4 flex flex-col">
        <h4 className="text-md font-semibold text-theme-text-primary mb-4">{title}</h4>
        <div className="flex-grow">
            <ResponsiveContainer width="100%" height="100%">
                {children}
            </ResponsiveContainer>
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
        <div className="p-4 md:p-6 bg-theme-bg min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-theme-text-primary">Enforcement Dashboard</h1>
                    <p className="text-theme-text-secondary mt-1">Manage and track enforcement actions from initiation to resolution.</p>
                </div>
                <button 
                    onClick={handleInitiateCase} 
                    className="px-4 py-2 bg-theme-accent text-sidebar-bg font-semibold rounded-md shadow-sm hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-bg focus:ring-theme-accent"
                >
                    + Initiate New Case
                </button>
            </div>

            <PageSection title="Live Case Overview" icon={<UserGroupIcon />}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <KPICard title="Active Cases" value={mockEnforcementCases.length} icon={<ShieldExclamationIcon />} />
                    <KPICard title="Pending Approval" value={mockEnforcementCases.filter(c => c.status === 'Management Approval').length} icon={<ClockIcon />} />
                    <KPICard title="Sanctions Overdue" value={mockEnforcementCases.filter(c => c.sanction?.status === 'Payment Overdue').length} icon={<BanknotesIcon />} />
                    <KPICard title="Avg. Case Age" value="28 Days" icon={<ClockIcon />} />
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-theme-border">
                        <thead className="bg-black bg-opacity-20">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Case ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Institution</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Officer</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-theme-bg-secondary divide-y divide-theme-border">
                            {mockEnforcementCases.map(c => (
                                <tr key={c.id} className="hover:bg-theme-bg">
                                    <td className="px-6 py-4 text-sm font-medium text-theme-accent">{c.id}</td>
                                    <td className="px-6 py-4 text-sm text-theme-text-primary">{c.institution}</td>
                                    <td className="px-6 py-4 text-sm text-theme-text-secondary">{c.status}</td>
                                    <td className="px-6 py-4 text-sm text-theme-text-secondary">{c.assignedOfficer}</td>
                                    <td className="px-6 py-4 text-right"><button onClick={() => setSelectedCase(c)} className="text-sm text-blue-400 hover:text-theme-accent hover:underline">View Case</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </PageSection>

            <PageSection title="Enforcement Analytics" icon={<BeakerIcon />}>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartContainer title="New Cases Opened by Month">
                        <LineChart data={mockAnalyticsData.caseTrend} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1}/>
                            <XAxis dataKey="month" stroke="#888" tick={{ fill: '#888' }} />
                            <YAxis stroke="#888" tick={{ fill: '#888' }} />
                            <Tooltip contentStyle={{ backgroundColor: '#222', border: '1px solid #444' }}/>
                            <Legend />
                            <Line type="monotone" dataKey="cases" name="New Cases" stroke="#fbbf24" strokeWidth={2} />
                        </LineChart>
                    </ChartContainer>
                    <ChartContainer title="Cases by Violation Type">
                        <BarChart data={mockAnalyticsData.violationTypes} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                             <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1}/>
                             <XAxis dataKey="type" stroke="#888" tick={{ fill: '#888' }} />
                             <YAxis stroke="#888" tick={{ fill: '#888' }} />
                             <Tooltip contentStyle={{ backgroundColor: '#222', border: '1px solid #444' }}/>
                             <Legend />
                             <Bar dataKey="count" name="Case Count" fill="#60a5fa" />
                        </BarChart>
                    </ChartContainer>
                 </div>
            </PageSection>
        </div>
    );
};

// --- Sub-component for Case File View ---
const EnforcementCaseFile = ({ caseData, onBack }) => {
    return (
        <div className="p-4 md:p-6 bg-theme-bg min-h-screen">
             <button onClick={onBack} className="text-sm text-blue-400 hover:text-theme-accent hover:underline mb-4">← Back to Enforcement Dashboard</button>
             <h1 className="text-3xl font-bold text-theme-text-primary">{caseData.id}: {caseData.institution}</h1>
             <p className="text-theme-text-secondary">Opened: {caseData.caseOpened} | Status: <span className="font-semibold text-theme-text-primary">{caseData.status}</span></p>

             <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <PageSection title="Case Details" icon={<DocumentTextIcon />}>
                        <p className="text-sm"><strong className="text-theme-text-secondary">Breach Summary:</strong> {caseData.breachSummary}</p>
                        <p className="text-sm mt-2"><strong className="text-theme-text-secondary">Trigger:</strong> {caseData.trigger}</p>
                        <div className="mt-4">
                            <h4 className="text-sm font-semibold text-theme-text-secondary mb-1">Supporting Evidence:</h4>
                            <ul className="list-disc list-inside pl-2 text-sm text-blue-400">
                                {caseData.evidence.map(e => <li key={e}><a href="#" className="hover:underline">{e}</a></li>)}
                            </ul>
                        </div>
                    </PageSection>

                    <PageSection title="Investigative Actions" icon={<ArrowDownOnSquareIcon />}>
                         <div className="p-4 bg-theme-bg rounded-lg border border-theme-border text-sm text-theme-text-secondary italic">
                            (Placeholder: A list of official notices sent to the entity would appear here. Supervisors could use templates to issue new notices like "Show Cause" or "Notice of Penalty" through the secure portal.)
                        </div>
                        <button className="mt-4 px-3 py-1.5 bg-gray-700 text-gray-200 text-sm rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500">Issue New Notice...</button>
                    </PageSection>

                    {caseData.sanction && (
                        <PageSection title="Sanction Fulfillment" icon={<CheckBadgeIcon />}>
                             <p className="text-sm"><strong className="text-theme-text-secondary">Sanction Type:</strong> {caseData.sanction.type}</p>
                             <p className="text-sm mt-2"><strong className="text-theme-text-secondary">Details:</strong> {caseData.sanction.amount}</p>
                             <p className="text-sm mt-2"><strong className="text-theme-text-secondary">Fulfillment Status:</strong> <span className="font-bold text-red-400">{caseData.sanction.status}</span></p>
                             <div className="mt-3 p-3 bg-theme-bg rounded-lg text-theme-text-secondary italic text-sm border border-theme-border">(Placeholder: Supervisors would monitor fine payments or adherence to business restrictions here.)</div>
                        </PageSection>
                    )}
                </div>

                <div className="space-y-6">
                    <PageSection title="Internal Workflow" icon={<ArrowUpOnSquareIcon />}>
                        <ol className="relative border-l border-theme-border">
                            {caseData.actionLog.map((log, index) => (
                                <li key={index} className="mb-6 ml-4">
                                    <div className="absolute w-3 h-3 bg-gray-600 rounded-full mt-1.5 -left-1.5 border border-theme-bg"></div>
                                    <time className="mb-1 text-sm font-normal leading-none text-theme-text-secondary">{log.date}</time>
                                    <p className="text-base font-semibold text-theme-text-primary">{log.action}</p>
                                </li>
                            ))}
                        </ol>
                    </PageSection>
                    <PageSection title="Sanctions Library" icon={<BanknotesIcon />}>
                        <div className="text-sm text-theme-text-secondary italic">
                             (Placeholder: Supervisors would select from this configurable library when recommending a sanction.)
                        </div>
                         <select className="mt-2 w-full p-2 bg-theme-bg border border-theme-border rounded-md text-theme-text-primary focus:ring-theme-accent focus:border-theme-accent">
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