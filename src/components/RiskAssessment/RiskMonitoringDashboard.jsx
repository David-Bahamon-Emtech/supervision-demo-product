// src/components/RiskAssessment/RiskMonitoringDashboard.jsx

import React, { useState, useEffect } from 'react';
import {
  generateRiskAlerts,
  getEarlyWarningIndicators,
} from '../../services/riskMonitoringService.js';
import entitiesData from '../../data/entities.js';

// --- Reusable Components ---

const AlertCard = ({ alert, entityName }) => {
    let severityClasses = 'bg-theme-bg border-gray-600 text-theme-text-secondary';
    if (alert.severity === 'High') {
        severityClasses = 'bg-red-900 bg-opacity-20 border-red-500 text-red-300';
    } else if (alert.severity === 'Medium') {
        severityClasses = 'bg-orange-900 bg-opacity-20 border-orange-500 text-orange-300';
    } else if (alert.severity === 'Warning') {
        severityClasses = 'bg-yellow-900 bg-opacity-20 border-yellow-500 text-yellow-300';
    }

    return (
        <div className={`p-4 border-l-4 rounded-r-lg shadow-md ${severityClasses}`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-sm text-theme-text-primary">{alert.alertType} - {entityName}</p>
                    <p className="text-sm mt-1">{alert.message}</p>
                </div>
                <span className="text-xs font-mono text-theme-text-secondary">{new Date(alert.timestamp).toLocaleTimeString()}</span>
            </div>
            <div className="text-right mt-2">
                 <button className="text-xs px-2 py-1 border border-current rounded-md hover:bg-black hover:bg-opacity-20">
                    Acknowledge
                 </button>
            </div>
        </div>
    );
};

const EWICard = ({ ewi, entityName }) => {
    if (!ewi) return null;

    let trendColor = 'text-theme-text-secondary';
    if (ewi.trend === 'deteriorating') trendColor = 'text-red-400';
    if (ewi.trend === 'improving') trendColor = 'text-green-400';

    return (
        <div className="bg-theme-bg-secondary p-4 rounded-lg shadow-lg border border-theme-border">
            <h4 className="font-bold text-theme-text-primary">{entityName}</h4>
            <div className="mt-2 space-y-2 text-sm">
                 <div className="flex justify-between items-baseline">
                    <span className="text-theme-text-secondary">Risk Trend:</span>
                    <span className={`font-semibold capitalize ${trendColor}`}>{ewi.trend}</span>
                </div>
                <div className="flex justify-between items-baseline">
                    <span className="text-theme-text-secondary">Risk Score:</span>
                    <span className="font-bold text-xl text-theme-text-primary">{ewi.riskScore.toFixed(1)}</span>
                </div>
                 <div className="flex justify-between items-baseline">
                    <span className="text-theme-text-secondary">Failure Probability (12m):</span>
                    <span className="text-theme-text-primary">{(ewi.probability * 100).toFixed(0)}%</span>
                </div>
                <div>
                    <p className="text-theme-text-secondary text-xs mt-2">Key Indicators:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {ewi.indicators.map(ind => (
                            <span key={ind} className="px-2 py-0.5 text-xs bg-theme-bg text-theme-text-primary rounded-full">{ind}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};


const RiskMonitoringDashboard = () => {
    const [alerts, setAlerts] = useState([]);
    const [ewis, setEwis] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const riskAlerts = await generateRiskAlerts();

                // Enrich alerts with entity names
                const enrichedAlerts = riskAlerts.map(alert => {
                    const entity = entitiesData.find(e => e.entityId === alert.entityId);
                    return { ...alert, entityName: entity ? entity.companyName : 'Unknown Entity' };
                });
                setAlerts(enrichedAlerts);

                // Fetch EWI for all entities that have them
                const ewiEntityIds = entitiesData.map(e => e.entityId);
                const ewiPromises = ewiEntityIds.map(async (id) => {
                    const ewi = await getEarlyWarningIndicators(id);
                    if (ewi) {
                        const entity = entitiesData.find(e => e.entityId === id);
                        return { ...ewi, entityId: id, entityName: entity ? entity.companyName : 'Unknown' };
                    }
                    return null;
                });
                const allEwis = (await Promise.all(ewiPromises)).filter(e => e !== null);
                setEwis(allEwis);

            } catch (err) {
                console.error("Failed to load risk monitoring data:", err);
                setError("Could not load real-time monitoring data.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    if (isLoading && alerts.length === 0) {
        return <div className="p-6 text-center text-theme-text-secondary">Loading Real-Time Monitoring Data...</div>;
    }

    if (error) {
        return <div className="p-6 text-center text-red-400 bg-red-900 bg-opacity-30 rounded-md">{error}</div>;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Live Alerts Column */}
            <div>
                <h2 className="text-2xl font-semibold text-theme-text-primary">Live Risk Alerts</h2>
                <p className="text-sm text-theme-text-secondary mt-1 mb-4">Real-time notifications when predefined risk thresholds are breached.</p>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {alerts.length > 0 ? (
                        alerts.map(alert => <AlertCard key={alert.alertId} alert={alert} entityName={alert.entityName} />)
                    ) : (
                        <div className="text-center py-10 text-theme-text-secondary bg-theme-bg-secondary rounded-lg shadow-lg border border-theme-border">
                            <p>No active alerts.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Early Warning Indicators Column */}
            <div>
                <h2 className="text-2xl font-semibold text-theme-text-primary">Early Warning Indicators (EWI)</h2>
                <p className="text-sm text-theme-text-secondary mt-1 mb-4">Predictive analytics identifying entities with deteriorating risk profiles.</p>
                <div className="space-y-4">
                    {ewis.length > 0 ? (
                        ewis.map(ewi => <EWICard key={ewi.entityId} ewi={ewi} entityName={ewi.entityName} />)
                    ) : (
                         <div className="text-center py-10 text-theme-text-secondary bg-theme-bg-secondary rounded-lg shadow-lg border border-theme-border">
                            <p>No early warning indicators to display.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RiskMonitoringDashboard;