// src/components/Manage/TemplateUploadModal.js
import React, { useState, useEffect } from 'react';

const TemplateUploadModal = ({ isOpen, onClose, onUploadComplete }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [templateName, setTemplateName] = useState('');
  const [templateType, setTemplateType] = useState('');
  const [description, setDescription] = useState('');
  const [fileError, setFileError] = useState('');

  // Mirrored from AITemplateCreatorModal.js
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

  const resetForm = () => {
    setSelectedFile(null);
    setTemplateName('');
    setTemplateType('');
    setDescription('');
    setFileError('');
    // Reset the file input visually
    const fileInput = document.getElementById('template-file-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Pre-fill template name from filename, removing extension
      setTemplateName(file.name.substring(0, file.name.lastIndexOf('.')) || file.name);
      setFileError('');
    } else {
      setSelectedFile(null);
      setTemplateName('');
    }
  };

  const isTextBasedFile = (file) => {
    if (!file) return false;
    const textExtensions = ['.txt', '.md', '.html', '.htm', '.json', '.xml', '.csv', '.js', '.css'];
    const fileName = file.name.toLowerCase();
    return textExtensions.some(ext => fileName.endsWith(ext));
  };

  const handleUpload = () => {
    if (!selectedFile) {
      setFileError('Please select a file to upload.');
      return;
    }
    if (!templateName.trim()) {
      setFileError('Please enter a template name.');
      return;
    }
    if (!templateType) {
      setFileError('Please select a template type.');
      return;
    }
    setFileError('');

    const reader = new FileReader();

    reader.onload = (e) => {
      const textContent = isTextBasedFile(selectedFile) ? e.target.result : null;
      onUploadComplete({
        name: templateName,
        type: templateType,
        description: description,
        file: selectedFile, // The actual File object
        textContent: textContent,
        fileName: selectedFile.name,
      });
      onClose(); // Close modal on successful preparation
    };

    reader.onerror = () => {
      setFileError('Error reading file.');
    };

    if (isTextBasedFile(selectedFile)) {
      reader.readAsText(selectedFile);
    } else {
      // For non-text files, we don't read content but still proceed
      // The onUploadComplete callback will receive textContent as null
      onUploadComplete({
        name: templateName,
        type: templateType,
        description: description,
        file: selectedFile,
        textContent: null,
        fileName: selectedFile.name,
      });
      onClose();
    }
  };

  if (!isOpen) return null;
  
  const inputStyles = "mt-1 block w-full p-2 bg-theme-bg border-theme-border rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 text-theme-text-primary placeholder:text-gray-500";
  const labelStyles = "block text-sm font-medium text-theme-text-secondary";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
      <div className="bg-theme-bg-secondary rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col border border-theme-border">
        {/* Header */}
        <div className="px-6 py-4 border-b border-theme-border">
          <h3 className="text-lg font-semibold text-theme-text-primary">Upload New Template</h3>
        </div>

        {/* Content - Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {fileError && <div className="p-3 bg-red-900 bg-opacity-30 text-red-300 border border-red-500 rounded-md text-sm">{fileError}</div>}

          <div>
            <label htmlFor="template-file-upload" className={labelStyles}>Template File <span className="text-red-500">*</span></label>
            <input
              type="file"
              id="template-file-upload"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-theme-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
            />
            {selectedFile && <p className="text-xs text-theme-text-secondary mt-1">Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)</p>}
          </div>

          <div>
            <label htmlFor="template-name-upload" className={labelStyles}>Template Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="template-name-upload"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className={inputStyles}
              placeholder="e.g., Quarterly Compliance Report"
            />
          </div>

          <div>
            <label htmlFor="template-type-upload" className={labelStyles}>Template Type <span className="text-red-500">*</span></label>
            <select
              id="template-type-upload"
              value={templateType}
              onChange={(e) => setTemplateType(e.target.value)}
              className={inputStyles}
            >
              <option value="">-- Select Type --</option>
              {availableTemplateTypes.map(type => (<option key={type} value={type}>{type}</option>))}
            </select>
          </div>

          <div>
            <label htmlFor="template-description-upload" className={labelStyles}>Description</label>
            <textarea
              id="template-description-upload"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className={inputStyles}
              placeholder="A brief description of the template's purpose."
            ></textarea>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-theme-border flex justify-end space-x-3 bg-black bg-opacity-20">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 text-sm font-medium text-theme-text-primary bg-gray-700 border border-transparent rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-bg-secondary focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            type="button"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-bg-secondary focus:ring-blue-500"
          >
            Upload Template
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateUploadModal;