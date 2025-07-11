import React from 'react';
import {
    BellIcon,
    ExclamationTriangleIcon,
    ArrowTrendingUpIcon,
    IdentificationIcon,
    ShieldCheckIcon,
    ExclamationCircleIcon,
    ClockIcon,
    CheckCircleIcon,
    BuildingLibraryIcon,
    ScaleIcon
} from '@heroicons/react/24/outline';

// --- Mock Data (Unchanged) ---
const mockDashboardData = {
    myTasks: [
        { id: 'T-01', description: 'Review new license application APP-2411-0013', module: 'Licensing', priority: 'High', dueDate: '2025-06-28' },
        { id: 'T-02', description: 'Finalize report for examination EXAM-2025-001', module: 'Examinations', priority: 'High', dueDate: '2025-07-01' },
        { id: 'T-03', description: 'Approve remediation plan for ENF-2025-002', module: 'Enforcement', priority: 'Medium', dueDate: '2025-07-05' },
        { id: 'T-04', description: 'Review overdue compliance submission for Pinnacle Stone', module: 'Reporting', priority: 'Low', dueDate: '2025-07-10' },
    ],
    highRiskWatchlist: [
        { id: 'ent_013', name: 'Lighthouse Financial Services', riskScore: 4.8, primaryDriver: 'High NPL Ratio' },
        { id: 'ent_002', name: 'Pinnacle Stone Investments', riskScore: 4.1, primaryDriver: 'Compliance Breaches' },
    ],
    systemicRisk: {
        car: { value: '15.2%', status: 'Normal' },
        npl: { value: '3.1%', status: 'Normal' },
        liquidity: { value: '125%', status: 'Normal' },
        marketVolatility: { value: 'Elevated', status: 'Warning' },
    },
    recentActivity: [
        { id: 'A-01', type: 'New License Application', description: 'Keystone Financial Innovations has submitted a new application.', time: '2h ago' },
        { id: 'A-02', type: 'Systemic Alert', description: 'Aggregate e-money float has breached a warning threshold.', time: '8h ago' },
        { id: 'A-03', type: 'Enforcement Case Opened', description: 'A new case ENF-2025-003 has been opened for Pinnacle Stone.', time: '1d ago' },
    ]
};

// --- Helper Components (Updated for Dark Theme) ---
const DashboardWidget = ({ title, children, icon, className = '' }) => (
    <div className={`bg-theme-bg-secondary p-4 rounded-lg shadow-md h-full flex flex-col border border-theme-border ${className}`}>
        <div className="flex items-center text-lg font-semibold text-theme-text-primary mb-3 border-b border-theme-border pb-2">
            {React.cloneElement(icon, { className: 'w-6 h-6 mr-2 text-theme-text-secondary' })}
            {title}
        </div>
        <div className="flex-grow">{children}</div>
    </div>
);

const TaskItem = ({ task }) => {
    const priorityColors = {
        High: 'border-red-500',
        Medium: 'border-orange-500',
        Low: 'border-yellow-500',
    };
    return (
        <div className={`p-2 border-l-4 ${priorityColors[task.priority]} bg-theme-bg rounded-r-md`}>
            <p className="text-sm font-medium text-theme-text-primary">{task.description}</p>
            <p className="text-xs text-theme-text-secondary">{task.module} - Due: {task.dueDate}</p>
        </div>
    );
};


const DashboardPage = () => {
    const currentUser = { name: 'Alice Wonderland', role: 'Head of Licensing' };

    return (
        <div className="p-4 md:p-6 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-theme-text-primary">Welcome back, {currentUser.name}!</h1>
                <p className="text-theme-text-secondary">Here is your supervisory summary for Tuesday, July 10, 2025.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* My Tasks Column */}
                <DashboardWidget title="My Priority Tasks" icon={<CheckCircleIcon />} className="lg:col-span-1 lg:row-span-2">
                    <div className="space-y-3">
                        {mockDashboardData.myTasks.map(task => <TaskItem key={task.id} task={task} />)}
                    </div>
                </DashboardWidget>

                {/* Top Row, Middle Column */}
                <DashboardWidget title="Institutional Risk Radar" icon={<ShieldCheckIcon />}>
                    <h3 className="text-md font-semibold text-theme-text-secondary mb-2">High-Risk Watchlist</h3>
                    <div className="p-4 bg-theme-error-bg border border-theme-error-border rounded-lg">
                        <ul className="space-y-2">
                            {mockDashboardData.highRiskWatchlist.map(entity => (
                                 <li key={entity.id} className="flex justify-between items-center">
                                     <span className="font-medium text-theme-error-text">{entity.name}</span>
                                     <span className="text-sm text-theme-error-text">Score: {entity.riskScore} ({entity.primaryDriver})</span>
                                 </li>
                            ))}
                        </ul>
                    </div>
                </DashboardWidget>

                {/* Top Row, Right Column */}
                <DashboardWidget title="Systemic Health Indicators" icon={<BuildingLibraryIcon />}>
                    <div className="grid grid-cols-2 gap-4 text-center">
                        {Object.entries(mockDashboardData.systemicRisk).map(([key, data]) => (
                            <div key={key} className={`p-2 rounded-lg ${data.status === 'Warning' ? 'bg-theme-warning-bg border border-theme-warning-border' : 'bg-theme-success-bg border border-theme-success-border'}`}>
                                <p className="text-xs font-medium text-theme-text-secondary capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                                <p className={`text-xl font-bold ${data.status === 'Warning' ? 'text-theme-warning-text' : 'text-theme-success-text'}`}>{data.value}</p>
                            </div>
                        ))}
                    </div>
                </DashboardWidget>

                 {/* Bottom Row, Middle Column */}
                <DashboardWidget title="Recent Platform Activity" icon={<BellIcon />}>
                     <ul className="space-y-3">
                         {mockDashboardData.recentActivity.map(activity => (
                             <li key={activity.id} className="flex items-start text-sm">
                                 <div className="flex-shrink-0 w-5 h-5 bg-theme-info-bg border border-theme-info-border text-theme-info-text rounded-full flex items-center justify-center mr-3 mt-1">
                                     <ExclamationCircleIcon className="w-4 h-4" />
                                 </div>
                                 <div>
                                     <p className="font-semibold text-theme-text-primary">{activity.type}</p>
                                     <p className="text-theme-text-secondary">{activity.description}</p>
                                     <p className="text-xs text-gray-500">{activity.time}</p>
                                 </div>
                             </li>
                         ))}
                    </ul>
                </DashboardWidget>

                {/* Bottom Row, Right Column */}
                 <DashboardWidget title="Quick Access" icon={<ScaleIcon />}>
                     <div className="grid grid-cols-2 gap-4 h-full">
                        <button className="p-2 bg-theme-bg rounded-lg text-center hover:bg-black hover:bg-opacity-20 flex flex-col items-center justify-center border border-theme-border">
                            <IdentificationIcon className="w-8 h-8 mx-auto text-theme-text-secondary mb-1" />
                            <span className="text-sm font-semibold text-theme-text-primary">New License Apps</span>
                        </button>
                        <button className="p-2 bg-theme-bg rounded-lg text-center hover:bg-black hover:bg-opacity-20 flex flex-col items-center justify-center border border-theme-border">
                            <ExclamationTriangleIcon className="w-8 h-8 mx-auto text-theme-text-secondary mb-1" />
                            <span className="text-sm font-semibold text-theme-text-primary">Overdue Reports</span>
                        </button>
                         <button className="p-2 bg-theme-bg rounded-lg text-center hover:bg-black hover:bg-opacity-20 flex flex-col items-center justify-center border border-theme-border">
                            <ClockIcon className="w-8 h-8 mx-auto text-theme-text-secondary mb-1" />
                            <span className="text-sm font-semibold text-theme-text-primary">Expiring Licenses</span>
                        </button>
                         <button className="p-2 bg-theme-bg rounded-lg text-center hover:bg-black hover:bg-opacity-20 flex flex-col items-center justify-center border border-theme-border">
                            <ExclamationCircleIcon className="w-8 h-8 mx-auto text-theme-text-secondary mb-1" />
                            <span className="text-sm font-semibold text-theme-text-primary">Active Enforcement</span>
                        </button>
                     </div>
                </DashboardWidget>
            </div>
        </div>
    );
};

export default DashboardPage;