// src/components/Manage/ApplicationFormViewerModal.js
import React from 'react';

const ApplicationFormViewerModal = ({ isOpen, onClose, formDefinition }) => {
  if (!isOpen || !formDefinition) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">{formDefinition.name}</h2>
          <p className="text-sm text-gray-600">{formDefinition.description}</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <h4 className="text-lg font-semibold text-gray-700 mb-4">Form Details</h4>
          <div className="mb-4">
            <p className="text-sm text-gray-500">Version: {formDefinition.version}</p>
            <p className="text-sm text-gray-500">Status: {formDefinition.status}</p>
            <p className="text-sm text-gray-500">Target License Category: {formDefinition.targetLicenseCategory}</p>
          </div>

          {formDefinition.sections.map(section => (
            <div key={section.id} className="mb-6 border-b border-gray-200 pb-4">
              <h5 className="text-md font-semibold text-gray-700">{section.title}</h5>
              {section.description && <p className="text-sm text-gray-600 italic">{section.description}</p>}
              <div className="mt-2 space-y-2">
                {section.fields.map(field => (
                  <div key={field.id} className="flex items-start">
                    <label className="block text-sm font-medium text-gray-700 mr-2">{field.label}:</label>
                    <span className="text-sm text-gray-900">{field.type}</span>
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationFormViewerModal;