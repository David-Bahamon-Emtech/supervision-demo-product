// src/components/Manage/MetricEditorModal.js
import React, { useState, useEffect } from 'react';

const MetricEditorModal = ({ isOpen, onClose, onSave, metricToEdit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dataType, setDataType] = useState('');
  const [calculationSource, setCalculationSource] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [interpretationNote, setInterpretationNote] = useState('');
  const [error, setError] = useState('');

  const dataTypes = [
    'count',
    'percentage',
    'currency',
    'days',
    'rating_scale_5',
    'boolean_summary',
  ];

  useEffect(() => {
    if (isOpen && metricToEdit) {
      setName(metricToEdit.name || '');
      setDescription(metricToEdit.description || '');
      setDataType(metricToEdit.dataType || '');
      setCalculationSource(metricToEdit.calculationSource || '');
      setTargetValue(metricToEdit.targetValue || '');
      setInterpretationNote(metricToEdit.interpretationNote || '');
      setError('');
    } else if (isOpen) {
      // Reset form for create
      setName('');
      setDescription('');
      setDataType('');
      setCalculationSource('');
      setTargetValue('');
      setInterpretationNote('');
      setError('');
    }
  }, [isOpen, metricToEdit]);

  const handleSave = () => {
    if (!name.trim() || !dataType) {
      setError('Metric Name and Data Type are required.');
      return;
    }

    const metricData = {
      id: metricToEdit ? metricToEdit.id : `met_${Date.now()}`, // Simple ID generation
      name,
      description,
      dataType,
      calculationSource,
      targetValue: targetValue !== '' ? parseFloat(targetValue) : null, // Handle empty targetValue
      interpretationNote,
    };

    onSave(metricData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            {metricToEdit ? 'Edit Metric' : 'Define New Metric'}
          </h3>
        </div>

        {/* Modal Body - Form */}
        <div className="p-6">
          {error && <div className="p-3 bg-red-100 text-red-700 rounded-md mb-4">{error}</div>}

          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Metric Name <span className="text-red-500">*</span></label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows="3"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
          </div>

          <div className="mb-4">
            <label htmlFor="dataType" className="block text-sm font-medium text-gray-700">Data Type <span className="text-red-500">*</span></label>
            <select id="dataType" value={dataType} onChange={(e) => setDataType(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
              <option value="">-- Select Data Type --</option>
              {dataTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="calculationSource" className="block text-sm font-medium text-gray-700">Calculation Source</label>
            <input type="text" id="calculationSource" value={calculationSource} onChange={(e) => setCalculationSource(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
          </div>

          <div className="mb-4">
            <label htmlFor="targetValue" className="block text-sm font-medium text-gray-700">Target Value</label>
            <input type="number" id="targetValue" value={targetValue} onChange={(e) => setTargetValue(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
          </div>

          <div className="mb-4">
            <label htmlFor="interpretationNote" className="block text-sm font-medium text-gray-700">Interpretation Note</label>
            <textarea id="interpretationNote" value={interpretationNote} onChange={(e) => setInterpretationNote(e.target.value)} rows="3"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
          </div>
        </div>

        {/* Modal Footer - Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-right">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 mr-2">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default MetricEditorModal;