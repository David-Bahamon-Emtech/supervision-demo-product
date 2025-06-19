// src/components/RegulatoryUpdates/RegulatoryUpdatesDashboardPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { getAllUpdates } from './regulatoryUpdatesService.js';
import RegulatoryUpdateEditor from './RegulatoryUpdateEditor.jsx';
import RegulatoryUpdateDetailPage from './RegulatoryUpdateDetailPage.jsx'; // Import the new detail page

const RegulatoryUpdatesDashboardPage = () => {
  const [updates, setUpdates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for modal
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [updateToEdit, setUpdateToEdit] = useState(null);

  // State for page navigation
  const [selectedUpdateId, setSelectedUpdateId] = useState(null);

  const fetchData = useCallback(async () => {
    // No need to refetch if a view is active
    if (selectedUpdateId) {
        setIsLoading(false);
        return;
    }
    setIsLoading(true);
    const updatesData = await getAllUpdates();
    setUpdates(updatesData || []);
    setIsLoading(false);
  }, [selectedUpdateId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Handlers for Page Navigation ---
  const handleSelectUpdate = (updateId) => {
    setSelectedUpdateId(updateId);
  };

  const handleBackToList = () => {
    setSelectedUpdateId(null);
    fetchData(); // Refetch list when going back
  };

  // --- Handlers for Editor Modal ---
  const handleOpenCreatorModal = () => {
    setUpdateToEdit(null);
    setIsEditorModalOpen(true);
  };
  
  const handleOpenEditorModal = (update) => {
    setUpdateToEdit(update);
    setIsEditorModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditorModalOpen(false);
    setUpdateToEdit(null);
  };

  const handleSaveSuccess = (savedUpdate) => {
    handleCloseModal();
    fetchData(); 
  };
  
  // --- Rendering Logic ---

  if (isLoading) {
    return <div className="p-6 text-center">Loading regulatory updates...</div>;
  }
  
  // If an update ID is selected, show the detail page
  if (selectedUpdateId) {
    return <RegulatoryUpdateDetailPage updateId={selectedUpdateId} onBack={handleBackToList} />;
  }

  // Otherwise, show the main dashboard
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

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-3xl font-bold text-gray-800">Regulatory Updates</h1>
            <p className="text-gray-600 mt-1">Manage and track all regulatory changes and guidance.</p>
        </div>
        <button 
            onClick={handleOpenCreatorModal}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
            + Create New Update
        </button>
      </div>

      <div className="bg-white shadow-lg rounded-xl overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Update ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Effective Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {updates.map((update) => (
              <tr key={update.updateId} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleSelectUpdate(update.updateId)}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{update.updateId}</td>
                <td className="px-6 py-4 whitespace-normal text-sm text-gray-800 max-w-md">{update.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{update.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(update.status)}`}>
                    {update.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(update.effectiveDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {isEditorModalOpen && (
        <RegulatoryUpdateEditor 
            update={updateToEdit} 
            onClose={handleCloseModal} 
            onSave={handleSaveSuccess}
        />
      )}
    </div>
  );
};

export default RegulatoryUpdatesDashboardPage;