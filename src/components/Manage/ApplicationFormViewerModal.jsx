// src/components/Manage/ApplicationFormViewerModal.js
import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

// --- Internal Helper Component to render the form fields visually ---
const RenderField = ({ field }) => {
  const inputStyles = "mt-1 block w-full p-2 bg-theme-bg border-theme-border rounded-md shadow-sm sm:text-sm text-theme-text-primary focus:ring-theme-accent focus:border-theme-accent disabled:opacity-50 disabled:cursor-not-allowed";

  const renderInput = () => {
    switch (field.type) {
      case 'textarea':
        return <textarea defaultValue={field.defaultValue} placeholder={field.placeholder} rows="3" className={inputStyles} disabled />;
      case 'select':
        return (
          <select defaultValue={field.defaultValue} className={inputStyles} disabled>
            {field.placeholder && <option value="">{field.placeholder}</option>}
            {Array.isArray(field.options) && field.options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
          </select>
        );
      case 'checkbox':
        return (
            <div className="pt-2">
                 <input type="checkbox" defaultChecked={!!field.defaultValue} className="h-4 w-4 rounded bg-theme-bg border-gray-500 text-theme-accent focus:ring-theme-accent disabled:opacity-50" disabled />
            </div>
        );
      case 'radio':
         return (
            <div className="pt-2 space-y-2">
                {Array.isArray(field.options) && field.options.map((opt, i) => (
                     <div key={i} className="flex items-center">
                        <input type="radio" name={field.id} value={opt} defaultChecked={field.defaultValue === opt} className="h-4 w-4 bg-theme-bg border-gray-500 text-theme-accent focus:ring-theme-accent disabled:opacity-50" disabled />
                        <label className="ml-2 block text-sm text-theme-text-secondary">{opt}</label>
                     </div>
                ))}
            </div>
         );
      case 'date':
        return <input type="date" defaultValue={field.defaultValue} className={inputStyles} disabled />;
      case 'number':
        return <input type="number" defaultValue={field.defaultValue} placeholder={field.placeholder} className={inputStyles} disabled />;
      case 'file':
        return <button type="button" className={`${inputStyles} text-left text-theme-text-secondary`} disabled>Choose File</button>;
      default: // 'text'
        return <input type="text" defaultValue={field.defaultValue} placeholder={field.placeholder} className={inputStyles} disabled />;
    }
  };

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-theme-text-secondary">
        {field.label}
        {field.required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {renderInput()}
      {field.helpText && <p className="mt-1 text-xs text-gray-500">{field.helpText}</p>}
    </div>
  );
};


const ApplicationFormViewerModal = ({ isOpen, onClose, formDefinition }) => {
  if (!isOpen || !formDefinition) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
      <div className="bg-theme-bg-secondary rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-theme-border">
        {/* Header */}
        <div className="px-6 py-4 border-b border-theme-border flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-theme-text-primary">{formDefinition.name}</h2>
            <p className="text-sm text-theme-text-secondary">{formDefinition.description}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-theme-text-secondary hover:bg-black hover:bg-opacity-20">
            <XMarkIcon className="w-6 h-6"/>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="mb-6 pb-4 border-b border-theme-border">
            <h4 className="text-lg font-semibold text-theme-text-primary mb-2">Form Details</h4>
            <div className="grid grid-cols-2 gap-x-4 text-sm">
                <p><strong className="text-theme-text-secondary">Version:</strong> {formDefinition.version}</p>
                <p><strong className="text-theme-text-secondary">Status:</strong> {formDefinition.status}</p>
                <p className="col-span-2 mt-1"><strong className="text-theme-text-secondary">Target License:</strong> {formDefinition.targetLicenseCategory}</p>
            </div>
          </div>

          {formDefinition.sections.map(section => (
            <div key={section.id} className="mb-8">
              <div className="pb-2 border-b border-theme-border">
                 <h5 className="text-md font-semibold text-theme-text-primary">{section.title}</h5>
                 {section.description && <p className="text-sm text-theme-text-secondary italic mt-1">{section.description}</p>}
              </div>
              <div className="mt-4 space-y-4">
                {section.fields.map(field => (
                  <RenderField key={field.id} field={field} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-black bg-opacity-20 border-t border-theme-border text-right">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-200 bg-gray-700 border border-transparent rounded-md hover:bg-gray-600">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationFormViewerModal;