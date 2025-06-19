// src/components/Manage/TemplateManagement.js - UPDATED VERSION
import React, { useState, useEffect, useCallback } from 'react';
import AITemplateCreatorModal from './AITemplateCreatorModal.jsx';
import TemplateViewModal from './TemplateViewModal.jsx';
import TemplateDownloadModal from './TemplateDownloadModal.jsx';
import TemplateUploadModal from './TemplateUploadModal.jsx';
import TemplateEditModal from './TemplateEditModal.jsx';
import templateDownloadService from './templateDownloadService.js';

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
    return 'Invalid Date';
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
    // MODIFIED SECTION for contentLink:
    else if (template.contentLink) {
      const a = document.createElement('a');
      a.href = template.contentLink;
      // Use originalFileName if available, otherwise derive from name or fallback
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
    <div className="p-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Template Management</h2>
      <p className="text-gray-600 mb-6">
        Manage regulatory document templates, compliance checklists, and communication templates.
      </p>

      <div className="mb-6 flex space-x-3">
        <button
          onClick={handleOpenAICreatorModal}
          className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
        >
          Create Template with AI
        </button>
        <button
          onClick={handleOpenUploadModal}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
        >
          Upload New Template
        </button>
      </div>

      {isLoading && <div className="text-center p-4 text-gray-500">Loading templates...</div>}
      {error && <div className="text-center p-4 text-red-500 bg-red-100 rounded-md">{error}</div>}

      {!isLoading && !error && (
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Template Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Version</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {templates.map((template) => (
                <tr key={template.id}>
                  <td className="px-6 py-4 whitespace-normal text-sm font-medium text-gray-900 max-w-xs">{template.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{template.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{template.version}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      template.status === 'Published' ? 'bg-green-100 text-green-800' :
                      template.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                      template.status === 'Archived' ? 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {template.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(template.lastUpdated)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleViewTemplate(template)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      View
                    </button>
                    <button 
                      onClick={() => handleOpenEditModal(template)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    {(template.fileObject || template.contentLink || template.textContent) ? (
                      <button 
                        onClick={() => handleDownloadTemplate(template)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Download
                      </button>
                    ) : (
                      <span className="text-gray-400 text-xs">No Download</span>
                    )}
                  </td>
                </tr>
              ))}
              {templates.length === 0 && !isLoading && (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    No templates defined or found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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