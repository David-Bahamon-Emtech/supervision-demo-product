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
    // Reset the file input visually if possible (tricky without direct DOM manipulation or key change)
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

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Upload New Template</h3>
        </div>

        {/* Content - Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {fileError && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{fileError}</div>}

          <div>
            <label htmlFor="template-file-upload" className="block text-sm font-medium text-gray-700">Template File <span className="text-red-500">*</span></label>
            <input
              type="file"
              id="template-file-upload"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {selectedFile && <p className="text-xs text-gray-500 mt-1">Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)</p>}
          </div>

          <div>
            <label htmlFor="template-name-upload" className="block text-sm font-medium text-gray-700">Template Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="template-name-upload"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Quarterly Compliance Report"
            />
          </div>

          <div>
            <label htmlFor="template-type-upload" className="block text-sm font-medium text-gray-700">Template Type <span className="text-red-500">*</span></label>
            <select
              id="template-type-upload"
              value={templateType}
              onChange={(e) => setTemplateType(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Select Type --</option>
              {availableTemplateTypes.map(type => (<option key={type} value={type}>{type}</option>))}
            </select>
          </div>

          <div>
            <label htmlFor="template-description-upload" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="template-description-upload"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="A brief description of the template's purpose."
            ></textarea>
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
            onClick={handleUpload}
            type="button"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Upload Template
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateUploadModal;