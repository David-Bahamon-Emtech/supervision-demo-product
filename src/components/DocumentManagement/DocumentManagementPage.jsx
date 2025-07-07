import React, { useState, useMemo } from 'react';
import { FolderIcon, MagnifyingGlassIcon, DocumentTextIcon, ClockIcon, EyeIcon, ArrowDownTrayIcon, ArchiveBoxIcon, UserGroupIcon, FunnelIcon } from '@heroicons/react/24/outline';

// --- Mock Data ---
// We'll use a subset of a real data structure to simulate the library
const mockDocumentLibrary = [
    { id: 'doc_001', name: 'AlphaCorp_Business_Plan_v2.1.pdf', type: 'Business Plan', entity: 'Oakmark Strategic Holdings', version: '2.1', uploadedBy: 's.connor@alphacorp.demo', uploadDate: '2025-01-10', status: 'Active', contextLink: 'APP-2401-0001' },
    { id: 'doc_002', name: 'AlphaCorp_AML_CFT_Policy_v1.5.docx', type: 'AML/CFT Policy', entity: 'Oakmark Strategic Holdings', version: '1.5', uploadedBy: 's.connor@alphacorp.demo', uploadDate: '2025-01-10', status: 'Active', contextLink: 'APP-2401-0001' },
    { id: 'doc_004', name: 'BetaSolutions_Incorporation_Certificate.pdf', type: 'Certificate of Incorporation', entity: 'Pinnacle Stone Investments', version: '1.0', uploadedBy: 'e.ripley@betabank.demo', uploadDate: '2025-02-01', status: 'Active', contextLink: 'APP-2403-0003' },
    { id: 'EXAM-001-WP-01.docx', name: 'Loan_Portfolio_Analysis_WP.docx', type: 'Working Paper', entity: 'Oakmark Strategic Holdings', version: '1.0', uploadedBy: 'bbuilder@regulator.demo', uploadDate: '2025-06-18', status: 'Active', contextLink: 'EXAM-2025-001' },
    { id: 'doc_013', name: 'Circular_2025-06-10_CASP_Capital_Adequacy.pdf', type: 'Regulatory Circular', entity: 'System-wide', version: '1.0', uploadedBy: 'awonderland@regulator.demo', uploadDate: '2025-06-10', status: 'Active', contextLink: 'RU-2025-001' },
    { id: 'archive_001', name: 'AlphaCorp_Business_Plan_v2.0.pdf', type: 'Business Plan', entity: 'Oakmark Strategic Holdings', version: '2.0', uploadedBy: 's.connor@alphacorp.demo', uploadDate: '2024-11-20', status: 'Archived', contextLink: 'APP-2401-0001' },
];

const mockDocDetails = {
    versionHistory: [
        { version: '2.1', date: '2025-01-10', user: 's.connor@alphacorp.demo', change: 'Updated financial projections.' },
        { version: '2.0', date: '2024-11-20', user: 's.connor@alphacorp.demo', change: 'Initial draft for application.' },
    ],
    auditTrail: [
        { date: '2025-06-23', user: 'bbuilder@regulator.demo', action: 'View' },
        { date: '2025-06-22', user: 'awonderland@regulator.demo', action: 'View' },
        { date: '2025-01-10', user: 's.connor@alphacorp.demo', action: 'Upload' },
    ]
};

// --- Helper Components ---
const FilterInput = ({ label, children }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        {children}
    </div>
);

