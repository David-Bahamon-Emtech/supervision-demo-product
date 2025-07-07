// src/components/RegulatoryUpdates/RegulatoryUpdatesDashboardPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { getAllContent } from './regulatoryUpdatesService.js'; // Updated import
import RegulatoryUpdateEditor from './RegulatoryUpdateEditor.jsx';
import RegulatoryUpdateDetailPage from './RegulatoryUpdateDetailPage.jsx';

const RegulatoryUpdatesDashboardPage = () => {
  const [allContent, setAllContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Updates'); // 'Updates' or 'Publications'

  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [contentToEdit, setContentToEdit] = useState(null);
  const [newContentType, setNewContentType] = useState('Update');

  const [selectedContentId, setSelectedContentId] = useState(null);

  const fetchData = useCallback(async () => {
    if (selectedContentId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const contentData = await getAllContent();
    setAllContent(contentData || []);
    setIsLoading(false);
  }, [selectedContentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSelectContent = (contentId) => {
    setSelectedContentId(contentId);
  };

  const handleBackToList = () => {
    setSelectedContentId(null);
    fetchData();
  };

  const handleOpenCreatorModal = (contentType) => {
    setNewContentType(contentType);
    setContentToEdit(null);
    setIsEditorModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditorModalOpen(false);
    setContentToEdit(null);
  };

  const handleSaveSuccess = (savedContent) => {
    handleCloseModal();
    fetchData();
    // Optional: switch to the tab of the content that was just saved
    setActiveTab(savedContent.contentType === 'Publication' ? 'Publications' : 'Updates');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Published': return 'bg-green-100 text-green-800';
      case 'Draft': return 'bg-yellow-100 text-yellow-800';
      case 'Archived': case 'Superseded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading content...</div>;
  }

  if (selectedContentId) {
    // The detail page can now handle both types
    return <RegulatoryUpdateDetailPage updateId={selectedContentId} onBack={handleBackToList} />;
  }

  const filteredContent = allContent.filter(item => 
    activeTab === 'Updates' ? item.contentType === 'Update' : item.contentType === 'Publication'
  );

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Regulatory Content</h1>
          <p className="text-gray-600 mt-1">Manage and track all regulatory changes, guidance, and publications.</p>
        </div>
        <div className="flex space-x-2">
            <button 
                onClick={() => handleOpenCreatorModal('Update')}
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                + New Update
            </button>
            <button 
                onClick={() => handleOpenCreatorModal('Publication')}
                className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
                + New Publication
            </button>
        </div>
      </div>

      <div className="mb-6 border-b border-gray-300">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            <button onClick={() => setActiveTab('Updates')} className={`${activeTab === 'Updates' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none`}>
                Regulatory Updates
            </button>
            <button onClick={() => setActiveTab('Publications')} className={`${activeTab === 'Publications' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none`}>
                Research & Publications
            </button>
        </nav>
      </div>

      <div className="bg-white shadow-lg rounded-xl overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type / Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {activeTab === 'Updates' ? 'Effective Date' : 'Publication Date'}
              </th>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {activeTab === 'Updates' ? 'Update ID' : 'Publication ID'}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredContent.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleSelectContent(item.id)}>
                <td className="px-6 py-4 whitespace-normal text-sm font-medium text-gray-800 max-w-md">{item.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(activeTab === 'Updates' ? item.effectiveDate : item.issueDate)}
                </td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{item.id}</td>
              </tr>
            ))}
             {filteredContent.length === 0 && (
                <tr>
                    <td colSpan="5" className="text-center py-10 text-gray-500 italic">
                        No {activeTab === 'Updates' ? 'Regulatory Updates' : 'Publications'} found.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {isEditorModalOpen && (
        <RegulatoryUpdateEditor 
            contentToEdit={contentToEdit} 
            contentType={newContentType}
            onClose={handleCloseModal} 
            onSave={handleSaveSuccess}
        />
      )}
    </div>
  );
};

export default RegulatoryUpdatesDashboardPage;