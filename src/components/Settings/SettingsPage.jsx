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
    admin: [
        { module: 'Licensing', permissions: ['View', 'Create', 'Edit', 'Delete', 'Approve'] },
        { module: 'Examinations', permissions: ['View', 'Create', 'Edit', 'Delete', 'Approve'] },
        { module: 'Document Management', permissions: ['View', 'Upload', 'Delete'] },
        { module: 'Risk Assessment', permissions: ['View', 'Configure'] },
        { module: 'User Management', permissions: ['View', 'Create', 'Edit', 'Delete'] },
    ],
    examiner: [
        { module: 'Examinations', permissions: ['View', 'Create', 'Edit'] },
        { module: 'Document Management', permissions: ['View', 'Upload'] },
        { module: 'Risk Assessment', permissions: ['View'] },
        { module: 'Licensing', permissions: ['View'] },
    ],
    readonly: [
        { module: 'Licensing', permissions: ['View'] },
        { module: 'Examinations', permissions: ['View'] },
        { module: 'Document Management', permissions: ['View'] },
        { module: 'Risk Assessment', permissions: ['View'] },
        { module: 'User Management', permissions: ['View'] },
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
    <div className="bg-theme-bg-secondary p-6 rounded-xl shadow-lg border border-theme-border">
        <div className="flex items-center text-xl font-semibold text-theme-text-primary mb-4 border-b border-theme-border pb-3">
            {React.cloneElement(icon, { className: 'w-6 h-6 mr-3 text-theme-text-secondary' })}
            {title}
        </div>
        <div>{children}</div>
    </div>
);

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('users_roles');
    const [selectedRole, setSelectedRole] = useState('admin');

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'users_roles':
                return (
                    <div className="space-y-8">
                        {/* User Management */}
                        <SettingsCard title="User Management" icon={<UsersIcon />}>
                            <button className="mb-4 px-4 py-2 bg-theme-accent text-sidebar-bg text-sm font-semibold rounded-md shadow-sm hover:brightness-110 transition-all">Add New User</button>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-theme-border">
                                    <thead className="bg-black bg-opacity-20"><tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Name / Email</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Role</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Type</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Actions</th>
                                    </tr></thead>
                                    <tbody className="divide-y divide-theme-border">
                                        {mockUsers.map(user => (
                                            <tr key={user.id} className="hover:bg-theme-bg">
                                                <td className="px-4 py-4 text-sm font-medium text-theme-text-primary">{user.name}</td>
                                                <td className="px-4 py-4 text-sm text-theme-text-secondary">{user.role}</td>
                                                <td className="px-4 py-4 text-sm text-theme-text-secondary">{user.type}</td>
                                                <td className="px-4 py-4 text-sm"><span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${user.status === 'Active' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>{user.status}</span></td>
                                                <td className="px-4 py-4 text-xs text-right"><a href="#" className="text-blue-400 hover:text-theme-accent">Edit</a> <span className="text-theme-text-secondary mx-1">|</span> <a href="#" className="text-blue-400 hover:text-theme-accent">Activity Log</a></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </SettingsCard>

                        {/* Role-Based Access Control */}
                        <SettingsCard title="Role-Based Access Control (RBAC)" icon={<ShieldCheckIcon />}>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-1">
                                    <button className="w-full mb-3 px-4 py-2 bg-theme-accent text-sidebar-bg text-sm font-semibold rounded-md shadow-sm hover:brightness-110 transition-all">Add New Role</button>
                                    <ul className="space-y-1">
                                        {mockRoles.map(role => (
                                            <li key={role.id} onClick={() => setSelectedRole(role.id)} className={`p-2 rounded-md cursor-pointer text-sm font-medium ${selectedRole === role.id ? 'bg-black bg-opacity-20 text-theme-accent' : 'text-theme-text-primary hover:bg-black hover:bg-opacity-10'}`}>{role.name}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="md:col-span-2 p-4 bg-theme-bg rounded-lg border border-theme-border">
                                    <h4 className="font-semibold text-theme-text-primary">Permissions for "{selectedRole ? mockRoles.find(r=>r.id===selectedRole).name : 'Select a Role'}"</h4>
                                    {selectedRole && mockPermissions[selectedRole] ? (
                                        <ul className="mt-2 text-sm space-y-2">
                                            {mockPermissions[selectedRole].map(p => <li key={p.module} className="text-theme-text-secondary"><strong className="text-theme-text-primary font-medium">{p.module}:</strong> {p.permissions.join(', ')}</li>)}
                                        </ul>
                                    ) : <p className="text-sm text-theme-text-secondary mt-2 italic">(Select a role to view or edit its granular permissions across all modules).</p>}
                                </div>
                             </div>
                        </SettingsCard>

                         {/* Password Policy */}
                         <SettingsCard title="Password Policy Management" icon={<KeyIcon />}>
                             <div className="text-sm text-theme-text-secondary italic">
                                (Placeholder: An administrator interface to enforce password complexity, expiration, and history requirements would be configured here.)
                             </div>
                         </SettingsCard>
                    </div>
                );
            case 'notifications':
                 return (
                    <div className="space-y-8">
                        <SettingsCard title="Notification & Alert Templates" icon={<BellIcon />}>
                            <p className="text-sm text-theme-text-secondary mb-4">Enable, disable, and customize templates for automated system alerts.</p>
                             <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-theme-border">
                                    <thead className="bg-black bg-opacity-20"><tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Event Trigger</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Channels</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Actions</th>
                                    </tr></thead>
                                    <tbody className="divide-y divide-theme-border">
                                        {mockNotificationTemplates.map(t => (
                                            <tr key={t.id} className="hover:bg-theme-bg">
                                                <td className="px-4 py-4 text-sm font-medium text-theme-text-primary">{t.event}</td>
                                                <td className="px-4 py-4 text-sm text-theme-text-secondary">{t.channels.join(', ')}</td>
                                                <td className="px-4 py-4 text-sm"><span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${t.enabled ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-800'}`}>{t.enabled ? 'Enabled' : 'Disabled'}</span></td>
                                                <td className="px-4 py-4 text-xs text-right"><a href="#" className="text-blue-400 hover:text-theme-accent">Edit Template</a></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                             </div>
                        </SettingsCard>
                         <SettingsCard title="Mailing Lists" icon={<EnvelopeIcon />}>
                             <div className="text-sm text-theme-text-secondary italic">
                                (Placeholder: A tool to manage mailing lists for disseminating announcements to specific groups, e.g., "All Commercial Banks," would be here.)
                             </div>
                         </SettingsCard>
                    </div>
                );
            case 'system_config':
                 return (
                     <div className="space-y-8">
                         <SettingsCard title="System-Wide Audit Trail" icon={<DocumentTextIcon />}>
                              <div className="text-sm text-theme-text-secondary italic">
                                (Placeholder: A central, searchable interface to view and export a comprehensive audit trail of all significant actions taken by all users across the system.)
                             </div>
                             <button className="mt-4 px-4 py-2 bg-gray-700 text-sm font-medium text-theme-text-primary rounded-md hover:bg-gray-600">Export Full Audit Log</button>
                         </SettingsCard>
                         <SettingsCard title="Third-Party Integrations" icon={<CogIcon />}>
                             <div className="text-sm text-theme-text-secondary italic">
                                (Placeholder: An interface for configuring and managing integrations with systems like e-signature services or external data warehouses.)
                            </div>
                         </SettingsCard>
                         <SettingsCard title="System Parameters" icon={<UserGroupIcon />}>
                              <div className="text-sm text-theme-text-secondary italic">
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
        <div className="p-4 md:p-6 bg-theme-bg text-theme-text-primary min-h-screen">
            <h1 className="text-3xl font-bold mb-6">Settings</h1>

            <div className="mb-6 border-b border-theme-border">
                <nav className="-mb-px flex space-x-8">
                    <button onClick={() => setActiveTab('users_roles')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none ${activeTab === 'users_roles' ? 'border-theme-accent text-theme-accent' : 'border-transparent text-theme-text-secondary hover:text-theme-text-primary'}`}>User & Role Management</button>
                    <button onClick={() => setActiveTab('notifications')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none ${activeTab === 'notifications' ? 'border-theme-accent text-theme-accent' : 'border-transparent text-theme-text-secondary hover:text-theme-text-primary'}`}>Notifications</button>
                    <button onClick={() => setActiveTab('system_config')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none ${activeTab === 'system_config' ? 'border-theme-accent text-theme-accent' : 'border-transparent text-theme-text-secondary hover:text-theme-text-primary'}`}>System Configuration</button>
                </nav>
            </div>
            
            <div>{renderActiveTab()}</div>
        </div>
    );
};

export default SettingsPage;