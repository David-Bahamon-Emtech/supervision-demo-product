// src/components/Manage/MetricsManagement.js
import React, { useState, useEffect } from 'react';
import reportingMetricsData from '../../data/reportingMetrics.js';
import MetricEditorModal from './MetricEditorModal.jsx';

// --- SVG Icon Components ---
const IconView = ({ className = "w-5 h-5" }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639l4.433-7.467a1.012 1.012 0 011.616 0l4.433 7.467a1.012 1.012 0 010 .639l-4.433 7.467a1.012 1.012 0 01-1.616 0l-4.433-7.467z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> );
const IconEdit = ({ className = "w-5 h-5" }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg> );
const IconDelete = ({ className = "w-5 h-5" }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09 1.02-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg> );

// --- ActionButton Component ---
const ActionButton = ({ icon, label, onClick, disabled }) => (
  <div className="relative flex items-center group">
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={label}
      className={`p-1.5 rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-bg-secondary focus:ring-theme-accent
        ${disabled ? 'text-gray-600 cursor-not-allowed' : 'text-theme-text-secondary hover:text-theme-accent hover:bg-black hover:bg-opacity-20'
      }`}
    >
      {icon}
    </button>
    <div
      className="absolute bottom-full left-1/2 z-20 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded-md shadow-sm 
                 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap
                 transform -translate-x-1/2"
    >
      {label}
    </div>
  </div>
);


const MetricsManagement = () => {
  const [metrics, setMetrics] = useState([]);
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [metricToEdit, setMetricToEdit] = useState(null);

  useEffect(() => {
    setMetrics(reportingMetricsData);
  }, []);

  const handleOpenCreateModal = () => {
    setMetricToEdit(null);
    setIsEditorModalOpen(true);
  };

  const handleOpenEditModal = (metric) => {
    setMetricToEdit(metric);
    setIsEditorModalOpen(true);
  };

  const handleCloseEditorModal = () => {
    setIsEditorModalOpen(false);
    setMetricToEdit(null);
  };

  const handleSaveMetric = (metricData) => {
    setMetrics(prevMetrics => {
        const existingIndex = prevMetrics.findIndex(m => m.id === metricData.id);
        if (existingIndex > -1) {
            const updated = [...prevMetrics];
            updated[existingIndex] = metricData;
            return updated;
        }
        return [...prevMetrics, metricData];
    });
    handleCloseEditorModal();
  };

  const handleDeleteMetric = (metricId) => {
    if (window.confirm("Are you sure you want to delete this metric?")) {
      setMetrics(prevMetrics => prevMetrics.filter(metric => metric.id !== metricId));
    }
  };


  return (
    <div className="p-4">
        <div>
            <h2 className="text-2xl font-semibold text-theme-text-primary mb-2">Metrics Management</h2>
            <p className="text-theme-text-secondary mb-6">Define and manage Key Performance Indicators (KPIs) for regulatory operations.</p>
        </div>

      <div className="mb-6">
        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2 bg-theme-accent text-sidebar-bg font-semibold rounded-md shadow-sm hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-bg focus:ring-theme-accent"
        >
          Define New Metric
        </button>
      </div>

      <div className="bg-theme-bg-secondary shadow-lg rounded-xl overflow-hidden border border-theme-border">
        <table className="min-w-full divide-y divide-theme-border">
          <thead className="bg-black bg-opacity-20">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Metric Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Description</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Source Module</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Data Type</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Target</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-theme-border">
            {metrics.map((metric) => (
              <tr key={metric.id} className="hover:bg-theme-bg">
                <td className="px-6 py-4 whitespace-normal text-sm font-medium text-theme-text-primary max-w-xs">{metric.name}</td>
                <td className="px-6 py-4 whitespace-normal text-sm text-theme-text-secondary max-w-md">{metric.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary">{metric.calculationSource}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary">{metric.dataType}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary">{metric.targetValue}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center justify-center space-x-2">
                    <ActionButton icon={<IconView />} label="View Metric JSON" onClick={() => alert(JSON.stringify(metric, null, 2))} />
                    <ActionButton icon={<IconEdit />} label="Edit Metric" onClick={() => handleOpenEditModal(metric)} />
                    <ActionButton icon={<IconDelete />} label="Delete Metric" onClick={() => handleDeleteMetric(metric.id)} />
                  </div>
                </td>
              </tr>
            ))}
            {metrics.length === 0 && (
              <tr><td colSpan="6" className="px-6 py-10 text-center text-sm text-theme-text-secondary italic">No metrics defined yet. Click "Define New Metric" to get started.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <MetricEditorModal
        isOpen={isEditorModalOpen}
        onClose={handleCloseEditorModal}
        onSave={handleSaveMetric}
        metricToEdit={metricToEdit}
      />
    </div>
  );
};

export default MetricsManagement;