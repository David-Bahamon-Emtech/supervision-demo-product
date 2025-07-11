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
        <div className="p-4 md:p-6 bg-theme-bg min-h-screen">
            <h1 className="text-3xl font-bold text-theme-text-primary mb-6">Macro-Prudential Supervision</h1>

            <div className="mb-6 border-b border-theme-border">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`${
                                activeTab === tab.id
                                ? 'border-theme-accent text-theme-accent'
                                : 'border-transparent text-theme-text-secondary hover:text-theme-text-primary hover:border-gray-500'
                            } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            
            {renderContent()}
        </div>
    );
};

export default MacroSupervisionPage;