// src/components/Manage/ApplicationFormManagement.js
import React, { useState } from 'react';
import { initialApplicationForms } from '../../data/applicationForms.js'; //
import ApplicationFormViewerModal from './ApplicationFormViewerModal.jsx'; //
import ApplicationFormDesignerModal from './ApplicationFormDesignerModal.jsx'; //

// --- SVG Icon Components ---
const IconView = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639l4.433-7.467a1.012 1.012 0 011.616 0l4.433 7.467a1.012 1.012 0 010 .639l-4.433 7.467a1.012 1.012 0 01-1.616 0l-4.433-7.467z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const IconEdit = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);

const IconArchive = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
  </svg>
);

const IconDelete = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09 1.02-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

const IconPublish = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
  </svg>
);

const IconReactivate = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.092 1.21-.138 2.43-.138 3.662m14.862 0A48.49 48.49 0 0112 14.25a48.49 48.49 0 01-7.431-2.25m14.862 0A48.971 48.971 0 0012 14.25a48.971 48.971 0 00-7.431 2.25m14.862 0h3.375A2.25 2.25 0 0121 14.25v2.25a2.25 2.25 0 01-2.25 2.25h-1.372c.077.162.15.324.217.487m-2.17-4.935A48.49 48.49 0 0112 14.25a48.49 48.49 0 01-7.431-2.25m7.431 4.5A48.971 48.971 0 0012 14.25a48.971 48.971 0 00-7.431 2.25M3.375 12h4.875c.621 0 1.125.504 1.125 1.125V16.5c0 .621-.504 1.125-1.125 1.125H3.375c-.621 0-1.125-.504-1.125-1.125V13.125c0-.621.504-1.125 1.125-1.125z" />
    </svg>
);


// --- ActionButton Component ---
const ActionButton = ({ icon, label, onClick, disabled, activeColorClass = "text-gray-700", disabledColorClass = "text-gray-300", hoverColorClass = "text-blue-600" }) => (
  <div className="relative flex items-center group">
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={label}
      className={`p-1.5 rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400
        ${disabled ? `${disabledColorClass} cursor-not-allowed` : `${activeColorClass} hover:${hoverColorClass} hover:bg-gray-100`
      }`}
    >
      {icon}
    </button>
    <div
      className="absolute bottom-full left-1/2 z-20 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded-md shadow-sm 
                 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap
                 transform -translate-x-1/2"
    >
      {label}
    </div>
  </div>
);


