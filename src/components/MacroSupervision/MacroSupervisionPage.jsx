// src/components/MacroSupervision/MacroSupervisionPage.jsx
import React, { useState } from 'react';

// Import all new components
import SystemicRiskDashboard from './SystemicRiskDashboard.jsx';
import AIStressTestingPanel from './AIStressTestingPanel.jsx';
import EmbeddedSupervisionDashboard from './EmbeddedSupervisionDashboard.jsx';
import AIMacroAnalytics from './AIMacroAnalytics.jsx';

const MacroSupervisionPage = () => {
    const [activeTab, setActiveTab] = useState('systemic_risk');

    const renderContent = () => {
        switch (activeTab) {
            case 'systemic_risk':
                return <SystemicRiskDashboard />;
            case 'stress_testing':
                return <AIStressTestingPanel />;
            case 'embedded_supervision':
                return <EmbeddedSupervisionDashboard />;
            case 'ai_analytics':
                return <AIMacroAnalytics />;
            default:
                return <SystemicRiskDashboard />;
        }
    };

    const tabs = [
        { id: 'systemic_risk', label: 'Systemic Risk Dashboard' },
        { id: 'stress_testing', label: 'AI Stress Testing' },
        { id: 'embedded_supervision', label: 'Embedded Supervision (DeFi)' },
        { id: 'ai_analytics', label: 'AI Macro Analytics' },
    ];

    return (
        <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Macro-Prudential Supervision</h1>

            <div className="mb-6 border-b border-gray-300">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`${
                                activeTab === tab.id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-b-lg shadow-inner-lg">
                {renderContent()}
            </div>
        </div>
    );
};

export default MacroSupervisionPage;