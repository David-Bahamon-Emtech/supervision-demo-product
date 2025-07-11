// src/components/Manage/TemplateDownloadModal.js
import React, { useState } from 'react';
import templateDownloadService from './templateDownloadService.js';
import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const TemplateDownloadModal = ({ isOpen, onClose, template, templates = null }) => {
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);
  const [downloadSuccess, setDownloadSuccess] = useState(null);
  
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

    try {
      if (isBatchMode) {
        const { results, errors } = await templateDownloadService.downloadBatch(itemsToDownload, selectedFormat, { includeMetadata, includeHeader, includeFooter });
        if (errors.length > 0) setDownloadError(`Failed to download ${errors.length} template(s)`);
        if (results.length > 0) setDownloadSuccess(`Successfully downloaded ${results.length} template(s)`);
      } else {
        const result = await templateDownloadService.downloadTemplate(template, selectedFormat, { includeMetadata, includeHeader, includeFooter });
        setDownloadSuccess(`Downloaded: ${result.filename}`);
      }
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      setDownloadError(error.message || 'Failed to download template');
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen || (!template && !isBatchMode)) return null;

  const selectedFormatInfo = formatOptions.find(f => f.value === selectedFormat);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
      <div className="bg-theme-bg-secondary rounded-lg shadow-xl w-full max-w-md border border-theme-border">
        {/* Header */}
        <div className="px-6 py-4 border-b border-theme-border flex justify-between items-center">
            <h3 className="text-lg font-semibold text-theme-text-primary">
              {isBatchMode ? `Download ${itemsToDownload.length} Templates` : 'Download Template'}
            </h3>
            <button onClick={onClose} disabled={isDownloading} className="p-1 rounded-full text-theme-text-secondary hover:bg-black hover:bg-opacity-20">
              <XMarkIcon className="w-5 h-5"/>
            </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {!isBatchMode && template && (
            <div className="mb-4 p-3 bg-theme-bg rounded-md border border-theme-border">
              <p className="text-sm font-medium text-theme-text-primary">{template.name}</p>
              <p className="text-xs text-theme-text-secondary mt-1">{template.type} • Version {template.version}</p>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">Select Format</label>
            <div className="grid grid-cols-2 gap-3">
              {formatOptions.map((format) => (
                <button key={format.value} onClick={() => setSelectedFormat(format.value)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    selectedFormat === format.value ? 'border-theme-accent bg-black bg-opacity-20' : 'border-theme-border hover:border-theme-accent'
                  }`}
                  disabled={isDownloading}
                >
                  <div className="text-2xl mb-1">{format.icon}</div>
                  <div className="text-sm font-medium text-theme-text-primary">{format.label}</div>
                  {format.requiresBackend && <div className="text-xs text-amber-500 mt-1">Premium Format</div>}
                </button>
              ))}
            </div>
          </div>

          {selectedFormatInfo?.requiresBackend && (
            <div className="mb-6 space-y-3">
              <h4 className="text-sm font-medium text-theme-text-secondary">Export Options</h4>
              <label className="flex items-center">
                <input type="checkbox" checked={includeMetadata} onChange={(e) => setIncludeMetadata(e.target.checked)} disabled={isDownloading}
                  className="h-4 w-4 text-theme-accent bg-theme-bg border-gray-500 rounded focus:ring-theme-accent"/>
                <span className="ml-2 text-sm text-theme-text-secondary">Include template metadata</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" checked={includeHeader} onChange={(e) => setIncludeHeader(e.target.checked)} disabled={isDownloading}
                  className="h-4 w-4 text-theme-accent bg-theme-bg border-gray-500 rounded focus:ring-theme-accent"/>
                <span className="ml-2 text-sm text-theme-text-secondary">Include regulatory header</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" checked={includeFooter} onChange={(e) => setIncludeFooter(e.target.checked)} disabled={isDownloading}
                  className="h-4 w-4 text-theme-accent bg-theme-bg border-gray-500 rounded focus:ring-theme-accent"/>
                <span className="ml-2 text-sm text-theme-text-secondary">Include footer with timestamp</span>
              </label>
            </div>
          )}

          {downloadError && <div className="mb-4 p-3 bg-red-900 bg-opacity-30 text-red-300 rounded-md text-sm border border-red-500">{downloadError}</div>}
          {downloadSuccess && <div className="mb-4 p-3 bg-green-900 bg-opacity-30 text-green-300 rounded-md text-sm border border-green-500">{downloadSuccess}</div>}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-black bg-opacity-20 border-t border-theme-border flex justify-end space-x-3">
          <button onClick={onClose} disabled={isDownloading}
            className="px-4 py-2 text-sm font-medium text-gray-200 bg-gray-700 border border-transparent rounded-md hover:bg-gray-600 disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleDownload} disabled={isDownloading}
            className="px-4 py-2 text-sm font-medium text-sidebar-bg bg-theme-accent rounded-md hover:brightness-110 disabled:opacity-50 flex items-center">
            {isDownloading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Downloading...
              </>
            ) : (
              <>
                <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
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