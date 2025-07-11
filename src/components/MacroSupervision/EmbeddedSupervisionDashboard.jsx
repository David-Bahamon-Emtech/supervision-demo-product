// src/components/MacroSupervision/EmbeddedSupervisionDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  getOnChainAlerts,
  assessDeFiSystemicRisk,
  generateEmbeddedReports,
  validateSmartContractRules
} from '../../services/embeddedSupervisionService.js';
import { protocolMonitoring } from '../../data/defiSupervisionData.js';

const Pill = ({ text, colorClass = 'bg-gray-700 text-gray-200' }) => (
  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${colorClass}`}>
    {text}
  </span>
);

const AlertItem = ({ alert }) => {
  let severityColor = 'border-yellow-500 bg-yellow-900 bg-opacity-30 text-yellow-300';
  if (alert.severity === 'High') severityColor = 'border-red-500 bg-red-900 bg-opacity-30 text-red-300';
  
  return (
    <div className={`p-3 border-l-4 ${severityColor}`}>
      <div className="flex justify-between items-start">
        <p className="font-semibold text-sm text-theme-text-primary">{alert.title}</p>
        <span className="text-xs text-theme-text-secondary">{new Date(alert.timestamp).toLocaleTimeString()}</span>
      </div>
      <p className="text-xs text-theme-text-secondary mt-1">{alert.description}</p>
      <p className="text-xs text-blue-400 mt-1 truncate">
        Protocol: {protocolMonitoring[alert.protocolId]?.name || alert.protocolId}
      </p>
    </div>
  );
};

const EmbeddedSupervisionDashboard = () => {
  const [alerts, setAlerts] = useState([]);
  const [systemicRisk, setSystemicRisk] = useState(null);
  const [reports, setReports] = useState([]);
  const [contractAddress, setContractAddress] = useState('0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9');
  const [validationResult, setValidationResult] = useState(null);
  const [isLoading, setIsLoading] = useState({ alerts: true, risk: true, reports: true, validation: false });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [alertData, riskData, reportData] = await Promise.all([
          getOnChainAlerts(),
          assessDeFiSystemicRisk(),
          generateEmbeddedReports()
        ]);
        setAlerts(alertData);
        setSystemicRisk(riskData);
        setReports(reportData);
      } catch (error) {
        console.error("Failed to load embedded supervision data:", error);
      } finally {
        setIsLoading({ alerts: false, risk: false, reports: false, validation: false });
      }
    };
    fetchAllData();
  }, []);

  const handleValidateContract = async () => {
    if (!contractAddress) return;
    setIsLoading(prev => ({ ...prev, validation: true }));
    setValidationResult(null);
    try {
      const result = await validateSmartContractRules(contractAddress);
      setValidationResult(result);
    } catch (error) {
      console.error("Failed to validate smart contract:", error);
      setValidationResult({ validationPassed: false, issues: ["Failed to run validation service."] });
    } finally {
      setIsLoading(prev => ({ ...prev, validation: false }));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Alerts */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-theme-bg-secondary p-4 rounded-lg shadow-lg">
          <h4 className="font-semibold text-theme-text-primary mb-2">Live On-Chain Alerts</h4>
          <div className="h-96 overflow-y-auto space-y-3 pr-2">
            {isLoading.alerts ? <p className="text-theme-text-secondary">Loading alerts...</p> : alerts.map(alert => (
              <AlertItem key={alert.alertId} alert={alert} />
            ))}
          </div>
        </div>
      </div>

      {/* Center Column - Risk & Reports */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-theme-bg-secondary p-4 rounded-lg shadow-lg">
          <h4 className="font-semibold text-theme-text-primary mb-2">DeFi Systemic Risk</h4>
          {isLoading.risk ? <p className="text-theme-text-secondary">Loading risk data...</p> : systemicRisk && (
            <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-theme-text-secondary">Overall Risk Level:</span> <Pill text={systemicRisk.overallRiskLevel} colorClass={systemicRisk.overallRiskLevel === 'Elevated' ? 'bg-red-900 bg-opacity-30 text-red-300' : 'bg-yellow-900 bg-opacity-30 text-yellow-300'} /></div>
                <div className="flex justify-between"><span className="text-theme-text-secondary">Total Value Locked:</span> <span className="font-medium text-theme-text-primary">${(systemicRisk.totalTVL / 1e9).toFixed(2)}B</span></div>
                <div className="flex justify-between"><span className="text-theme-text-secondary">Protocols Monitored:</span> <span className="font-medium text-theme-text-primary">{systemicRisk.monitoredProtocols}</span></div>
                <div className="flex justify-between"><span className="text-theme-text-secondary">Protocols on Watchlist:</span> <span className="font-medium text-theme-text-primary">{systemicRisk.protocolsOnWatchlist}</span></div>
                <p className="text-xs text-gray-400 pt-2 border-t border-theme-border mt-2">{systemicRisk.keyRiskFactor}</p>
            </div>
          )}
        </div>
         <div className="bg-theme-bg-secondary p-4 rounded-lg shadow-lg">
          <h4 className="font-semibold text-theme-text-primary mb-2">Automated Node Reports</h4>
           <div className="h-56 overflow-y-auto space-y-2 pr-2">
              {isLoading.reports ? <p className="text-theme-text-secondary">Loading reports...</p> : reports.map(report => (
                <div key={report.nodeId} className="p-2 bg-theme-bg rounded-md text-xs">
                    <p className="font-bold text-theme-text-secondary">{report.protocolName}</p>
                    <p className="text-theme-text-primary">{report.complianceSummary}</p>
                    <div className="text-right"><Pill text={report.status} colorClass={report.status === 'Active' ? 'bg-green-900 bg-opacity-30 text-green-300' : 'bg-yellow-900 bg-opacity-30 text-yellow-300'} /></div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Right Column - Contract Validation */}
      <div className="lg:col-span-1 space-y-6">
         <div className="bg-theme-bg-secondary p-4 rounded-lg shadow-lg">
            <h4 className="font-semibold text-theme-text-primary mb-2">Smart Contract Rule Validation</h4>
            <div>
              <label htmlFor="contract-address" className="text-xs font-medium text-theme-text-secondary">Contract Address</label>
              <input 
                type="text"
                id="contract-address"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                className="w-full p-2 bg-theme-bg border border-theme-border rounded-md my-2 text-xs text-theme-text-primary"
                placeholder="0x..."
              />
              <button onClick={handleValidateContract} disabled={isLoading.validation} className="w-full p-2 bg-theme-accent text-sidebar-bg font-semibold rounded-md shadow-sm hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-bg focus:ring-theme-accent disabled:opacity-50">
                {isLoading.validation ? 'Validating...' : 'Validate Contract'}
              </button>
            </div>
            {validationResult && (
                <div className="mt-3 text-xs space-y-1">
                    <p className="text-theme-text-secondary"><strong>Protocol:</strong> <span className="text-theme-text-primary">{validationResult.protocolName}</span></p>
                    <p className="text-theme-text-secondary"><strong>Validation Result:</strong> {validationResult.validationPassed ? <Pill text="Passed" colorClass="bg-green-900 bg-opacity-30 text-green-300"/> : <Pill text="Failed" colorClass="bg-red-900 bg-opacity-30 text-red-300"/>}</p>
                    {validationResult.issues.length > 0 && (
                        <div>
                            <p className="font-semibold text-theme-text-secondary">Issues Found:</p>
                            <ul className="list-disc list-inside pl-2 text-red-400">
                                {validationResult.issues.map((issue, i) => <li key={i}>{issue}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default EmbeddedSupervisionDashboard;