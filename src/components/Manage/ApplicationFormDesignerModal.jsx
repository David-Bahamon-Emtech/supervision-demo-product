// src/components/Manage/ApplicationFormDesignerModal.js
import React, { useState, useEffect } from 'react';

const ApplicationFormDesignerModal = ({ isOpen, onClose, onSave, formToEdit }) => {
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formVersion, setFormVersion] = useState('1.0');
  const [status, setStatus] = useState('Draft');
  const [targetLicenseCategory, setTargetLicenseCategory] = useState('');
  const [sections, setSections] = useState([]);
  const [error, setError] = useState('');

  const availableStatuses = ["Draft", "Published", "Archived"];
  const fieldTypes = ['text', 'textarea', 'select', 'date', 'number', 'file', 'checkbox', 'radio'];

  useEffect(() => {
    if (isOpen) {
      if (formToEdit) {
        setFormName(formToEdit.name || '');
        setFormDescription(formToEdit.description || '');
        setFormVersion(formToEdit.version || '1.0');
        setStatus(formToEdit.status || 'Draft');
        setTargetLicenseCategory(formToEdit.targetLicenseCategory || '');
        // Ensure fields have all properties, defaulting if not present
        setSections(
          (formToEdit.sections || []).map(section => ({
            ...section,
            id: section.id || `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            fields: (section.fields || []).map(field => ({
              id: field.id || `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              label: field.label || '',
              type: field.type || 'text',
              required: field.required || false,
              options: field.options || [],
              placeholder: field.placeholder || '',
              defaultValue: field.defaultValue || '',
              helpText: field.helpText || '',
            }))
          }))
        );
      } else {
        // Reset form for creation
        setFormName('');
        setFormDescription('');
        setFormVersion('1.0');
        setStatus('Draft');
        setTargetLicenseCategory('');
        setSections([{
          id: `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: 'Initial Section',
          fields: []
        }]);
      }
      setError('');
    }
  }, [isOpen, formToEdit]);

  const handleSaveForm = () => {
    if (!formName.trim()) {
      setError('Form Name is required.');
      return;
    }
    setError('');

    const finalSections = sections.map(section => ({
      ...section,
      fields: section.fields.map(field => {
        const fieldToSave = { ...field };
        if (field.type !== 'select') {
          delete fieldToSave.options; // Remove options if not a select type
        } else {
          // Ensure options are stored as an array if they are a string
          if (typeof field.options === 'string') {
            fieldToSave.options = field.options.split(',').map(opt => opt.trim()).filter(opt => opt);
          }
        }
        return fieldToSave;
      })
    }));

    const formDefinition = {
      id: formToEdit ? formToEdit.id : `form_${Date.now()}`,
      name: formName,
      description: formDescription,
      version: formVersion,
      status: status,
      targetLicenseCategory: targetLicenseCategory,
      sections: finalSections,
      createdAt: formToEdit ? formToEdit.createdAt : new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };

    onSave(formDefinition);
    onClose();
  };

  const handleAddSection = () => {
    setSections(prevSections => [
      ...prevSections,
      {
        id: `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: `New Section ${prevSections.length + 1}`,
        fields: []
      }
    ]);
  };

  const handleRemoveSection = (sectionId) => {
    if (sections.length > 1) {
      setSections(prevSections => prevSections.filter(section => section.id !== sectionId));
    } else {
      alert("A form must have at least one section.");
    }
  };

  const handleAddField = (sectionId) => {
    setSections(prevSections =>
      prevSections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              fields: [
                ...section.fields,
                {
                  id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  label: `New Field ${section.fields.length + 1}`,
                  type: 'text',
                  required: false,
                  options: [],
                  placeholder: '',
                  defaultValue: '',
                  helpText: '',
                }
              ]
            }
          : section
      )
    );
  };

  const handleRemoveField = (sectionId, fieldId) => {
    setSections(prevSections =>
      prevSections.map(section =>
        section.id === sectionId
          ? { ...section, fields: section.fields.filter(field => field.id !== fieldId) }
          : section
      )
    );
  };

  const handleSectionChange = (sectionId, property, value) => {
    setSections(prevSections =>
      prevSections.map(section =>
        section.id === sectionId ? { ...section, [property]: value } : section
      )
    );
  };

  const handleFieldChange = (sectionId, fieldId, property, value) => {
    setSections(prevSections =>
      prevSections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              fields: section.fields.map(field =>
                field.id === fieldId ? { ...field, [property]: value } : field
              )
            }
          : section
      )
    );
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">{formToEdit ? `Edit Form: ${formName}` : 'Create New Application Form'}</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}

          {/* Form Metadata */}
          <fieldset className="border border-gray-300 p-4 rounded-md">
            <legend className="text-md font-semibold text-gray-700 px-2">Form Details</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="form-name" className="block text-sm font-medium text-gray-700">Form Name <span className="text-red-500">*</span></label>
                <input type="text" id="form-name" value={formName} onChange={(e) => setFormName(e.target.value)} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="form-version" className="block text-sm font-medium text-gray-700">Version</label>
                <input type="text" id="form-version" value={formVersion} onChange={(e) => setFormVersion(e.target.value)} placeholder="e.g., 1.0" className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="form-description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea id="form-description" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows="2" className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"></textarea>
              </div>
              <div>
                <label htmlFor="form-status" className="block text-sm font-medium text-gray-700">Status</label>
                <select id="form-status" value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500">
                  {availableStatuses.map(s => (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>
              <div>
                <label htmlFor="form-category" className="block text-sm font-medium text-gray-700">Target License Category</label>
                <input type="text" id="form-category" value={targetLicenseCategory} onChange={(e) => setTargetLicenseCategory(e.target.value)} placeholder="e.g., cat_payment_institution" className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
          </fieldset>

          {/* Sections & Fields */}
          <div className="space-y-6">
            <h4 className="text-md font-semibold text-gray-700 mt-6 border-t pt-4">Form Sections</h4>
            {sections.map((section, sectionIndex) => (
              <fieldset key={section.id} className="border border-gray-300 p-4 rounded-md bg-gray-50/50">
                <legend className="text-sm font-semibold text-gray-600 px-2">Section {sectionIndex + 1}</legend>
                <div className="flex justify-between items-center mb-3">
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => handleSectionChange(section.id, 'title', e.target.value)}
                    placeholder="Section Title"
                    className="flex-grow p-2 border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 mr-2"
                  />
                  <button onClick={() => handleRemoveSection(section.id)} className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-300 rounded-md hover:bg-red-50">Remove Section</button>
                </div>
                <textarea
                  value={section.description || ''}
                  onChange={(e) => handleSectionChange(section.id, 'description', e.target.value)}
                  placeholder="Optional: Section description or instructions"
                  rows="2"
                  className="w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 mb-3"
                />

                <div className="space-y-4">
                  {section.fields.map((field, fieldIndex) => (
                    <div key={field.id} className="border border-gray-200 p-3 rounded-md bg-white shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-xs font-semibold text-gray-700">Field {fieldIndex + 1}</p>
                        <button onClick={() => handleRemoveField(section.id, field.id)} className="px-2 py-0.5 text-xs text-red-500 border border-red-200 rounded hover:bg-red-50">Remove Field</button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600">Label</label>
                          <input type="text" value={field.label} onChange={(e) => handleFieldChange(section.id, field.id, 'label', e.target.value)} className="mt-1 w-full p-1.5 border-gray-300 rounded-md text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600">Type</label>
                          <select value={field.type} onChange={(e) => handleFieldChange(section.id, field.id, 'type', e.target.value)} className="mt-1 w-full p-1.5 border-gray-300 rounded-md text-sm">
                            {fieldTypes.map(type => <option key={type} value={type}>{type}</option>)}
                          </select>
                        </div>
                        {field.type === 'select' && (
                          <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-600">Options (comma-separated)</label>
                            <textarea
                              value={Array.isArray(field.options) ? field.options.join(', ') : field.options || ''}
                              onChange={(e) => handleFieldChange(section.id, field.id, 'options', e.target.value)}
                              rows="2"
                              className="mt-1 w-full p-1.5 border-gray-300 rounded-md text-sm"
                              placeholder="e.g., Option 1, Option 2, Option 3"
                            />
                          </div>
                        )}
                        <div>
                          <label className="block text-xs font-medium text-gray-600">Placeholder</label>
                          <input type="text" value={field.placeholder || ''} onChange={(e) => handleFieldChange(section.id, field.id, 'placeholder', e.target.value)} className="mt-1 w-full p-1.5 border-gray-300 rounded-md text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600">Default Value</label>
                          <input type="text" value={field.defaultValue || ''} onChange={(e) => handleFieldChange(section.id, field.id, 'defaultValue', e.target.value)} className="mt-1 w-full p-1.5 border-gray-300 rounded-md text-sm" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-600">Help Text</label>
                          <input type="text" value={field.helpText || ''} onChange={(e) => handleFieldChange(section.id, field.id, 'helpText', e.target.value)} className="mt-1 w-full p-1.5 border-gray-300 rounded-md text-sm" />
                        </div>
                        <div className="flex items-center md:col-span-2">
                          <input
                            type="checkbox"
                            checked={field.required || false}
                            id={`field-required-${field.id}`}
                            onChange={(e) => handleFieldChange(section.id, field.id, 'required', e.target.checked)}
                            className="h-3.5 w-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor={`field-required-${field.id}`} className="ml-2 text-xs font-medium text-gray-600">Required Field</label>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => handleAddField(section.id)} className="mt-3 px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50">+ Add Field to Section</button>
                </div>
              </fieldset>
            ))}
            <button onClick={handleAddSection} className="mt-4 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">+ Add New Section</button>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 bg-gray-50">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Cancel
          </button>
          <button type="button" onClick={handleSaveForm} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
            Save Form Definition
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationFormDesignerModal;