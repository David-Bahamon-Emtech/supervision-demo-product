import React, { useState, useMemo } from 'react';
import { BriefcaseIcon, MagnifyingGlassIcon, DocumentPlusIcon, UsersIcon, CheckCircleIcon, DocumentTextIcon, CodeBracketSquareIcon, CloudArrowDownIcon, ExclamationTriangleIcon, DocumentCheckIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

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


// --- Helper Components ---
const PageSection = ({ title, icon, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <div className="flex items-center text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
            {React.cloneElement(icon, { className: 'w-6 h-6 mr-3 text-gray-500' })}
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
        <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Examinations</h1>
                <button onClick={handleCreateNewExam} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700">
                    + Initiate New Examination
                </button>
            </div>
            
            <PageSection title="Ongoing & Recent Examinations" icon={<MagnifyingGlassIcon />}>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Exam ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Institution</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {mockExaminations.map(exam => (
                                <tr key={exam.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-blue-600">{exam.id}</td>
                                    <td className="px-6 py-4 text-sm text-gray-800">{exam.institutionName}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{exam.type}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{exam.status}</td>
                                    <td className="px-6 py-4 text-right"><button onClick={() => setSelectedExam(exam)} className="text-sm text-blue-600 hover:underline">Open Case File</button></td>
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
        <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
            <button onClick={onBack} className="text-sm text-blue-600 hover:underline mb-4">&larr; Back to All Examinations</button>
            <h1 className="text-3xl font-bold text-gray-800">{exam.id}: {exam.institutionName}</h1>
            <p className="text-gray-600">{exam.type}</p>

            <div className="mt-6 border-b border-gray-300">
                <nav className="-mb-px flex space-x-6 overflow-x-auto">
                    {['planning', 'fieldwork', 'findings', 'remediation'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`${activeTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm capitalize`}>
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
            <div className="md:col-span-2 space-y-4">
                <h3 className="font-semibold text-gray-700">360-Degree Preliminary Analysis</h3>
                <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
                    <p><strong>Current Risk Score:</strong> 4.1 (High) </p>
                    <p><strong>Compliance Summary (24m):</strong> 2 Overdue Filings, 1 previous finding on AML controls.</p>
                    <p><strong>Previous Exam (EXAM-2023-005):</strong> Findings related to AML transaction monitoring.</p>
                    <p><strong>Key Personnel:</strong> John Smith (CEO), Jane Doe (CCO)</p>
                </div>
                 <h3 className="font-semibold text-gray-700">Work Program</h3>
                 <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
                    <label className="flex items-center"><input type="checkbox" className="h-4 w-4 mr-2" defaultChecked /> Review board minutes for Q1/Q2 2025.</label>
                    <label className="flex items-center"><input type="checkbox" className="h-4 w-4 mr-2" defaultChecked /> Sample 20 consumer loans for underwriting quality.</label>
                    <label className="flex items-center"><input type="checkbox" className="h-4 w-4 mr-2" /> Test IT general controls for core banking system.</label>
                 </div>
            </div>
            <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Exam Details</h3>
                <div className="p-4 bg-gray-50 rounded-lg text-sm">
                    <p><strong>Scope:</strong> {exam.scope}</p>
                    <p><strong>Start Date:</strong> {exam.startDate}</p>
                    <p><strong>Lead Examiner:</strong> {exam.leadExaminer}</p>
                </div>
                 <h3 className="font-semibold text-gray-700">Assigned Team</h3>
                 <ul className="p-4 bg-gray-50 rounded-lg text-sm list-disc list-inside">
                     {exam.team.map(t => <li key={t.name}>{t.name} ({t.role})</li>)}
                 </ul>
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
                <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Request for Information (RFI) Portal</h3>
                    <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600 italic">
                        (Placeholder: A list of RFIs sent to the institution would appear here, showing what was requested, when, and the status of their submission. Examiners could issue new RFIs from this interface.)
                    </div>
                     <h3 className="font-semibold text-gray-700 mt-4 mb-2">Digital Working Papers</h3>
                    <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600 italic">
                        (Placeholder: A file-system-like view of the examiners' notes, testing procedures, and observations, with links to specific pieces of uploaded evidence.)
                    </div>
                     <h3 className="font-semibold text-gray-700 mt-4 mb-2">Offline Mode</h3>
                     <button className="w-full p-3 bg-gray-600 text-white rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-700">
                        <CloudArrowDownIcon className="w-5 h-5" />
                        <span>Download Case File for Offline Work</span>
                    </button>
                </div>
                 <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Smart Contract Analysis Tool</h3>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <label className="text-sm font-medium">Contract Address</label>
                        <input type="text" value={contractAddress} onChange={e => setContractAddress(e.target.value)} className="w-full p-2 border rounded-md my-2" placeholder="0x..." />
                        <button onClick={handleScanContract} className="w-full p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Scan Contract</button>
                        {analysisResult && (
                             <div className="mt-4 text-xs space-y-2">
                                 <h4 className="font-bold text-sm">Analysis Results:</h4>
                                 <p className="text-red-600 font-semibold">Vulnerabilities Found: {analysisResult.vulnerabilities.map(v => `${v.type} (${v.confidence})`).join(', ')}</p>
                                 <p className="text-orange-600 font-semibold">Non-Compliant Functions: {analysisResult.nonCompliantFunctions.join(', ')}</p>
                                 <details><summary className="cursor-pointer">View Source</summary><pre className="bg-gray-800 text-white p-2 rounded-md mt-1 max-h-40 overflow-auto">{analysisResult.sourceCode}</pre></details>
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
        <h3 className="font-semibold text-gray-700 mb-2">Findings Log</h3>
         <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600 italic mb-4">
            (Placeholder: A form to log new structured findings, capturing severity, category, regulation citation, and linked evidence.)
        </div>
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
                <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Severity</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Category</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Regulation</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {exam.findings.map(f => (
                    <tr key={f.id}>
                        <td className="px-4 py-2 text-sm"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${f.severity === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{f.severity}</span></td>
                        <td className="px-4 py-2 text-sm">{f.category}</td>
                        <td className="px-4 py-2 text-sm">{f.description}</td>
                        <td className="px-4 py-2 text-sm font-mono">{f.regulation}</td>
                    </tr>
                ))}
            </tbody>
        </table>
         <h3 className="font-semibold text-gray-700 mt-6 mb-2">Report Generation & Review</h3>
         <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600 italic">
            (Placeholder: A workflow to auto-generate the draft Report of Examination from findings, manage internal peer review, and share the final version with the institution.)
        </div>
        <button className="mt-4 px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700">Generate Draft Report</button>
    </PageSection>
);

const RemediationPhase = ({ exam }) => (
     <PageSection title="Follow-up & Remediation" icon={<ArrowPathIcon />}>
         <p className="text-sm text-gray-600 mb-4">
            Trackable issues created from finalized report findings. Status updates here will feed back into the institution's overall risk score.
        </p>
         <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
                <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Finding ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Remediation Plan Submitted</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Due Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {exam.remediation.map(r => (
                    <tr key={r.findingId}>
                        <td className="px-4 py-2 text-sm font-medium">{r.findingId}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{r.action}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{r.dueDate}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{r.status}</td>
                    </tr>
                ))}
                 {exam.remediation.length === 0 && (
                    <tr><td colSpan="4" className="p-4 text-center text-sm text-gray-500">No remediation items for this exam yet.</td></tr>
                 )}
            </tbody>
        </table>
         <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600 italic mt-4">
            (Placeholder: Supervisors can approve/reject submitted remediation plans here and receive alerts for missed deadlines.)
        </div>
    </PageSection>
);


export default ExaminationsPage;