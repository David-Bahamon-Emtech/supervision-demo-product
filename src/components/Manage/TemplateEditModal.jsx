// src/components/Manage/TemplateEditModal.js
import React, { useState, useEffect } from 'react';

const TemplateEditModal = ({ isOpen, onClose, onEditComplete, templateToEdit }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [version, setVersion] = useState(''); // <-- ADDED version and setVersion
  const [status, setStatus] = useState('');
  const [textContent, setTextContent] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const availableTemplateTypes = [
    "Compliance Checklist",
    "Communication Template",
    "Procedural Document",
    "Policy Document",
    "Risk Assessment Form",
    "Report Template",
    "Legal Document",
    "Other",
  ];

  const availableStatuses = ["Draft", "Published", "Archived"];

  useEffect(() => {
    if (isOpen && templateToEdit) {
      setName(templateToEdit.name || '');
      setType(templateToEdit.type || '');
      setVersion(templateToEdit.version || ''); // <-- ADDED setVersion
      setStatus(templateToEdit.status || 'Draft');
      setTextContent(templateToEdit.textContent || '');
      setDescription(templateToEdit.description || '');
      setError('');
    } else if (!isOpen) {
      // Reset form when modal is closed
      setName('');
      setType('');
      setVersion(''); // <-- ADDED setVersion
      setStatus('');
      setTextContent('');
      setDescription('');
      setError('');
    }
  }, [isOpen, templateToEdit]);

  const handleSaveChanges = () => {
    if (!name.trim()) {
      setError('Template Name is required.');
      return;
    }
    if (!type) {
      setError('Template Type is required.');
      return;
    }
    if (!status) {
      setError('Status is required.');
      return;
    }
    setError('');

    const updatedTemplateData = {
      ...templateToEdit,
      name,
      type,
      version,
      status,
      textContent: (templateToEdit.fileObject && !templateToEdit.textContent) ? templateToEdit.textContent : textContent,
      description,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    onEditComplete(updatedTemplateData);
    onClose();
  };

  if (!isOpen || !templateToEdit) return null;

  const isBinaryFileWithoutEditableText = templateToEdit.fileObject && !templateToEdit.textContent;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Edit Template: {templateToEdit.name}</h3>
        </div>

        {/* Content - Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}

          <div>
            <label htmlFor="template-name-edit" className="block text-sm font-medium text-gray-700">Template Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="template-name-edit"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="template-type-edit" className="block text-sm font-medium text-gray-700">Template Type <span className="text-red-500">*</span></label>
              <select
                id="template-type-edit"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Select Type --</option>
                {availableTemplateTypes.map(t => (<option key={t} value={t}>{t}</option>))}
              </select>
            </div>
            <div>
              <label htmlFor="template-status-edit" className="block text-sm font-medium text-gray-700">Status <span className="text-red-500">*</span></label>
              <select
                id="template-status-edit"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                {availableStatuses.map(s => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="template-version-edit" className="block text-sm font-medium text-gray-700">Version</label>
            <input
              type="text"
              id="template-version-edit"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 1.1, 2.0 Draft"
            />
          </div>

          <div>
            <label htmlFor="template-description-edit" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="template-description-edit"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="template-content-edit" className="block text-sm font-medium text-gray-700">Template Content</label>
            {isBinaryFileWithoutEditableText ? (
              <div className="mt-1 p-3 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-600">
                Content of this file type ({templateToEdit.originalFileName}) cannot be edited directly here. You can edit metadata or re-upload a new version.
              </div>
            ) : (
              <textarea
                id="template-content-edit"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                rows="10"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 font-mono text-xs"
                placeholder="Enter or paste template content here..."
              ></textarea>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 bg-gray-50">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveChanges}
            type="button"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateEditModal;