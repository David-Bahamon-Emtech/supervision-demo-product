// src/components/Manage/TemplateEditModal.js
import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const TemplateEditModal = ({ isOpen, onClose, onEditComplete, templateToEdit }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [version, setVersion] = useState('');
  const [status, setStatus] = useState('');
  const [textContent, setTextContent] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const availableTemplateTypes = [
    "Compliance Checklist", "Communication Template", "Procedural Document", "Policy Document",
    "Risk Assessment Form", "Report Template", "Legal Document", "Other",
  ];
  const availableStatuses = ["Draft", "Published", "Archived"];

  const inputStyles = "mt-1 block w-full p-2 bg-theme-bg border-theme-border rounded-md shadow-sm sm:text-sm text-theme-text-primary focus:ring-theme-accent focus:border-theme-accent";
  const labelStyles = "block text-sm font-medium text-theme-text-secondary";

  useEffect(() => {
    if (isOpen && templateToEdit) {
      setName(templateToEdit.name || '');
      setType(templateToEdit.type || '');
      setVersion(templateToEdit.version || '');
      setStatus(templateToEdit.status || 'Draft');
      setTextContent(templateToEdit.textContent || '');
      setDescription(templateToEdit.description || '');
      setError('');
    }
  }, [isOpen, templateToEdit]);

  const handleSaveChanges = () => {
    if (!name.trim() || !type || !status) {
      setError('Template Name, Type, and Status are required.');
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
    <div className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
      <div className="bg-theme-bg-secondary rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col border border-theme-border">
        {/* Header */}
        <div className="px-6 py-4 border-b border-theme-border flex justify-between items-center">
          <h3 className="text-lg font-semibold text-theme-text-primary">Edit Template: {templateToEdit.name}</h3>
          <button onClick={onClose} className="p-1 rounded-full text-theme-text-secondary hover:bg-black hover:bg-opacity-20"><XMarkIcon className="w-5 h-5"/></button>
        </div>

        {/* Content - Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && <div className="p-3 bg-red-900 bg-opacity-30 text-red-300 rounded-md text-sm border border-red-500">{error}</div>}

          <div>
            <label htmlFor="template-name-edit" className={labelStyles}>Template Name <span className="text-red-500">*</span></label>
            <input type="text" id="template-name-edit" value={name} onChange={(e) => setName(e.target.value)} className={inputStyles} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="template-type-edit" className={labelStyles}>Template Type <span className="text-red-500">*</span></label>
              <select id="template-type-edit" value={type} onChange={(e) => setType(e.target.value)} className={inputStyles}>
                <option value="">-- Select Type --</option>
                {availableTemplateTypes.map(t => (<option key={t} value={t}>{t}</option>))}
              </select>
            </div>
            <div>
              <label htmlFor="template-status-edit" className={labelStyles}>Status <span className="text-red-500">*</span></label>
              <select id="template-status-edit" value={status} onChange={(e) => setStatus(e.target.value)} className={inputStyles}>
                {availableStatuses.map(s => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="template-version-edit" className={labelStyles}>Version</label>
            <input type="text" id="template-version-edit" value={version} onChange={(e) => setVersion(e.target.value)} className={inputStyles} placeholder="e.g., 1.1, 2.0 Draft" />
          </div>

          <div>
            <label htmlFor="template-description-edit" className={labelStyles}>Description</label>
            <textarea id="template-description-edit" value={description} onChange={(e) => setDescription(e.target.value)} rows="3" className={inputStyles}></textarea>
          </div>
          
          <div>
            <label htmlFor="template-content-edit" className={labelStyles}>Template Content</label>
            {isBinaryFileWithoutEditableText ? (
              <div className="mt-1 p-3 bg-theme-bg border border-theme-border rounded-md text-sm text-theme-text-secondary">
                Content of this file type ({templateToEdit.originalFileName}) cannot be edited directly here. You can edit metadata or re-upload a new version.
              </div>
            ) : (
              <textarea id="template-content-edit" value={textContent} onChange={(e) => setTextContent(e.target.value)} rows="10"
                className={`${inputStyles} font-mono text-xs`}
                placeholder="Enter or paste template content here..."
              ></textarea>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-theme-border flex justify-end space-x-3 bg-black bg-opacity-20">
          <button onClick={onClose} type="button" className="px-4 py-2 text-sm font-medium text-gray-200 bg-gray-700 border border-transparent rounded-md hover:bg-gray-600">
            Cancel
          </button>
          <button onClick={handleSaveChanges} type="button" className="px-4 py-2 text-sm font-medium text-sidebar-bg bg-theme-accent rounded-md hover:brightness-110">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateEditModal;