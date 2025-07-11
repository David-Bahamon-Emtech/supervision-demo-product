// src/components/MacroSupervision/SystemicRiskDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import * as macroSupervisionService from '../../services/macroSupervisionService.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const IndicatorCard = ({ indicator }) => {
  let trendIcon, trendColor;
  switch (indicator.trend) {
    case 'up':
      trendIcon = '▲';
      trendColor = indicator.status === 'warning' || indicator.status === 'critical' ? 'text-red-500' : 'text-green-500';
      break;
    case 'down':
      trendIcon = '▼';
      trendColor = indicator.status === 'warning' || indicator.status === 'critical' ? 'text-green-500' : 'text-red-500';
      break;
    default:
      trendIcon = '●';
      trendColor = 'text-gray-500';
      break;
  }

  let statusColor;
  switch (indicator.status) {
    case 'critical':
      statusColor = 'bg-red-100 border-red-500';
      break;
    case 'warning':
      statusColor = 'bg-yellow-100 border-yellow-500';
      break;
    default:
      statusColor = 'bg-green-100 border-green-500';
  }

  return (
    <div className={`p-3 rounded-lg border-l-4 ${statusColor}`}>
      <div className="flex justify-between items-start">
        <p className="text-sm font-medium text-gray-700">{indicator.name}</p>
        <span className={`text-sm font-bold ${trendColor}`}>{trendIcon} {indicator.trend}</span>
      </div>
      <p className="text-2xl font-bold text-gray-800 mt-1">{indicator.value}</p>
    </div>
  );
};

const SystemicRiskDashboard = () => {
  const [riskData, setRiskData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [concentrationData, setConcentrationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [dashboardData, alertData, sectorData] = await Promise.all([
          macroSupervisionService.getSystemicRiskDashboard(),
          macroSupervisionService.getEarlyWarningSignals(),
          macroSupervisionService.assessSectorConcentration()
        ]);
        
        setRiskData(dashboardData);
        setAlerts(alertData.slice(0, 5)); // Take top 5 alerts
        
        // Prepare data for the concentration chart
        setConcentrationData({
          labels: sectorData.map(d => d.sector),
          datasets: [{
            label: 'Credit Concentration',
            data: sectorData.map(d => d.percentage),
            backgroundColor: [
              'rgba(255, 99, 132, 0.7)',
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 206, 86, 0.7)',
              'rgba(75, 192, 192, 0.7)',
              'rgba(153, 102, 255, 0.7)',
              'rgba(255, 159, 64, 0.7)',
              'rgba(99, 255, 132, 0.7)',
            ],
            borderColor: '#fff',
            borderWidth: 1,
          }],
        });

      } catch (error) {
        console.error("Failed to fetch systemic risk data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <div className="p-6 text-center text-gray-500">Loading Systemic Risk Dashboard...</div>;
  }

  const barChartData = {
      labels: riskData['Asset Quality']?.map(d => d.name),
      datasets: [{
          label: 'Value (%)',
          data: riskData['Asset Quality']?.map(d => parseFloat(d.value)),
          backgroundColor: 'rgba(239, 68, 68, 0.6)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 1,
      }]
  };
  
  const lineChartData = {
    labels: ['Q4 2024', 'Q1 2025', 'Q2 2025', 'Q3 2025 (proj.)'],
    datasets: [{
      label: 'System-wide CAR Trend',
      data: [15.1, 15.0, 14.8, 14.6],
      fill: false,
      borderColor: 'rgb(54, 162, 235)',
      tension: 0.1
    }, {
      label: 'System-wide NPL Trend',
      data: [3.5, 3.6, 3.9, 4.1],
      fill: false,
      borderColor: 'rgb(255, 99, 132)',
      tension: 0.1
    }]
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {riskData?.['Capital Adequacy']?.slice(0, 4).map(indicator => (
          <IndicatorCard key={indicator.name} indicator={indicator} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white p-4 rounded-lg shadow">
          <h4 className="font-semibold text-gray-700 mb-2">Key Risk Trends</h4>
          <div className="h-72">
            <Line data={lineChartData} options={{ maintainAspectRatio: false, plugins: { title: { display: true, text: 'CAR vs NPL Ratio Trend' } } }} />
          </div>
        </div>
        <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow">
           <h4 className="font-semibold text-gray-700 mb-2">Credit Concentration by Sector</h4>
            <div className="h-72 flex items-center justify-center">
                {concentrationData && <Doughnut data={concentrationData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }} />}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="font-semibold text-gray-700 mb-2">Asset Quality Metrics</h4>
            <div className="h-72">
                <Bar data={barChartData} options={{ maintainAspectRatio: false, indexAxis: 'y', plugins: { title: { display: true, text: 'Asset Quality Indicators' } } }} />
            </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="font-semibold text-gray-700 mb-2">Top Systemic Alerts</h4>
            <div className="space-y-3">
                {alerts.map(alert => (
                     <div key={alert.id} className={`p-3 border-l-4 ${alert.severity === 'High' ? 'border-red-500 bg-red-50' : 'border-yellow-500 bg-yellow-50'}`}>
                        <p className={`font-bold text-sm ${alert.severity === 'High' ? 'text-red-800' : 'text-yellow-800'}`}>{alert.title}</p>
                        <p className="text-xs text-gray-700">{alert.description}</p>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default SystemicRiskDashboard;