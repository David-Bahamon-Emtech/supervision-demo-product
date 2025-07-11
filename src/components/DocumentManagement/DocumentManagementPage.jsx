import React, { useState, useMemo } from 'react';
import { FolderIcon, MagnifyingGlassIcon, DocumentTextIcon, ClockIcon, EyeIcon, ArrowDownTrayIcon, ArchiveBoxIcon, UserGroupIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

// --- Theme Classes (for reference) ---
// Main BG: bg-theme-bg
// Card BG: bg-theme-bg-secondary
// Primary Text: text-theme-text-primary
// Secondary Text: text-theme-text-secondary
// Accent Color: text-theme-accent / bg-theme-accent
// Borders: border-theme-border

// --- Mock Data ---
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
        <label className="block text-sm font-medium text-theme-text-secondary mb-1">{label}</label>
        {children}
    </div>
);

const DocumentManagementPage = () => {
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [entityFilter, setEntityFilter] = useState('All');

    const handleSelectDoc = (doc) => {
        if (selectedDoc && selectedDoc.id === doc.id) {
            setSelectedDoc(null);
        } else {
            setSelectedDoc(doc);
        }
    };
    
    const filteredDocuments = useMemo(() => {
        return mockDocumentLibrary.filter(doc => {
            const matchesSearch = searchTerm === '' || 
                doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.entity.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = typeFilter === 'All' || doc.type === typeFilter;
            const matchesEntity = entityFilter === 'All' || doc.entity === entityFilter;
            return matchesSearch && matchesType && matchesEntity;
        });
    }, [searchTerm, typeFilter, entityFilter]);
    
    const uniqueDocTypes = ['All', ...new Set(mockDocumentLibrary.map(d => d.type))];
    const uniqueEntities = ['All', ...new Set(mockDocumentLibrary.map(d => d.entity))];

    return (
        <div className="p-4 md:p-6 bg-theme-bg min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-theme-text-primary">Document Library</h1>
                    <p className="text-theme-text-secondary mt-1">Centralized repository for all regulatory and entity-submitted documents.</p>
                </div>
                <button onClick={() => alert("This would typically be handled within a specific case file (e.g., an application or examination).")} 
                    className="px-4 py-2 bg-theme-accent text-sidebar-bg font-semibold rounded-md shadow-sm hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-bg focus:ring-theme-accent"
                >
                    + Upload Document
                </button>
            </div>

            <div className="bg-theme-bg-secondary p-4 rounded-xl shadow-lg mb-8 border border-theme-border">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div className="lg:col-span-2">
                        <FilterInput label="Search by Name or Entity">
                             <input type="search" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="e.g., 'AML Policy' or 'Pioneer Holdings'" className="mt-1 w-full p-2 bg-theme-bg border border-theme-border rounded-md text-theme-text-primary focus:ring-theme-accent focus:border-theme-accent" />
                        </FilterInput>
                    </div>
                    <FilterInput label="Document Type">
                        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="mt-1 w-full p-2 bg-theme-bg border border-theme-border rounded-md text-theme-text-primary focus:ring-theme-accent focus:border-theme-accent">
                            {uniqueDocTypes.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </FilterInput>
                     <FilterInput label="Entity">
                        <select value={entityFilter} onChange={e => setEntityFilter(e.target.value)} className="mt-1 w-full p-2 bg-theme-bg border border-theme-border rounded-md text-theme-text-primary focus:ring-theme-accent focus:border-theme-accent">
                            {uniqueEntities.map(entity => <option key={entity} value={entity}>{entity}</option>)}
                        </select>
                    </FilterInput>
                 </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-grow">
                    <div className="bg-theme-bg-secondary shadow-lg rounded-xl overflow-hidden border border-theme-border">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-theme-border">
                                <thead className="bg-black bg-opacity-20">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Document Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Entity</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Version</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-theme-border">
                                    {filteredDocuments.map(doc => (
                                        <tr key={doc.id} onClick={() => handleSelectDoc(doc)} className={`cursor-pointer hover:bg-black hover:bg-opacity-20 ${selectedDoc?.id === doc.id ? 'bg-black bg-opacity-20' : ''}`}>
                                            <td className="px-6 py-4 text-sm font-medium text-theme-accent">{doc.name}</td>
                                            <td className="px-6 py-4 text-sm text-theme-text-secondary">{doc.type}</td>
                                            <td className="px-6 py-4 text-sm text-theme-text-primary">{doc.entity}</td>
                                            <td className="px-6 py-4 text-sm text-center text-theme-text-secondary">{doc.version}</td>
                                            <td className="px-6 py-4 text-sm text-theme-text-secondary">{doc.uploadDate}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${doc.status === 'Archived' ? 'bg-gray-700 text-gray-300' : 'bg-green-900 text-green-300'}`}>{doc.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {selectedDoc && (
                     <div className="w-full lg:w-1/3 lg:max-w-md flex-shrink-0">
                         <div className="bg-theme-bg-secondary p-4 rounded-xl shadow-lg sticky top-6 border border-theme-border">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-theme-text-primary break-words pr-8">{selectedDoc.name}</h3>
                                <button onClick={() => setSelectedDoc(null)} className="p-1 rounded-full text-theme-text-secondary hover:bg-black hover:bg-opacity-20">
                                    <XMarkIcon className="w-5 h-5"/>
                                </button>
                            </div>
                            
                            <div className="mt-4 border-t border-theme-border pt-4 text-sm space-y-2">
                                <p><strong className="text-theme-text-secondary">Type:</strong> {selectedDoc.type}</p>
                                <p><strong className="text-theme-text-secondary">Uploaded By:</strong> {selectedDoc.uploadedBy}</p>
                                <p><strong className="text-theme-text-secondary">Context Link:</strong> <a href="#" className="text-blue-400 hover:text-theme-accent hover:underline">{selectedDoc.contextLink}</a></p>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                <button className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"><ArrowDownTrayIcon className="w-4 h-4 mr-2" /> Download</button>
                                <button onClick={() => alert("This document would be archived and hidden from the main view, but remain accessible via search.")} className="flex items-center px-3 py-1.5 bg-gray-700 text-white text-sm rounded-md hover:bg-gray-600"><ArchiveBoxIcon className="w-4 h-4 mr-2" /> Archive</button>
                                <button onClick={() => alert("This would show a detailed permissions matrix for which roles/users can view, edit, or share this document.")} className="flex items-center px-3 py-1.5 bg-gray-700 text-white text-sm rounded-md hover:bg-gray-600"><UserGroupIcon className="w-4 h-4 mr-2" /> Permissions</button>
                            </div>

                             <div className="mt-4 border-t border-theme-border pt-4">
                                <h4 className="font-semibold text-theme-text-primary mb-2">Version History</h4>
                                <ul className="text-xs space-y-2 max-h-24 overflow-y-auto pr-2">
                                    {mockDocDetails.versionHistory.map(v => <li key={v.version} className="text-theme-text-secondary"><strong className="text-theme-text-primary">v{v.version}</strong> on {v.date} - <em>{v.change}</em></li>)}
                                </ul>
                                <button className="text-xs text-blue-400 hover:underline mt-1">Compare Versions...</button>
                            </div>
                            
                             <div className="mt-4 border-t border-theme-border pt-4">
                                <h4 className="font-semibold text-theme-text-primary mb-2">Audit Trail</h4>
                                <ul className="text-xs space-y-2 max-h-24 overflow-y-auto pr-2">
                                   {mockDocDetails.auditTrail.map((log, i) => <li key={i} className="text-theme-text-secondary">{log.date}: <strong className="text-theme-text-primary">{log.action}</strong> by {log.user}</li>)}
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