const DocumentManagementPage = () => {
    const [selectedDoc, setSelectedDoc] = useState(null);

    const handleSelectDoc = (doc) => {
        if (selectedDoc && selectedDoc.id === doc.id) {
            setSelectedDoc(null);
        } else {
            setSelectedDoc(doc);
        }
    };
    
    return (
        <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Document Library</h1>
                <button onClick={() => alert("This would typically be handled within a specific case file (e.g., an application or examination).")} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700">
                    + Upload Document
                </button>
            </div>

            {/* 3. Search and Filtering */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div className="lg:col-span-2">
                        <FilterInput label="Search by Name or Content">
                             <input type="search" placeholder="e.g., 'AML Policy' or 'Pioneer Holdings'" className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                        </FilterInput>
                    </div>
                    <FilterInput label="Document Type">
                        <select className="mt-1 w-full p-2 border border-gray-300 rounded-md"><option>All Types</option><option>AML/CFT Policy</option><option>Business Plan</option><option>Working Paper</option></select>
                    </FilterInput>
                     <FilterInput label="Entity">
                        <select className="mt-1 w-full p-2 border border-gray-300 rounded-md"><option>All Entities</option><option>Oakmark Strategic Holdings</option><option>Pioneer Holdings</option></select>
                    </FilterInput>
                    <button className="px-4 py-2 bg-gray-700 text-white font-semibold rounded-md shadow-sm hover:bg-gray-800 h-10">Search</button>
                 </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* 1. Centralized Document Library Table */}
                <div className="flex-grow">
                    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Document Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Entity</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Version</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {mockDocumentLibrary.map(doc => (
                                        <tr key={doc.id} onClick={() => handleSelectDoc(doc)} className="hover:bg-blue-50 cursor-pointer">
                                            <td className="px-6 py-4 text-sm font-medium text-blue-700">{doc.name}</td>
                                            <td className="px-6 py-4 text-sm">{doc.type}</td>
                                            <td className="px-6 py-4 text-sm">{doc.entity}</td>
                                            <td className="px-6 py-4 text-sm text-center">{doc.version}</td>
                                            <td className="px-6 py-4 text-sm">{doc.uploadDate}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`px-2 py-1 text-xs rounded-full ${doc.status === 'Archived' ? 'bg-gray-200 text-gray-800' : 'bg-green-100 text-green-800'}`}>{doc.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Document Details Panel */}
                {selectedDoc && (
                     <div className="w-full lg:w-1/3 lg:max-w-md flex-shrink-0">
                         <div className="bg-white p-4 rounded-lg shadow-lg sticky top-6">
                            <h3 className="font-bold text-gray-800 break-words">{selectedDoc.name}</h3>
                            <button onClick={() => setSelectedDoc(null)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">&times;</button>
                            
                            {/* 2, 7. Metadata & Integration */}
                            <div className="mt-4 border-t pt-4 text-sm space-y-2">
                                <p><strong>Type:</strong> {selectedDoc.type}</p>
                                <p><strong>Uploaded By:</strong> {selectedDoc.uploadedBy}</p>
                                <p><strong>Context Link:</strong> <a href="#" className="text-blue-600 hover:underline">{selectedDoc.contextLink}</a></p>
                            </div>

                            {/* Actions */}
                            <div className="mt-4 flex flex-wrap gap-2">
                                <button className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"><ArrowDownTrayIcon className="w-4 h-4 mr-1" /> Download</button>
                                <button onClick={() => alert("This document would be archived and hidden from the main view, but remain accessible via search.")} className="flex items-center px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"><ArchiveBoxIcon className="w-4 h-4 mr-1" /> Archive</button>
                                <button onClick={() => alert("This would show a detailed permissions matrix for which roles/users can view, edit, or share this document.")} className="flex items-center px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded-md hover:bg-gray-300"><UserGroupIcon className="w-4 h-4 mr-1" /> Permissions</button>
                            </div>

                            {/* 5. Version History */}
                             <div className="mt-4 border-t pt-4">
                                <h4 className="font-semibold text-gray-700 mb-2">Version History</h4>
                                <ul className="text-xs space-y-1 max-h-24 overflow-y-auto">
                                    {mockDocDetails.versionHistory.map(v => <li key={v.version}><strong>v{v.version}</strong> on {v.date} - <em>{v.change}</em></li>)}
                                </ul>
                                <button className="text-xs text-blue-600 hover:underline mt-1">Compare Versions...</button>
                            </div>
                            
                            {/* 6. Audit Trail */}
                             <div className="mt-4 border-t pt-4">
                                <h4 className="font-semibold text-gray-700 mb-2">Audit Trail</h4>
                                <ul className="text-xs space-y-1 max-h-24 overflow-y-auto">
                                   {mockDocDetails.auditTrail.map((log, i) => <li key={i}>{log.date}: <strong>{log.action}</strong> by {log.user}</li>)}
                                </ul>
                            </div>
                         </div>
                     </div>
                )}
            </div>
        </div>
    );
};

export default DocumentManagementPage;