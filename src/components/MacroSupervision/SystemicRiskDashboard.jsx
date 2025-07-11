// src/components/MacroSupervision/SystemicRiskDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import * as macroSupervisionService from '../../services/macroSupervisionService.js';
import { getChartColors, getChartOptions } from '../../utils/chartColors.js';

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
      trendColor = indicator.status === 'warning' || indicator.status === 'critical' ? 'text-theme-error-text' : 'text-theme-success-text';
      break;
    case 'down':
      trendIcon = '▼';
      trendColor = indicator.status === 'warning' || indicator.status === 'critical' ? 'text-theme-success-text' : 'text-theme-error-text';
      break;
    default:
      trendIcon = '●';
      trendColor = 'text-theme-text-secondary';
      break;
  }

  let statusColor;
  switch (indicator.status) {
    case 'critical':
      statusColor = 'bg-theme-error-bg border-theme-error-border';
      break;
    case 'warning':
      statusColor = 'bg-theme-warning-bg border-theme-warning-border';
      break;
    default:
      statusColor = 'bg-theme-success-bg border-theme-success-border';
  }

  return (
    <div className={`p-3 rounded-lg border-l-4 ${statusColor}`}>
      <div className="flex justify-between items-start">
        <p className="text-sm font-medium text-theme-text-secondary">{indicator.name}</p>
        <span className={`text-sm font-bold ${trendColor}`}>{trendIcon} {indicator.trend}</span>
      </div>
      <p className="text-2xl font-bold text-theme-text-primary mt-1">{indicator.value}</p>
    </div>
  );
};

const SystemicRiskDashboard = () => {
  const [riskData, setRiskData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [concentrationData, setConcentrationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Chart options that are compatible with both light and dark themes
  const chartOptions = (titleText) => {
    const colors = getChartColors();
    return {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: colors.textColor
          }
        },
        title: {
          display: true,
          text: titleText,
          color: colors.titleColor,
          font: {
            size: 16
          }
        }
      },
      scales: {
        y: {
          ticks: { color: colors.textColor },
          grid: { color: colors.gridColor }
        },
        x: {
          ticks: { color: colors.textColor },
          grid: { color: colors.gridColor }
        }
      }
    };
  };
  
  const doughnutChartOptions = (titleText) => {
    const colors = getChartColors();
    return {
      maintainAspectRatio: false,
      plugins: {
          legend: {
              position: 'right',
              labels: {
                  color: colors.textColor
              }
          },
          title: {
              display: true,
              text: titleText,
              color: colors.titleColor,
              font: {
                size: 16
              }
          }
      }
    };
  };


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
        const colors = getChartColors();
        setConcentrationData({
          labels: sectorData.map(d => d.sector),
          datasets: [{
            label: 'Credit Concentration',
            data: sectorData.map(d => d.percentage),
            backgroundColor: colors.colors,
            borderColor: colors.gridColor,
            borderWidth: 2,
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
    return <div className="p-6 text-center text-theme-text-secondary">Loading Systemic Risk Dashboard...</div>;
  }

  const barChartData = {
      labels: riskData['Asset Quality']?.map(d => d.name),
      datasets: [{
          label: 'Value (%)',
          data: riskData['Asset Quality']?.map(d => parseFloat(d.value)),
          backgroundColor: getChartColors().colors[0],
          borderColor: getChartColors().colors[0].replace('0.8', '1'),
          borderWidth: 1,
      }]
  };
  
  const lineChartData = {
    labels: ['Q4 2024', 'Q1 2025', 'Q2 2025', 'Q3 2025 (proj.)'],
    datasets: [{
      label: 'System-wide CAR Trend',
      data: [15.1, 15.0, 14.8, 14.6],
      fill: false,
      borderColor: getChartColors().colors[1].replace('0.8', '1'),
      tension: 0.1
    }, {
      label: 'System-wide NPL Trend',
      data: [3.5, 3.6, 3.9, 4.1],
      fill: false,
      borderColor: getChartColors().colors[0].replace('0.8', '1'),
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
        <div className="lg:col-span-3 bg-theme-bg-secondary p-4 rounded-lg shadow-lg">
          <div className="h-72">
            <Line data={lineChartData} options={chartOptions('CAR vs NPL Ratio Trend')} />
          </div>
        </div>
        <div className="lg:col-span-2 bg-theme-bg-secondary p-4 rounded-lg shadow-lg">
            <div className="h-72 flex items-center justify-center">
                {concentrationData && <Doughnut data={concentrationData} options={doughnutChartOptions('Credit Concentration by Sector')} />}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-theme-bg-secondary p-4 rounded-lg shadow-lg">
            <div className="h-72">
                <Bar data={barChartData} options={{ ...chartOptions('Asset Quality Indicators'), indexAxis: 'y' }} />
            </div>
        </div>
        <div className="bg-theme-bg-secondary p-4 rounded-lg shadow-lg">
            <h4 className="font-semibold text-theme-text-primary mb-2">Top Systemic Alerts</h4>
            <div className="space-y-3">
                {alerts.map(alert => (
                     <div key={alert.id} className={`p-3 border-l-4 ${alert.severity === 'High' ? 'border-theme-error-border bg-theme-error-bg' : 'border-theme-warning-border bg-theme-warning-bg'}`}>
                        <p className={`font-bold text-sm ${alert.severity === 'High' ? 'text-theme-error-text' : 'text-theme-warning-text'}`}>{alert.title}</p>
                        <p className="text-xs text-theme-text-secondary">{alert.description}</p>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default SystemicRiskDashboard;