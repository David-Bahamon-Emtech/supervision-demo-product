// src/components/Manage/MetricEditorModal.js
import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const MetricEditorModal = ({ isOpen, onClose, onSave, metricToEdit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dataType, setDataType] = useState('');
  const [calculationSource, setCalculationSource] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [interpretationNote, setInterpretationNote] = useState('');
  const [error, setError] = useState('');

  const dataTypes = [
    'count', 'percentage', 'currency', 'days',
    'rating_scale_5', 'boolean_summary',
  ];

  const inputStyles = "mt-1 block w-full p-2 bg-theme-bg border-theme-border rounded-md shadow-sm sm:text-sm text-theme-text-primary focus:ring-theme-accent focus:border-theme-accent";
  const labelStyles = "block text-sm font-medium text-theme-text-secondary";

  useEffect(() => {
    if (isOpen) {
        if (metricToEdit) {
            setName(metricToEdit.name || '');
            setDescription(metricToEdit.description || '');
            setDataType(metricToEdit.dataType || '');
            setCalculationSource(metricToEdit.calculationSource || '');
            setTargetValue(metricToEdit.targetValue || '');
            setInterpretationNote(metricToEdit.interpretationNote || '');
        } else {
            // Reset form for create
            setName('');
            setDescription('');
            setDataType('');
            setCalculationSource('');
            setTargetValue('');
            setInterpretationNote('');
        }
        setError('');
    }
  }, [isOpen, metricToEdit]);

  const handleSave = () => {
    if (!name.trim() || !dataType) {
      setError('Metric Name and Data Type are required.');
      return;
    }

    const metricData = {
      id: metricToEdit ? metricToEdit.id : `met_${Date.now()}`,
      name,
      description,
      dataType,
      calculationSource,
      targetValue: targetValue !== '' ? parseFloat(targetValue) : null,
      interpretationNote,
    };

    onSave(metricData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
      <div className="bg-theme-bg-secondary rounded-lg shadow-xl w-full max-w-md border border-theme-border">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-theme-border flex justify-between items-center">
          <h3 className="text-lg font-semibold text-theme-text-primary">
            {metricToEdit ? 'Edit Metric' : 'Define New Metric'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-full text-theme-text-secondary hover:bg-black hover:bg-opacity-20">
            <XMarkIcon className="w-5 h-5"/>
          </button>
        </div>

        {/* Modal Body - Form */}
        <div className="p-6 overflow-y-auto" style={{maxHeight: '70vh'}}>
          {error && <div className="p-3 bg-red-900 bg-opacity-30 text-red-300 rounded-md mb-4 border border-red-500">{error}</div>}

          <div className="space-y-4">
            <div>
                <label htmlFor="name" className={labelStyles}>Metric Name <span className="text-red-500">*</span></label>
                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className={inputStyles} />
            </div>

            <div>
                <label htmlFor="description" className={labelStyles}>Description</label>
                <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows="3" className={inputStyles} />
            </div>

            <div>
                <label htmlFor="dataType" className={labelStyles}>Data Type <span className="text-red-500">*</span></label>
                <select id="dataType" value={dataType} onChange={(e) => setDataType(e.target.value)} className={inputStyles}>
                    <option value="">-- Select Data Type --</option>
                    {dataTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
            </div>

            <div>
                <label htmlFor="calculationSource" className={labelStyles}>Calculation Source</label>
                <input type="text" id="calculationSource" value={calculationSource} onChange={(e) => setCalculationSource(e.target.value)} placeholder="e.g., Core Banking System API" className={inputStyles} />
            </div>

            <div>
                <label htmlFor="targetValue" className={labelStyles}>Target Value (Optional)</label>
                <input type="number" id="targetValue" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} placeholder="e.g., 95 for a 95% target" className={inputStyles} />
            </div>

            <div>
                <label htmlFor="interpretationNote" className={labelStyles}>Interpretation Note</label>
                <textarea id="interpretationNote" value={interpretationNote} onChange={(e) => setInterpretationNote(e.target.value)} rows="3" placeholder="e.g., Higher is better." className={inputStyles} />
            </div>
          </div>
        </div>

        {/* Modal Footer - Actions */}
        <div className="px-6 py-4 bg-black bg-opacity-20 border-t border-theme-border text-right space-x-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-200 bg-gray-700 border border-transparent rounded-md hover:bg-gray-600">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-sidebar-bg bg-theme-accent rounded-md hover:brightness-110">
            Save Metric
          </button>
        </div>
      </div>
    </div>
  );
};

export default MetricEditorModal;