const ApplicationFormManagement = () => {
  const [forms, setForms] = useState(initialApplicationForms); //
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [formToView, setFormToView] = useState(null);
  const [isDesignerModalOpen, setIsDesignerModalOpen] = useState(false);
  const [formToEdit, setFormToEdit] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString + 'T00:00:00Z');
    const options = { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' };
    return date.toLocaleDateString(undefined, options);
  };

  const handleOpenViewModal = (form) => {
    setFormToView(form);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setFormToView(null);
  };

  const handleOpenDesignerModal = (form) => {
    setFormToEdit(form);
    setIsDesignerModalOpen(true);
  };

  const handleCloseDesignerModal = () => {
    setIsDesignerModalOpen(false);
    setFormToEdit(null);
  };

  const handleSaveForm = (formDefinition) => {
    setForms(prevForms => {
      const existingFormIndex = prevForms.findIndex(form => form.id === formDefinition.id);
      if (existingFormIndex > -1) {
        const updatedForms = [...prevForms];
        updatedForms[existingFormIndex] = { ...formDefinition, lastUpdated: new Date().toISOString() };
        return updatedForms;
      } else {
        return [...prevForms, { ...formDefinition, id: `form_${Date.now()}`, createdAt: new Date().toISOString(), lastUpdated: new Date().toISOString() }];
      }
    });
    handleCloseDesignerModal();
  };

  const handleDeleteForm = (formId) => {
    if (window.confirm("Are you sure you want to delete this form? This action cannot be undone.")) {
      setForms(prevForms => prevForms.filter(form => form.id !== formId));
    }
  };

  const handlePublishForm = (formId) => {
    if (window.confirm("Are you sure you want to publish this form?")) {
      setForms(prevForms =>
        prevForms.map(form =>
          form.id === formId ? { ...form, status: 'Published', lastUpdated: new Date().toISOString() } : form
        )
      );
    }
  };

  const handleArchiveForm = (formId) => {
    if (window.confirm("Are you sure you want to archive this form? Archived forms cannot be used for new applications.")) {
      setForms(prevForms =>
        prevForms.map(form =>
          form.id === formId ? { ...form, status: 'Archived', lastUpdated: new Date().toISOString() } : form
        )
      );
    }
  };

  const handleReactivateForm = (formId) => {
    if (window.confirm("Are you sure you want to reactivate this form to 'Draft' status?")) {
      setForms(prevForms =>
        prevForms.map(form =>
          form.id === formId ? { ...form, status: 'Draft', lastUpdated: new Date().toISOString() } : form
        )
      );
    }
  };


  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Application Form Management</h2>
      <p className="text-gray-600 mb-6">
        Design, version, and publish various license application forms.
      </p>

      <div className="mb-6">
        <button
          onClick={() => handleOpenDesignerModal(null)}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
        >
          Create New Application Form
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Form Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Version
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Target License Category
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> {/* Corrected typo in scope */}
                Last Updated
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {forms.map((form) => {
              const isPublished = form.status === 'Published';
              const isArchived = form.status === 'Archived';
              const isDraft = form.status === 'Draft';

              return (
                <tr key={form.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{form.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{form.version}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      isPublished ? 'bg-green-100 text-green-800' :
                      isDraft ? 'bg-yellow-100 text-yellow-800' :
                      isArchived ? 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {form.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{form.targetLicenseCategory}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(form.lastUpdated)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <ActionButton
                        icon={<IconView />}
                        label="View Form Design"
                        onClick={() => handleOpenViewModal(form)}
                        activeColorClass="text-indigo-600"
                        hoverColorClass="text-indigo-800"
                      />
                      <ActionButton
                        icon={<IconEdit />}
                        label="Edit Form Design"
                        onClick={() => handleOpenDesignerModal(form)}
                        disabled={isPublished || isArchived}
                        activeColorClass="text-blue-600"
                        hoverColorClass="text-blue-800"
                      />
                      {isDraft && (
                        <ActionButton
                          icon={<IconPublish />}
                          label="Publish Form"
                          onClick={() => handlePublishForm(form.id)}
                          activeColorClass="text-green-600"
                          hoverColorClass="text-green-800"
                        />
                      )}
                      {isPublished && (
                        <ActionButton
                          icon={<IconArchive />}
                          label="Archive Form"
                          onClick={() => handleArchiveForm(form.id)}
                          activeColorClass="text-yellow-500"
                          hoverColorClass="text-yellow-700"
                        />
                      )}
                      {isArchived && (
                        <ActionButton
                          icon={<IconReactivate />}
                          label="Reactivate to Draft"
                          onClick={() => handleReactivateForm(form.id)}
                          activeColorClass="text-teal-600" // Using teal for reactivate
                          hoverColorClass="text-teal-800"
                        />
                      )}
                       <ActionButton
                        icon={<IconDelete />}
                        label="Delete Form"
                        onClick={() => handleDeleteForm(form.id)}
                        disabled={isPublished} // Can delete draft or archived
                        activeColorClass="text-red-600"
                        hoverColorClass="text-red-800"
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
            {forms.length === 0 && (
                <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-sm text-gray-500">
                        No application forms defined yet. Click "Create New Application Form" to get started.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      <ApplicationFormViewerModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        formDefinition={formToView}
      />

      <ApplicationFormDesignerModal
        isOpen={isDesignerModalOpen}
        onClose={handleCloseDesignerModal}
        onSave={handleSaveForm}
        formToEdit={formToEdit}
      />
    </div>
  );
};

export default ApplicationFormManagement;