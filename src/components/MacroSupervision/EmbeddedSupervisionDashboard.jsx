// src/components/MacroSupervision/EmbeddedSupervisionDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  getOnChainAlerts,
  assessDeFiSystemicRisk,
  generateEmbeddedReports,
  validateSmartContractRules
} from '../../services/embeddedSupervisionService.js';
import { protocolMonitoring } from '../../data/defiSupervisionData.js';

const Pill = ({ text, colorClass = 'bg-gray-100 text-gray-800' }) => (
  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${colorClass}`}>
    {text}
  </span>
);

const AlertItem = ({ alert }) => {
  let severityColor = 'border-yellow-400 bg-yellow-50';
  if (alert.severity === 'High') severityColor = 'border-red-400 bg-red-50';
  
  return (
    <div className={`p-3 border-l-4 ${severityColor}`}>
      <div className="flex justify-between items-start">
        <p className="font-semibold text-sm text-gray-800">{alert.title}</p>
        <span className="text-xs text-gray-500">{new Date(alert.timestamp).toLocaleTimeString()}</span>
      </div>
      <p className="text-xs text-gray-600 mt-1">{alert.description}</p>
      <p className="text-xs text-blue-600 mt-1 truncate">
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
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="font-semibold text-gray-700 mb-2">Live On-Chain Alerts</h4>
          <div className="h-96 overflow-y-auto space-y-3 pr-2">
            {isLoading.alerts ? <p>Loading alerts...</p> : alerts.map(alert => (
              <AlertItem key={alert.alertId} alert={alert} />
            ))}
          </div>
        </div>
      </div>

      {/* Center Column - Risk & Reports */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="font-semibold text-gray-700 mb-2">DeFi Systemic Risk</h4>
          {isLoading.risk ? <p>Loading risk data...</p> : systemicRisk && (
            <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Overall Risk Level:</span> <Pill text={systemicRisk.overallRiskLevel} colorClass={systemicRisk.overallRiskLevel === 'Elevated' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'} /></div>
                <div className="flex justify-between"><span className="text-gray-600">Total Value Locked:</span> <span className="font-medium">${(systemicRisk.totalTVL / 1e9).toFixed(2)}B</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Protocols Monitored:</span> <span className="font-medium">{systemicRisk.monitoredProtocols}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Protocols on Watchlist:</span> <span className="font-medium">{systemicRisk.protocolsOnWatchlist}</span></div>
                <p className="text-xs text-gray-500 pt-2 border-t mt-2">{systemicRisk.keyRiskFactor}</p>
            </div>
          )}
        </div>
         <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="font-semibold text-gray-700 mb-2">Automated Node Reports</h4>
           <div className="h-56 overflow-y-auto space-y-2 pr-2">
              {isLoading.reports ? <p>Loading reports...</p> : reports.map(report => (
                <div key={report.nodeId} className="p-2 bg-gray-50 rounded-md text-xs">
                    <p className="font-bold text-gray-700">{report.protocolName}</p>
                    <p className="text-gray-600">{report.complianceSummary}</p>
                    <div className="text-right"><Pill text={report.status} colorClass={report.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} /></div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Right Column - Contract Validation */}
      <div className="lg:col-span-1 space-y-6">
         <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="font-semibold text-gray-700 mb-2">Smart Contract Rule Validation</h4>
            <div>
              <label htmlFor="contract-address" className="text-xs font-medium text-gray-600">Contract Address</label>
              <input 
                type="text"
                id="contract-address"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md my-2 text-xs"
                placeholder="0x..."
              />
              <button onClick={handleValidateContract} disabled={isLoading.validation} className="w-full p-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50">
                {isLoading.validation ? 'Validating...' : 'Validate Contract'}
              </button>
            </div>
            {validationResult && (
                <div className="mt-3 text-xs space-y-1">
                    <p><strong>Protocol:</strong> {validationResult.protocolName}</p>
                    <p><strong>Validation Result:</strong> {validationResult.validationPassed ? <Pill text="Passed" colorClass="bg-green-100 text-green-800"/> : <Pill text="Failed" colorClass="bg-red-100 text-red-800"/>}</p>
                    {validationResult.issues.length > 0 && (
                        <div>
                            <p className="font-semibold">Issues Found:</p>
                            <ul className="list-disc list-inside pl-2 text-red-700">
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