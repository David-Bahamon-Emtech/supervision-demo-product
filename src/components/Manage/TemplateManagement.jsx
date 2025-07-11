// src/components/Manage/TemplateManagement.js - UPDATED VERSION
import React, { useState, useEffect, useCallback } from 'react';
import AITemplateCreatorModal from './AITemplateCreatorModal.jsx';
import TemplateViewModal from './TemplateViewModal.jsx';
import TemplateDownloadModal from './TemplateDownloadModal.jsx';
import TemplateUploadModal from './TemplateUploadModal.jsx';
import TemplateEditModal from './TemplateEditModal.jsx';
import templateDownloadService from './templateDownloadService.js';

// Helper component for status badges, styled for the dark theme
const StatusBadge = ({ status }) => {
  let bgColorClass = 'bg-gray-700';
  let textColorClass = 'text-gray-200';
  switch (status) {
    case 'Published': bgColorClass = 'bg-green-900 bg-opacity-50'; textColorClass = 'text-green-300'; break;
    case 'Draft': bgColorClass = 'bg-yellow-900 bg-opacity-50'; textColorClass = 'text-yellow-300'; break;
    case 'Archived': bgColorClass = 'bg-gray-800 bg-opacity-50'; textColorClass = 'text-gray-400'; break;
    default: break;
  }
  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${bgColorClass} ${textColorClass}`}>
      {status}
    </span>
  );
};


const TemplateManagement = () => {
  const initialHardcodedTemplates = [
    {
      id: "tpl_001",
      name: "AML/CFT Policy Review Checklist",
      type: "Compliance Checklist",
      version: "1.2",
      status: "Published",
      lastUpdated: "2025-04-10",
      // The contentLink points to a file that is actually plain text,
      // but named to imply it represents a DOCX. The download attribute will handle the desired name.
      contentLink: "/dummy_templates/aml_checklist_v1.2.docx.txt",
      originalFileName: "AML_CFT_Policy_Review_Checklist_v1.2.docx", // Suggested filename for download
      textContent: `AML/CFT Policy Review Checklist

□ Verify customer identification procedures are documented
□ Check transaction monitoring systems are operational
□ Review suspicious activity reporting procedures
□ Validate record-keeping requirements (5-year retention)
□ Assess staff training programs on AML/CFT
□ Examine risk assessment methodology
□ Verify PEP screening procedures
□ Check sanctions screening processes
□ Review correspondent banking due diligence
□ Validate senior management oversight structure`,
      generatedBy: "System",
      fileObject: null,
      description: "A checklist for reviewing Anti-Money Laundering and Counter-Financing of Terrorism policies."
    },
    {
      id: "tpl_002",
      name: "RFI - Missing Financials",
      type: "Communication Template",
      version: "1.0",
      status: "Published",
      lastUpdated: "2025-03-15",
      contentLink: "/dummy_templates/rfi_financials_v1.0.txt",
      originalFileName: "RFI_Missing_Financials_v1.0.txt", // Suggested filename for download
      textContent: "Dear [Applicant Name],\n\nWe are reviewing your application [Application ID]. \nPlease provide the outstanding financial statements for the period [Date Range] by [Due Date].\n\nThank you.",
      generatedBy: "System",
      fileObject: null,
      description: "Standard template for requesting missing financial information from applicants."
    }
  ];

  const [templates, setTemplates] = useState(initialHardcodedTemplates);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [isAICreatorModalOpen, setIsAICreatorModalOpen] = useState(false);
  const [currentAiMode, setCurrentAiMode] = useState("Gemini");
  
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [templateToDownload, setTemplateToDownload] = useState(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [templateToEdit, setTemplateToEdit] = useState(null);

  const fetchAITemplates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3001/api/ai-templates');
      if (!response.ok) {
        console.warn(`Failed to fetch AI templates: ${response.status}. AI templates will not be loaded.`);
        setTemplates(initialHardcodedTemplates);
        return;
      }
      const aiTemplatesFromServer = await response.json();
      
      const combinedTemplates = [...initialHardcodedTemplates];
      const hardcodedIds = new Set(initialHardcodedTemplates.map(t => t.id));
      
      aiTemplatesFromServer.forEach(aiTpl => {
        if (!hardcodedIds.has(aiTpl.id)) {
          combinedTemplates.push({
            ...aiTpl,
            fileObject: null,
            originalFileName: `${aiTpl.name.replace(/[^a-z0-9]/gi, '_')}.txt`, // Default for AI generated
            description: aiTpl.description || `AI-generated template for: ${aiTpl.type}`
          });
        }
      });
      
      setTemplates(combinedTemplates);

    } catch (err) {
      console.error("Error fetching AI templates:", err);
      setError("Could not load AI-generated templates. Displaying local templates only.");
      setTemplates(initialHardcodedTemplates);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAITemplates();
  }, [fetchAITemplates]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const dateParts = dateString.split('T')[0].split('-');
    if (dateParts.length === 3) {
        const date = new Date(Date.UTC(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2])));
        const options = { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' };
        return date.toLocaleDateString(undefined, options);
    }
    return dateString; // Return original string if format is unexpected
  };

  const handleOpenAICreatorModal = () => setIsAICreatorModalOpen(true);
  const handleCloseAICreatorModal = () => setIsAICreatorModalOpen(false);
  const handleSaveAITemplate = (newAITemplate) => {
    setTemplates(prevTemplates => {
        const existingIndex = prevTemplates.findIndex(t => t.id === newAITemplate.id);
        if (existingIndex > -1) {
            const updatedTemplates = [...prevTemplates];
            updatedTemplates[existingIndex] = {
                ...newAITemplate,
                fileObject: prevTemplates[existingIndex].fileObject,
                originalFileName: prevTemplates[existingIndex].originalFileName || `${newAITemplate.name.replace(/[^a-z0-9]/gi, '_')}.txt`,
                description: newAITemplate.description || prevTemplates[existingIndex].description
            };
            return updatedTemplates;
        }
        return [...prevTemplates, { 
            ...newAITemplate, 
            fileObject: null, 
            originalFileName: `${newAITemplate.name.replace(/[^a-z0-9]/gi, '_')}.txt`,
            description: newAITemplate.description || `AI-generated content for ${newAITemplate.type}` 
        }];
    });
  };

  const handleViewTemplate = (template) => {
    setSelectedTemplate(template);
    setIsViewModalOpen(true);
  };
  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedTemplate(null);
  };

  const handleDownloadTemplate = (template) => {
    if (template.fileObject && template.fileObject instanceof File) {
        const url = URL.createObjectURL(template.fileObject);
        const a = document.createElement('a');
        a.href = url;
        a.download = template.originalFileName || template.name || 'download';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } 
    else if (template.contentLink) {
      const a = document.createElement('a');
      a.href = template.contentLink;
      a.download = template.originalFileName || template.name.replace(/[^a-z0-9_.-]/gi, '_') || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } 
    else if (template.textContent) {
      setTemplateToDownload(template);
      setIsDownloadModalOpen(true);
    } 
    else {
        alert("No downloadable content available for this template.");
    }
  };
  const handleCloseDownloadModal = () => {
    setIsDownloadModalOpen(false);
    setTemplateToDownload(null);
  };

  const handleOpenUploadModal = () => setIsUploadModalOpen(true);
  const handleCloseUploadModal = () => setIsUploadModalOpen(false);
  const handleUploadComplete = (uploadedTemplateData) => {
    const newTemplate = {
      id: `tpl_upload_${Date.now()}`,
      name: uploadedTemplateData.name,
      type: uploadedTemplateData.type,
      description: uploadedTemplateData.description || "Manually uploaded template.",
      version: "1.0",
      status: "Draft",
      lastUpdated: new Date().toISOString().split('T')[0],
      textContent: uploadedTemplateData.textContent,
      fileObject: uploadedTemplateData.file,
      originalFileName: uploadedTemplateData.fileName,
      generatedBy: "Manual Upload",
      contentLink: null,
      promptUsed: "N/A",
    };
    setTemplates(prevTemplates => [...prevTemplates, newTemplate]);
  };

  const handleOpenEditModal = (template) => {
    setTemplateToEdit(template);
    setIsEditModalOpen(true);
  };
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setTemplateToEdit(null);
  };
  const handleEditComplete = (updatedTemplateData) => {
    setTemplates(prevTemplates =>
      prevTemplates.map(t =>
        t.id === updatedTemplateData.id ? updatedTemplateData : t
      )
    );
  };

  return (
    <div className="p-4 md:p-6 bg-theme-bg min-h-screen">
      <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-theme-text-primary">Template Management</h1>
            <p className="text-theme-text-secondary mt-1">
              Manage checklists, regulatory documents, and communication templates.
            </p>
          </div>
      </div>
      
      <div className="mb-6 flex space-x-3">
        <button
          onClick={handleOpenAICreatorModal}
          className="px-4 py-2 bg-theme-accent text-sidebar-bg font-semibold rounded-md shadow-sm hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-bg focus:ring-theme-accent"
        >
          Create with AI
        </button>
        <button
          onClick={handleOpenUploadModal}
          className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-bg focus:ring-gray-500"
        >
          Upload Template
        </button>
      </div>

      {isLoading && <div className="text-center p-4 text-theme-text-secondary">Loading templates...</div>}
      {error && <div className="text-center p-4 text-red-300 bg-red-900 bg-opacity-30 border border-red-500 rounded-md shadow">{error}</div>}

      {!isLoading && !error && (
        <div className="bg-theme-bg-secondary p-0 sm:p-6 rounded-xl shadow-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-theme-border">
              <thead className="bg-black bg-opacity-20">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Template Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Version</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Last Updated</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-theme-bg-secondary divide-y divide-theme-border">
                {templates.map((template) => (
                  <tr key={template.id} className="hover:bg-theme-bg">
                    <td className="px-6 py-4 whitespace-normal text-sm font-medium text-theme-text-primary max-w-xs">{template.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary">{template.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary">{template.version}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <StatusBadge status={template.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary">{formatDate(template.lastUpdated)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-4">
                        <button 
                          onClick={() => handleViewTemplate(template)}
                          className="text-blue-400 hover:text-theme-accent"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => handleOpenEditModal(template)}
                          className="text-blue-400 hover:text-theme-accent"
                        >
                          Edit
                        </button>
                        {(template.fileObject || template.contentLink || template.textContent) ? (
                          <button 
                            onClick={() => handleDownloadTemplate(template)}
                            className="text-blue-400 hover:text-theme-accent"
                          >
                            Download
                          </button>
                        ) : (
                          <span className="text-gray-600 text-xs italic">No Download</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {templates.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-sm text-theme-text-secondary">
                      No templates found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AITemplateCreatorModal
        isOpen={isAICreatorModalOpen}
        onClose={handleCloseAICreatorModal}
        onSaveTemplate={handleSaveAITemplate}
        currentAIMode={currentAiMode}
      />

      <TemplateViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        template={selectedTemplate}
      />

      <TemplateDownloadModal
        isOpen={isDownloadModalOpen}
        onClose={handleCloseDownloadModal}
        template={templateToDownload}
      />

      <TemplateUploadModal
        isOpen={isUploadModalOpen}
        onClose={handleCloseUploadModal}
        onUploadComplete={handleUploadComplete}
      />

      <TemplateEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onEditComplete={handleEditComplete}
        templateToEdit={templateToEdit}
      />
    </div>
  );
};

export default TemplateManagement;