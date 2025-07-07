import React, { useState } from 'react';
import { UserGroupIcon, KeyIcon, BellIcon, CogIcon, ShieldCheckIcon, DocumentTextIcon, UsersIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

// --- Mock Data ---
const mockUsers = [
    { id: 'reg_001', name: 'Alice Wonderland', role: 'Administrator', status: 'Active', type: 'Internal' },
    { id: 'reg_002', name: 'Bobby Mack', role: 'Senior Licensing Officer', status: 'Active', type: 'Internal' },
    { id: 'reg_006', name: 'Frank Castle', role: 'Examiner', status: 'Active', type: 'Internal' },
    { id: 'ext_001', name: 's.connor@alphacorp.demo', role: 'External Applicant', status: 'Active', type: 'External' },
    { id: 'ext_002', name: 'e.ripley@betabank.demo', role: 'External Applicant', status: 'Deactivated', type: 'External' },
];

const mockRoles = [
    { id: 'admin', name: 'Administrator', description: 'Full system access.' },
    { id: 'examiner', name: 'Examiner', description: 'Access to Examinations and related case files.' },
    { id: 'readonly', name: 'Read-Only Auditor', description: 'View-only access to most modules.' },
];

const mockPermissions = {
    examiner: [
        { module: 'Examinations', permissions: ['View', 'Create', 'Edit'] },
        { module: 'Document Management', permissions: ['View', 'Upload'] },
        { module: 'Risk Assessment', permissions: ['View'] },
    ]
};

const mockNotificationTemplates = [
    { id: 'N-01', event: 'Application Status Change', channels: ['In-App', 'Email'], enabled: true },
    { id: 'N-02', event: 'Compliance Report Due (30d)', channels: ['Email'], enabled: true },
    { id: 'N-03', event: 'License Expiration (60d)', channels: ['In-App', 'Email'], enabled: true },
    { id: 'N-04', event: 'New Task Assigned', channels: ['In-App'], enabled: false },
];

// --- Helper Components ---
const SettingsCard = ({ title, children, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center text-xl font-semibold text-gray-800 mb-4 border-b pb-3">
            {React.cloneElement(icon, { className: 'w-6 h-6 mr-3 text-gray-500' })}
            {title}
        </div>
        <div>{children}</div>
    </div>
);

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('users_roles');
    const [selectedRole, setSelectedRole] = useState(null);

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'users_roles':
                return (
                    <div className="space-y-8">
                        {/* User Management */}
                        <SettingsCard title="User Management" icon={<UsersIcon />}>
                            <button className="mb-4 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">Add New User</button>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50"><tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Name / Email</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Role</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                                    <th className="px-4 py-2"></th>
                                </tr></thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {mockUsers.map(user => (
                                        <tr key={user.id}>
                                            <td className="px-4 py-2 text-sm">{user.name}</td>
                                            <td className="px-4 py-2 text-sm">{user.role}</td>
                                            <td className="px-4 py-2 text-sm">{user.type}</td>
                                            <td className="px-4 py-2 text-sm"><span className={`px-2 py-0.5 rounded-full text-xs ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{user.status}</span></td>
                                            <td className="px-4 py-2 text-xs text-right"><a href="#" className="text-blue-600 hover:underline">Edit</a> | <a href="#" className="text-blue-600 hover:underline ml-2">Activity Log</a></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </SettingsCard>

                        {/* Role-Based Access Control */}
                        <SettingsCard title="Role-Based Access Control (RBAC)" icon={<ShieldCheckIcon />}>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-1">
                                    <button className="w-full mb-2 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">Add New Role</button>
                                    <ul className="space-y-1">
                                        {mockRoles.map(role => (
                                            <li key={role.id} onClick={() => setSelectedRole(role.id)} className={`p-2 rounded-md cursor-pointer text-sm ${selectedRole === role.id ? 'bg-blue-100 font-semibold' : 'hover:bg-gray-50'}`}>{role.name}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="md:col-span-2 p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-semibold text-gray-700">Permissions for "{selectedRole ? mockRoles.find(r=>r.id===selectedRole).name : 'Select a Role'}"</h4>
                                    {selectedRole && mockPermissions[selectedRole] ? (
                                        <ul className="mt-2 text-sm space-y-2">
                                            {mockPermissions[selectedRole].map(p => <li key={p.module}><strong>{p.module}:</strong> {p.permissions.join(', ')}</li>)}
                                        </ul>
                                    ) : <p className="text-sm text-gray-500 mt-2 italic">(Select a role to view or edit its granular permissions across all modules).</p>}
                                </div>
                             </div>
                        </SettingsCard>

                         {/* Password Policy */}
                         <SettingsCard title="Password Policy Management" icon={<KeyIcon />}>
                             <div className="text-sm text-gray-600 italic">
                                (Placeholder: An administrator interface to enforce password complexity, expiration, and history requirements would be configured here.)
                             </div>
                         </SettingsCard>
                    </div>
                );
            case 'notifications':
                 return (
                    <div className="space-y-8">
                        <SettingsCard title="Notification & Alert Templates" icon={<BellIcon />}>
                            <p className="text-sm text-gray-600 mb-4">Enable, disable, and customize templates for automated system alerts.</p>
                             <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50"><tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Event Trigger</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Channels</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                                    <th className="px-4 py-2"></th>
                                </tr></thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {mockNotificationTemplates.map(t => (
                                        <tr key={t.id}>
                                            <td className="px-4 py-2 text-sm">{t.event}</td>
                                            <td className="px-4 py-2 text-sm">{t.channels.join(', ')}</td>
                                            <td className="px-4 py-2 text-sm"><span className={`px-2 py-0.5 rounded-full text-xs ${t.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'}`}>{t.enabled ? 'Enabled' : 'Disabled'}</span></td>
                                            <td className="px-4 py-2 text-xs text-right"><a href="#" className="text-blue-600 hover:underline">Edit Template</a></td>
                                        </tr>
                                    ))}
                                </tbody>
                             </table>
                        </SettingsCard>
                         <SettingsCard title="Mailing Lists" icon={<EnvelopeIcon />}>
                             <div className="text-sm text-gray-600 italic">
                                (Placeholder: A tool to manage mailing lists for disseminating announcements to specific groups, e.g., "All Commercial Banks," would be here.)
                             </div>
                         </SettingsCard>
                    </div>
                );
            case 'system_config':
                 return (
                     <div className="space-y-8">
                         <SettingsCard title="System-Wide Audit Trail" icon={<DocumentTextIcon />}>
                              <div className="text-sm text-gray-600 italic">
                                (Placeholder: A central, searchable interface to view and export a comprehensive audit trail of all significant actions taken by all users across the system.)
                             </div>
                             <button className="mt-4 px-3 py-1 bg-gray-200 text-sm rounded hover:bg-gray-300">Export Full Audit Log</button>
                         </SettingsCard>
                         <SettingsCard title="Third-Party Integrations" icon={<CogIcon />}>
                             <div className="text-sm text-gray-600 italic">
                                (Placeholder: An interface for configuring and managing integrations with systems like e-signature services or external data warehouses.)
                            </div>
                         </SettingsCard>
                         <SettingsCard title="System Parameters" icon={<UserGroupIcon />}>
                              <div className="text-sm text-gray-600 italic">
                                (Placeholder: A section to manage system-wide parameters like official reporting periods, public holidays for SLA calculations, and regulator branding.)
                            </div>
                         </SettingsCard>
                     </div>
                 );
            default:
                return null;
        }
    };
    
    return (
        <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Settings</h1>

            <div className="mb-6 border-b border-gray-300">
                <nav className="-mb-px flex space-x-8">
                    <button onClick={() => setActiveTab('users_roles')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'users_roles' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>User & Role Management</button>
                    <button onClick={() => setActiveTab('notifications')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'notifications' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Notifications</button>
                    <button onClick={() => setActiveTab('system_config')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'system_config' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>System Configuration</button>
                </nav>
            </div>
            
            <div>{renderActiveTab()}</div>
        </div>
    );
};

export default SettingsPage;