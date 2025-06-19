// src/components/Manage/TemplateDownloadModal.js
import React, { useState } from 'react';
import templateDownloadService from './templateDownloadService.js';

const TemplateDownloadModal = ({ isOpen, onClose, template, templates = null }) => {
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);
  const [downloadSuccess, setDownloadSuccess] = useState(null);
  
  // Options state
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includeHeader, setIncludeHeader] = useState(true);
  const [includeFooter, setIncludeFooter] = useState(true);

  const isBatchMode = templates && templates.length > 0;
  const itemsToDownload = isBatchMode ? templates : (template ? [template] : []);

  const formatOptions = [
    { value: 'pdf', label: 'PDF Document', icon: '📄', requiresBackend: true },
    { value: 'docx', label: 'Word Document (DOCX)', icon: '📝', requiresBackend: true },
    { value: 'html', label: 'HTML File', icon: '🌐', requiresBackend: false },
    { value: 'txt', label: 'Plain Text', icon: '📃', requiresBackend: false },
  ];

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadError(null);
    setDownloadSuccess(null);

    const options = {
      includeMetadata,
      includeHeader,
      includeFooter,
    };

    try {
      if (isBatchMode) {
        const { results, errors } = await templateDownloadService.downloadBatch(
          itemsToDownload,
          selectedFormat,
          options
        );
        
        if (errors.length > 0) {
          setDownloadError(`Failed to download ${errors.length} template(s)`);
        }
        if (results.length > 0) {
          setDownloadSuccess(`Successfully downloaded ${results.length} template(s)`);
        }
      } else {
        const result = await templateDownloadService.downloadTemplate(
          template,
          selectedFormat,
          options
        );
        setDownloadSuccess(`Downloaded: ${result.filename}`);
      }

      // Auto-close after successful download (with delay for user feedback)
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Download error:', error);
      setDownloadError(error.message || 'Failed to download template');
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen || (!template && !isBatchMode)) return null;

  const selectedFormatInfo = formatOptions.find(f => f.value === selectedFormat);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">
              {isBatchMode ? `Download ${itemsToDownload.length} Templates` : 'Download Template'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isDownloading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {/* Template info */}
          {!isBatchMode && template && (
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm font-medium text-gray-700">{template.name}</p>
              <p className="text-xs text-gray-500 mt-1">{template.type} • Version {template.version}</p>
            </div>
          )}

          {/* Format selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              {formatOptions.map((format) => (
                <button
                  key={format.value}
                  onClick={() => setSelectedFormat(format.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedFormat === format.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={isDownloading}
                >
                  <div className="text-2xl mb-1">{format.icon}</div>
                  <div className="text-sm font-medium">{format.label}</div>
                  {format.requiresBackend && (
                    <div className="text-xs text-gray-500 mt-1">Premium</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          {selectedFormatInfo?.requiresBackend && (
            <div className="mb-6 space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Export Options</h4>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeMetadata}
                  onChange={(e) => setIncludeMetadata(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isDownloading}
                />
                <span className="ml-2 text-sm text-gray-700">Include template metadata</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeHeader}
                  onChange={(e) => setIncludeHeader(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isDownloading}
                />
                <span className="ml-2 text-sm text-gray-700">Include regulatory header</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeFooter}
                  onChange={(e) => setIncludeFooter(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isDownloading}
                />
                <span className="ml-2 text-sm text-gray-700">Include footer with timestamp</span>
              </label>
            </div>
          )}

          {/* Status messages */}
          {downloadError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {downloadError}
            </div>
          )}
          {downloadSuccess && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">
              {downloadSuccess}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400"
            disabled={isDownloading}
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 disabled:opacity-50 flex items-center"
          >
            {isDownloading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Downloading...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateDownloadModal;