// src/components/RegulatoryUpdates/RegulatoryUpdateEditor.js
import React, { useState, useEffect } from 'react';
import { addOrUpdateContent } from './regulatoryUpdatesService.js';
import licenseCategoriesData from '../../data/licenseCategories.js';

const RegulatoryUpdateEditor = ({ contentToEdit, contentType, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    status: 'Draft',
    type: contentType === 'Publication' ? 'Research Paper' : 'Guidance',
    applicableCategories: [],
    summary: '',
    textContent: '',
    author: '',
    tags: [],
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  
  const isEditing = contentToEdit !== null;
  const currentContentType = isEditing ? contentToEdit.contentType : contentType;

  const publicationTypes = ['Research Paper', 'Economic Report', 'Annual Report', 'Statistical Bulletin'];
  const updateTypes = ['Regulation', 'Guidance', 'Circular', 'Policy Note'];

  useEffect(() => {
    if (isEditing) {
      setFormData({
        title: contentToEdit.title || '',
        status: contentToEdit.status || 'Draft',
        type: contentToEdit.type || (currentContentType === 'Publication' ? 'Research Paper' : 'Guidance'),
        applicableCategories: contentToEdit.applicableCategories || [],
        summary: contentToEdit.summary || '',
        textContent: contentToEdit.textContent || '',
        author: contentToEdit.author || '',
        tags: contentToEdit.tags || [],
      });
    } else {
        // Reset for creation
        setFormData({
            title: '',
            status: 'Draft',
            type: contentType === 'Publication' ? 'Research Paper' : 'Guidance',
            applicableCategories: [],
            summary: '',
            textContent: '',
            author: '',
            tags: [],
        });
    }
  }, [contentToEdit, isEditing, contentType, currentContentType]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (!formData.title) {
        const fileNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.'));
        setFormData(prev => ({ ...prev, title: fileNameWithoutExt.replace(/[_-]/g, ' ') }));
      }
      setError('');
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Please select a document to upload and analyze.");
      return;
    }
    setIsAnalyzing(true);
    setError('');

    const uploadData = new FormData();
    uploadData.append('document', selectedFile);

    try {
      const response = await fetch('http://localhost:3001/api/updates/upload-and-analyze', {
        method: 'POST',
        body: uploadData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Analysis failed. Check server logs.');
      }
      
      const result = await response.json();
      
      const updatePayload = {
        summary: result.summary || 'AI could not generate a summary.',
        textContent: result.extractedText || 'Could not extract text from document.'
      };

      // Only apply suggested categories if it's a regulatory update
      if(currentContentType === 'Update') {
        updatePayload.applicableCategories = result.suggestedCategoryIds || [];
      }

      setFormData(prev => ({
        ...prev,
        ...updatePayload
      }));

    } catch (err) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.summary) {
      setError("Title and Summary are required fields.");
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      const payload = {
        ...formData,
        contentType: currentContentType, // Ensure contentType is set
        tags: Array.isArray(formData.tags) ? formData.tags : formData.tags.split(',').map(t => t.trim()).filter(t => t),
      };

      if (isEditing) {
        payload.id = contentToEdit.id;
      }
      
      const savedContent = await addOrUpdateContent(payload);
      onSave(savedContent);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            {isEditing ? `Edit ${currentContentType}` : `Create New ${currentContentType}`}
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}
          
          <div>
            <label htmlFor="documentUpload" className="block text-sm font-medium text-gray-700">Upload Source Document (PDF, TXT)</label>
            <div className="mt-1 flex items-center space-x-4">
              <input type="file" id="documentUpload" onChange={handleFileChange} accept=".pdf,.txt" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
              <button type="button" onClick={handleAnalyze} disabled={!selectedFile || isAnalyzing} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 disabled:opacity-50 flex-shrink-0">
                {isAnalyzing ? 'Analyzing...' : 'Upload & Analyze'}
              </button>
            </div>
          </div>
          
          <hr/>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title <span className="text-red-500">*</span></label>
            <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm" required />
          </div>

          <div>
            <label htmlFor="summary" className="block text-sm font-medium text-gray-700">Summary / Abstract <span className="text-red-500">*</span></label>
            <textarea name="summary" id="summary" value={formData.summary} onChange={handleChange} rows="3" className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm"></textarea>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type / Category</label>
                <select name="type" id="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm">
                    {(currentContentType === 'Update' ? updateTypes : publicationTypes).map(t => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </select>
            </div>
             <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                <select name="status" id="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm">
                    <option>Draft</option>
                    <option>Published</option>
                    <option>Archived</option>
                </select>
            </div>
          </div>

            {currentContentType === 'Publication' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="author" className="block text-sm font-medium text-gray-700">Author / Department</label>
                        <input type="text" name="author" id="author" value={formData.author} onChange={handleChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
                        <input type="text" name="tags" id="tags" value={Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags} onChange={handleChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm" />
                    </div>
                </div>
            )}
            
            {currentContentType === 'Update' && (
                 <div>
                    <label htmlFor="applicableCategories" className="block text-sm font-medium text-gray-700">Applicable License Categories (AI Suggested)</label>
                    <select name="applicableCategories" id="applicableCategories" multiple value={formData.applicableCategories} readOnly className="mt-1 block w-full h-24 p-2 border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-50">
                    {licenseCategoriesData.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">AI suggestions are shown. Final categories can be adjusted after saving.</p>
                </div>
            )}


          <div>
            <label htmlFor="textContent" className="block text-sm font-medium text-gray-700">Full Content</label>
            <textarea name="textContent" id="textContent" value={formData.textContent} onChange={handleChange} rows="8" className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm font-mono text-xs"></textarea>
          </div>

        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={isSaving || isAnalyzing} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">
            {isSaving ? 'Saving...' : 'Save Content'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegulatoryUpdateEditor;