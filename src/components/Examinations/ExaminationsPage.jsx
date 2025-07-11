import React, { useState } from 'react';
import { BriefcaseIcon, MagnifyingGlassIcon, DocumentPlusIcon, UsersIcon, CheckCircleIcon, CodeBracketSquareIcon, CloudArrowDownIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

// --- Theme Classes (for reference) ---
// Main BG: bg-theme-bg
// Card BG: bg-theme-bg-secondary
// Primary Text: text-theme-text-primary
// Secondary Text: text-theme-text-secondary
// Accent Color: text-theme-accent / bg-theme-accent
// Borders: border-theme-border

// --- Mock Data ---
const mockExaminations = [
  {
    id: 'EXAM-2025-001',
    institutionName: 'Oakmark Strategic Holdings',
    type: 'Full-Scope Prudential',
    status: 'Fieldwork In Progress',
    leadExaminer: 'Alice Wonderland',
    startDate: '2025-06-01',
    scope: 'Full review of operations and financial stability for H1 2025.',
    team: [{ name: 'Bobby Mack', role: 'Credit Risk Specialist'}, { name: 'Henry Jekyll', role: 'IT Examiner'}],
    findings: [
      { id: 'F01', severity: 'Medium', category: 'Credit Risk', description: 'Loan concentration in commercial real estate exceeds internal policy limits by 5%.', regulation: 'Prudential Guideline B-20', status: 'Draft' }
    ],
    remediation: []
  },
  {
    id: 'EXAM-2025-002',
    institutionName: 'Pinnacle Stone Investments',
    type: 'Thematic AML/CFT',
    status: 'Remediation Monitoring',
    leadExaminer: 'Frank Castle',
    startDate: '2025-04-10',
    scope: 'Review of AML/CFT policies and transaction monitoring effectiveness for crypto-asset transfers.',
    team: [{ name: 'Carol Danvers', role: 'AML Specialist'}],
    findings: [
      { id: 'F02', severity: 'High', category: 'Compliance', description: 'Transaction monitoring system failed to flag three large, structured crypto-asset withdrawals to un-hosted wallets.', regulation: 'AML Act Section 5.3(a)', status: 'Finalized' }
    ],
    remediation: [
        { findingId: 'F02', action: 'Implement new TM rule; Retrain staff.', submittedBy: 'Pinnacle Stone', status: 'In Progress', dueDate: '2025-07-30' }
    ]
  },
];

const mockSmartContractAnalysis = {
    isVulnerable: true,
    vulnerabilities: [
        { type: 'Re-entrancy', confidence: 'High', lines: '88-92' },
        { type: 'Integer Overflow', confidence: 'Medium', lines: '153' }
    ],
    nonCompliantFunctions: ['selfDestruct()', 'unrestrictedMint()'],
    sourceCode: `// SPDX-License-Identifier: MIT\npragma solidity ^0.8.0;\n\ncontract VulnerableContract {\n    mapping(address => uint) public balances;\n\n    function deposit() public payable {\n        balances[msg.sender] += msg.value;\n    }\n\n    function withdraw(uint _amount) public {\n        require(balances[msg.sender] >= _amount, "Insufficient balance");\n\n        (bool success, ) = msg.sender.call{value: _amount}(""); // Vulnerable to re-entrancy\n        require(success, "Failed to send Ether");\n\n        balances[msg.sender] -= _amount;\n    }\n}`
};


// --- Helper Components (Dark Theme) ---
const PageSection = ({ title, icon, children }) => (
    <div className="bg-theme-bg-secondary p-6 rounded-xl shadow-lg border border-theme-border">
        <div className="flex items-center text-xl font-semibold text-theme-text-primary mb-4 pb-3 border-b border-theme-border">
            {React.cloneElement(icon, { className: 'w-6 h-6 mr-3 text-theme-accent' })}
            {title}
        </div>
        <div>{children}</div>
    </div>
);

const ExaminationsPage = () => {
    const [selectedExam, setSelectedExam] = useState(null);

    const handleCreateNewExam = () => alert("This would open a form to initiate a new examination, define its scope, and assign a team.");
    
    if (selectedExam) {
        return <ExamCaseFile exam={selectedExam} onBack={() => setSelectedExam(null)} />;
    }

    return (
        <div className="p-4 md:p-6 bg-theme-bg min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-theme-text-primary">Examinations</h1>
                    <p className="text-theme-text-secondary mt-1">Supervisory review and assessment of regulated entities.</p>
                </div>
                <button 
                    onClick={handleCreateNewExam} 
                    className="px-4 py-2 bg-theme-accent text-sidebar-bg font-semibold rounded-md shadow-sm hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-bg focus:ring-theme-accent"
                >
                    + Initiate New Examination
                </button>
            </div>
            
            <PageSection title="Ongoing & Recent Examinations" icon={<MagnifyingGlassIcon />}>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-theme-border">
                        <thead className="bg-black bg-opacity-20">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Exam ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Institution</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-theme-bg-secondary divide-y divide-theme-border">
                            {mockExaminations.map(exam => (
                                <tr key={exam.id} className="hover:bg-theme-bg">
                                    <td className="px-6 py-4 text-sm font-medium text-theme-accent">{exam.id}</td>
                                    <td className="px-6 py-4 text-sm text-theme-text-primary">{exam.institutionName}</td>
                                    <td className="px-6 py-4 text-sm text-theme-text-secondary">{exam.type}</td>
                                    <td className="px-6 py-4 text-sm text-theme-text-secondary">{exam.status}</td>
                                    <td className="px-6 py-4 text-right"><button onClick={() => setSelectedExam(exam)} className="text-sm text-blue-400 hover:text-theme-accent hover:underline">Open Case File</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </PageSection>
        </div>
    );
};

// --- Sub-component for the Case File View ---
const ExamCaseFile = ({ exam, onBack }) => {
    const [activeTab, setActiveTab] = useState('planning');

    const renderContent = () => {
        switch (activeTab) {
            case 'planning': return <PlanningPhase exam={exam} />;
            case 'fieldwork': return <FieldworkPhase exam={exam} />;
            case 'findings': return <FindingsPhase exam={exam} />;
            case 'remediation': return <RemediationPhase exam={exam} />;
            default: return null;
        }
    }

    return (
        <div className="p-4 md:p-6 bg-theme-bg min-h-screen">
            <button onClick={onBack} className="text-sm text-blue-400 hover:text-theme-accent hover:underline mb-4">← Back to All Examinations</button>
            <h1 className="text-3xl font-bold text-theme-text-primary">{exam.id}: {exam.institutionName}</h1>
            <p className="text-theme-text-secondary">{exam.type}</p>

            <div className="mt-6 border-b border-theme-border">
                <nav className="-mb-px flex space-x-6 overflow-x-auto">
                    {['planning', 'fieldwork', 'findings', 'remediation'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`${activeTab === tab ? 'border-theme-accent text-theme-accent' : 'border-transparent text-theme-text-secondary hover:text-theme-text-primary hover:border-gray-500'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm capitalize focus:outline-none`}>
                            {tab.replace('_', ' ')}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="mt-6">{renderContent()}</div>
        </div>
    );
};

const PlanningPhase = ({ exam }) => (
    <PageSection title="Planning" icon={<DocumentPlusIcon />}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
                <div>
                    <h3 className="font-semibold text-theme-text-primary mb-2">360-Degree Preliminary Analysis</h3>
                    <div className="p-4 bg-theme-bg rounded-md border border-theme-border space-y-2 text-sm">
                        <p><strong className="text-theme-text-secondary">Current Risk Score:</strong> 4.1 (High) </p>
                        <p><strong className="text-theme-text-secondary">Compliance Summary (24m):</strong> 2 Overdue Filings, 1 previous finding on AML controls.</p>
                        <p><strong className="text-theme-text-secondary">Previous Exam (EXAM-2023-005):</strong> Findings related to AML transaction monitoring.</p>
                        <p><strong className="text-theme-text-secondary">Key Personnel:</strong> John Smith (CEO), Jane Doe (CCO)</p>
                    </div>
                </div>
                 <div>
                    <h3 className="font-semibold text-theme-text-primary mb-2">Work Program</h3>
                    <div className="p-4 bg-theme-bg rounded-md border border-theme-border space-y-3 text-sm">
                        <label className="flex items-center"><input type="checkbox" className="h-4 w-4 mr-3 bg-theme-bg border-gray-500 rounded text-blue-500 focus:ring-blue-500" defaultChecked /> Review board minutes for Q1/Q2 2025.</label>
                        <label className="flex items-center"><input type="checkbox" className="h-4 w-4 mr-3 bg-theme-bg border-gray-500 rounded text-blue-500 focus:ring-blue-500" defaultChecked /> Sample 20 consumer loans for underwriting quality.</label>
                        <label className="flex items-center"><input type="checkbox" className="h-4 w-4 mr-3 bg-theme-bg border-gray-500 rounded text-blue-500 focus:ring-blue-500" /> Test IT general controls for core banking system.</label>
                    </div>
                 </div>
            </div>
            <div className="space-y-6">
                <div>
                    <h3 className="font-semibold text-theme-text-primary mb-2">Exam Details</h3>
                    <div className="p-4 bg-theme-bg rounded-md border border-theme-border text-sm space-y-2">
                        <p><strong className="text-theme-text-secondary">Scope:</strong> {exam.scope}</p>
                        <p><strong className="text-theme-text-secondary">Start Date:</strong> {exam.startDate}</p>
                        <p><strong className="text-theme-text-secondary">Lead Examiner:</strong> {exam.leadExaminer}</p>
                    </div>
                </div>
                 <div>
                    <h3 className="font-semibold text-theme-text-primary mb-2">Assigned Team</h3>
                    <ul className="p-4 bg-theme-bg rounded-md border border-theme-border text-sm list-disc list-inside space-y-1">
                        {exam.team.map(t => <li key={t.name}>{t.name} ({t.role})</li>)}
                    </ul>
                 </div>
            </div>
        </div>
    </PageSection>
);

const FieldworkPhase = ({ exam }) => {
    const [contractAddress, setContractAddress] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);

    const handleScanContract = () => {
        alert(`Scanning contract at address: ${contractAddress}\n\nThis would connect to a blockchain node, retrieve the source code, and perform a static analysis scan.`);
        setAnalysisResult(mockSmartContractAnalysis);
    }
    
    return(
        <PageSection title="Fieldwork & Data Collection" icon={<UsersIcon />}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <div>
                        <h3 className="font-semibold text-theme-text-primary mb-2">Request for Information (RFI) Portal</h3>
                        <div className="p-4 bg-theme-bg rounded-md border border-theme-border text-sm text-theme-text-secondary italic">
                            (Placeholder: A list of RFIs sent to the institution would appear here, showing what was requested, when, and the status of their submission. Examiners could issue new RFIs from this interface.)
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-theme-text-primary mb-2">Digital Working Papers</h3>
                        <div className="p-4 bg-theme-bg rounded-md border border-theme-border text-sm text-theme-text-secondary italic">
                            (Placeholder: A file-system-like view of the examiners' notes, testing procedures, and observations, with links to specific pieces of uploaded evidence.)
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-theme-text-primary mb-2">Offline Mode</h3>
                        <button className="w-full p-3 bg-gray-700 text-white rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500">
                            <CloudArrowDownIcon className="w-5 h-5" />
                            <span>Download Case File for Offline Work</span>
                        </button>
                    </div>
                </div>
                 <div>
                    <h3 className="font-semibold text-theme-text-primary mb-2">Smart Contract Analysis Tool</h3>
                    <div className="p-4 bg-theme-bg rounded-md border border-theme-border">
                        <label className="text-sm font-medium text-theme-text-secondary">Contract Address</label>
                        <input type="text" value={contractAddress} onChange={e => setContractAddress(e.target.value)} className="w-full p-2 bg-theme-bg border-theme-border rounded-md my-2 focus:ring-blue-500 focus:border-blue-500" placeholder="0x..." />
                        <button onClick={handleScanContract} className="w-full p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">Scan Contract</button>
                        {analysisResult && (
                             <div className="mt-4 text-xs space-y-2">
                                 <h4 className="font-bold text-sm text-theme-text-primary">Analysis Results:</h4>
                                 <p className="text-red-400 font-semibold">Vulnerabilities Found: {analysisResult.vulnerabilities.map(v => `${v.type} (${v.confidence})`).join(', ')}</p>
                                 <p className="text-orange-400 font-semibold">Non-Compliant Functions: {analysisResult.nonCompliantFunctions.join(', ')}</p>
                                 <details><summary className="cursor-pointer text-theme-text-secondary hover:text-theme-text-primary">View Source</summary><pre className="bg-gray-900 text-white p-2 rounded-md mt-1 max-h-40 overflow-auto">{analysisResult.sourceCode}</pre></details>
                             </div>
                        )}
                    </div>
                </div>
            </div>
        </PageSection>
    );
}

const FindingsPhase = ({ exam }) => (
    <PageSection title="Findings & Reporting" icon={<ExclamationTriangleIcon />}>
        <h3 className="font-semibold text-theme-text-primary mb-2">Findings Log</h3>
         <div className="p-4 bg-theme-bg rounded-md border border-dashed border-theme-border text-sm text-theme-text-secondary italic mb-4">
            (Placeholder: A form to log new structured findings, capturing severity, category, regulation citation, and linked evidence.)
        </div>
        <table className="min-w-full divide-y divide-theme-border">
            <thead className="bg-black bg-opacity-20">
                <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Severity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Regulation</th>
                </tr>
            </thead>
            <tbody className="bg-theme-bg-secondary divide-y divide-theme-border">
                {exam.findings.map(f => (
                    <tr key={f.id}>
                        <td className="px-4 py-3 text-sm"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${f.severity === 'High' ? 'bg-red-900 text-red-300' : 'bg-yellow-900 text-yellow-300'}`}>{f.severity}</span></td>
                        <td className="px-4 py-3 text-sm text-theme-text-primary">{f.category}</td>
                        <td className="px-4 py-3 text-sm text-theme-text-secondary">{f.description}</td>
                        <td className="px-4 py-3 text-sm font-mono text-theme-text-secondary">{f.regulation}</td>
                    </tr>
                ))}
            </tbody>
        </table>
         <h3 className="font-semibold text-theme-text-primary mt-6 mb-2">Report Generation & Review</h3>
         <div className="p-4 bg-theme-bg rounded-md border border-theme-border text-sm text-theme-text-secondary italic">
            (Placeholder: A workflow to auto-generate the draft Report of Examination from findings, manage internal peer review, and share the final version with the institution.)
        </div>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">Generate Draft Report</button>
    </PageSection>
);

const RemediationPhase = ({ exam }) => (
     <PageSection title="Follow-up & Remediation" icon={<ArrowPathIcon />}>
         <p className="text-sm text-theme-text-secondary mb-4">
            Trackable issues created from finalized report findings. Status updates here will feed back into the institution's overall risk score.
        </p>
         <table className="min-w-full divide-y divide-theme-border">
            <thead className="bg-black bg-opacity-20">
                <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Finding ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Remediation Plan Submitted</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Due Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Status</th>
                </tr>
            </thead>
            <tbody className="bg-theme-bg-secondary divide-y divide-theme-border">
                {exam.remediation.map(r => (
                    <tr key={r.findingId}>
                        <td className="px-4 py-3 text-sm font-medium text-theme-text-primary">{r.findingId}</td>
                        <td className="px-4 py-3 text-sm text-theme-text-secondary">{r.action}</td>
                        <td className="px-4 py-3 text-sm text-theme-text-secondary">{r.dueDate}</td>
                        <td className="px-4 py-3 text-sm text-theme-text-secondary">{r.status}</td>
                    </tr>
                ))}
                 {exam.remediation.length === 0 && (
                    <tr><td colSpan="4" className="p-4 text-center text-sm text-theme-text-secondary italic">No remediation items for this exam yet.</td></tr>
                 )}
            </tbody>
        </table>
         <div className="p-4 bg-theme-bg rounded-md border border-theme-border text-sm text-theme-text-secondary italic mt-4">
            (Placeholder: Supervisors can approve/reject submitted remediation plans here and receive alerts for missed deadlines.)
        </div>
    </PageSection>
);

export default ExaminationsPage;