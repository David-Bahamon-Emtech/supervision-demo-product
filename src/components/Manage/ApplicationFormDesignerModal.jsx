// src/components/Manage/ApplicationFormDesignerModal.js
import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

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
  
  const inputStyles = "mt-1 block w-full p-2 bg-theme-bg border-theme-border rounded-md shadow-sm sm:text-sm text-theme-text-primary focus:ring-theme-accent focus:border-theme-accent";
  const labelStyles = "block text-sm font-medium text-theme-text-secondary";
  const smallInputStyles = "mt-1 w-full p-1.5 bg-theme-bg border-theme-border rounded-md text-sm text-theme-text-primary focus:ring-theme-accent focus:border-theme-accent";


  useEffect(() => {
    if (isOpen) {
      if (formToEdit) {
        setFormName(formToEdit.name || '');
        setFormDescription(formToEdit.description || '');
        setFormVersion(formToEdit.version || '1.0');
        setStatus(formToEdit.status || 'Draft');
        setTargetLicenseCategory(formToEdit.targetLicenseCategory || '');
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
        if (field.type !== 'select' && field.type !== 'radio') {
          delete fieldToSave.options;
        } else {
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
      { id: `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, title: `New Section ${prevSections.length + 1}`, fields: [] }
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
        section.id === sectionId ? { ...section, fields: [ ...section.fields, { id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, label: `New Field ${section.fields.length + 1}`, type: 'text', required: false, options: [], placeholder: '', defaultValue: '', helpText: '' } ] } : section
      )
    );
  };

  const handleRemoveField = (sectionId, fieldId) => {
    setSections(prevSections =>
      prevSections.map(section =>
        section.id === sectionId ? { ...section, fields: section.fields.filter(field => field.id !== fieldId) } : section
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
        section.id === sectionId ? { ...section, fields: section.fields.map(field => field.id === fieldId ? { ...field, [property]: value } : field) } : section
      )
    );
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
      <div className="bg-theme-bg-secondary rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-theme-border">
        <div className="px-6 py-4 border-b border-theme-border flex justify-between items-center">
          <h3 className="text-lg font-semibold text-theme-text-primary">{formToEdit ? `Edit Form: ${formName}` : 'Create New Application Form'}</h3>
          <button onClick={onClose} className="p-1 rounded-full text-theme-text-secondary hover:bg-black hover:bg-opacity-20"><XMarkIcon className="w-5 h-5"/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && <div className="p-3 bg-red-900 bg-opacity-30 text-red-300 rounded-md text-sm border border-red-500">{error}</div>}

          <fieldset className="border border-theme-border p-4 rounded-md">
            <legend className="text-md font-semibold text-theme-text-primary px-2">Form Details</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="form-name" className={labelStyles}>Form Name <span className="text-red-500">*</span></label>
                <input type="text" id="form-name" value={formName} onChange={(e) => setFormName(e.target.value)} className={inputStyles} />
              </div>
              <div>
                <label htmlFor="form-version" className={labelStyles}>Version</label>
                <input type="text" id="form-version" value={formVersion} onChange={(e) => setFormVersion(e.target.value)} placeholder="e.g., 1.0" className={inputStyles} />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="form-description" className={labelStyles}>Description</label>
                <textarea id="form-description" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows="2" className={inputStyles}></textarea>
              </div>
              <div>
                <label htmlFor="form-status" className={labelStyles}>Status</label>
                <select id="form-status" value={status} onChange={(e) => setStatus(e.target.value)} className={inputStyles}>
                  {availableStatuses.map(s => (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>
              <div>
                <label htmlFor="form-category" className={labelStyles}>Target License Category</label>
                <input type="text" id="form-category" value={targetLicenseCategory} onChange={(e) => setTargetLicenseCategory(e.target.value)} placeholder="e.g., cat_payment_institution" className={inputStyles} />
              </div>
            </div>
          </fieldset>

          <div className="space-y-6">
            <h4 className="text-md font-semibold text-theme-text-primary mt-6 border-t border-theme-border pt-4">Form Sections</h4>
            {sections.map((section, sectionIndex) => (
              <fieldset key={section.id} className="border border-theme-border p-4 rounded-md bg-theme-bg">
                <legend className="text-sm font-semibold text-theme-text-secondary px-2">Section {sectionIndex + 1}</legend>
                <div className="flex justify-between items-center mb-3">
                  <input type="text" value={section.title} onChange={(e) => handleSectionChange(section.id, 'title', e.target.value)} placeholder="Section Title" className={`${inputStyles} mr-2`} />
                  <button onClick={() => handleRemoveSection(section.id)} className="px-3 py-1.5 text-xs font-medium text-red-400 border border-red-500 rounded-md hover:bg-red-900 hover:bg-opacity-30">Remove Section</button>
                </div>
                <textarea value={section.description || ''} onChange={(e) => handleSectionChange(section.id, 'description', e.target.value)} placeholder="Optional: Section description or instructions" rows="2" className={`${inputStyles} mb-3`} />

                <div className="space-y-4">
                  {section.fields.map((field, fieldIndex) => (
                    <div key={field.id} className="border border-theme-border p-3 rounded-md bg-theme-bg-secondary shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-xs font-semibold text-theme-text-secondary">Field {fieldIndex + 1}</p>
                        <button onClick={() => handleRemoveField(section.id, field.id)} className="px-2 py-0.5 text-xs text-red-400 border border-red-500 rounded hover:bg-red-900 hover:bg-opacity-30">Remove Field</button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-theme-text-secondary">Label</label>
                          <input type="text" value={field.label} onChange={(e) => handleFieldChange(section.id, field.id, 'label', e.target.value)} className={smallInputStyles} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-theme-text-secondary">Type</label>
                          <select value={field.type} onChange={(e) => handleFieldChange(section.id, field.id, 'type', e.target.value)} className={smallInputStyles}>
                            {fieldTypes.map(type => <option key={type} value={type}>{type}</option>)}
                          </select>
                        </div>
                        {(field.type === 'select' || field.type === 'radio') && (
                          <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-theme-text-secondary">Options (comma-separated)</label>
                            <textarea value={Array.isArray(field.options) ? field.options.join(', ') : field.options || ''} onChange={(e) => handleFieldChange(section.id, field.id, 'options', e.target.value)} rows="2" className={smallInputStyles} placeholder="e.g., Option 1, Option 2" />
                          </div>
                        )}
                        <div>
                          <label className="block text-xs font-medium text-theme-text-secondary">Placeholder</label>
                          <input type="text" value={field.placeholder || ''} onChange={(e) => handleFieldChange(section.id, field.id, 'placeholder', e.target.value)} className={smallInputStyles} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-theme-text-secondary">Default Value</label>
                          <input type="text" value={field.defaultValue || ''} onChange={(e) => handleFieldChange(section.id, field.id, 'defaultValue', e.target.value)} className={smallInputStyles} />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-theme-text-secondary">Help Text</label>
                          <input type="text" value={field.helpText || ''} onChange={(e) => handleFieldChange(section.id, field.id, 'helpText', e.target.value)} className={smallInputStyles} />
                        </div>
                        <div className="flex items-center md:col-span-2">
                          <input type="checkbox" checked={field.required || false} id={`field-required-${field.id}`} onChange={(e) => handleFieldChange(section.id, field.id, 'required', e.target.checked)}
                            className="h-3.5 w-3.5 text-theme-accent bg-theme-bg border-gray-500 rounded focus:ring-theme-accent" />
                          <label htmlFor={`field-required-${field.id}`} className="ml-2 text-xs font-medium text-theme-text-secondary">Required Field</label>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => handleAddField(section.id)} className="mt-3 px-3 py-1.5 text-xs font-medium text-blue-400 border border-blue-500 rounded-md hover:bg-blue-900 hover:bg-opacity-30">+ Add Field to Section</button>
                </div>
              </fieldset>
            ))}
            <button onClick={handleAddSection} className="mt-4 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">+ Add New Section</button>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-theme-border flex justify-end space-x-3 bg-black bg-opacity-20">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-200 bg-gray-700 border border-transparent rounded-md hover:bg-gray-600">
            Cancel
          </button>
          <button type="button" onClick={handleSaveForm} className="px-4 py-2 text-sm font-medium text-sidebar-bg bg-theme-accent rounded-md hover:brightness-110">
            Save Form Definition
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationFormDesignerModal;