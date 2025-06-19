// src/components/Licensing/NewApplicationPage.js
import React, { useState, useEffect, useMemo } from 'react';
import { getAllRegulatorStaff, createApplication, uploadDocument } from './licensingService.js'; 

const AVAILABLE_LICENSE_TYPES = [
    "Payment Institution License", "E-Money Institution License",
    "Crypto Asset Service Provider License", "Investment Firm License",
    "Credit Institution License", "PISP/AISP License",
    "Banking License (Full)", "Digital Asset Exchange License",
    "Sandbox Participation Permit" 
];

const SectionTitle = ({ title }) => (
    <h3 className="text-xl leading-6 font-semibold text-gray-800 mb-4 mt-6 pb-2 border-b border-gray-300">
      {title}
    </h3>
);

const SubSectionTitle = ({ title }) => (
    <h4 className="text-lg font-medium text-gray-700 mt-6 mb-3">
      {title}
    </h4>
);

const FileUploadInput = ({ planName, planKey, selectedFile, onChange, onClear }) => {
    const inputId = `${planKey}File`;
    return (
        <div>
            <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
                {planName} Document
            </label>
            <div className="mt-1 flex items-center">
                <label 
                    htmlFor={inputId}
                    className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    {selectedFile ? 'Change file' : 'Select file'}
                </label>
                <input
                    type="file"
                    name={inputId}
                    id={inputId}
                    onChange={(e) => onChange(planKey, e.target.files[0])}
                    className="sr-only" 
                />
                {selectedFile && (
                    <div className="ml-3 flex items-center">
                        <span className="text-sm text-gray-600 truncate max-w-xs" title={selectedFile.name}>
                            {selectedFile.name}
                        </span>
                        <button 
                            type="button" 
                            onClick={() => onClear(planKey)}
                            className="ml-2 text-xs text-red-500 hover:text-red-700 focus:outline-none"
                            title="Clear selection"
                        >
                            &times;
                        </button>
                    </div>
                )}
            </div>
            {!selectedFile && <p className="text-xs text-gray-500 mt-1">No file selected.</p>}
        </div>
    );
};


const NewApplicationPage = ({ onBackToList, onApplicationSubmitSuccess }) => {
  const [entityDetails, setEntityDetails] = useState({
    companyName: '', legalName: '', registrationNumber: '',
    dateOfIncorporation: '', jurisdictionOfIncorporation: '', companyType: '',
    primaryAddress: '', website: '', 
    primaryContactFullName: '', primaryContactEmail: '', 
    primaryContactPhone: '', primaryContactPosition: '',
    // MODIFICATION: Add fields for one Director
    directorFullName: '', directorEmail: '', directorPhone: '', directorDOB: '', directorNationality: '', directorResidentialAddress: '',
    // MODIFICATION: Add fields for one UBO
    uboFullName: '', uboEmail: '', uboPhone: '', uboDOB: '', uboNationality: '', uboResidentialAddress: '', uboOwnershipPercentage: '',
  });

  const [selectedLicenseType, setSelectedLicenseType] = useState('');
  const [assignedReviewerId, setAssignedReviewerId] = useState('');
  const [reviewTeam, setReviewTeam] = useState('');
  const [reviewDeadlineSLA, setReviewDeadlineSLA] = useState('');
  
  const initialPlanFiles = {
    financialInfo: null, amlPlan: null, cybersecurityPlan: null,
    openBankingPlan: null, riskManagementPlan: null, testingPlanSandbox: null,
  };
  const [planFiles, setPlanFiles] = useState(initialPlanFiles);
  const [uploadedDocumentIds, setUploadedDocumentIds] = useState({});

  const [staffList, setStaffList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const staffData = await getAllRegulatorStaff();
        setStaffList(staffData || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching staff data:", err);
        setError("Failed to load necessary data for reviewer assignment. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEntityDetailChange = (e) => {
    const { name, value } = e.target;
    setEntityDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (planKey, file) => {
    setPlanFiles(prev => ({ ...prev, [planKey]: file || null }));
    if (!file) {
        setUploadedDocumentIds(prev => {
            const newState = {...prev};
            delete newState[planKey];
            return newState;
        });
    }
  };

  const handleClearFile = (planKey) => {
    handleFileChange(planKey, null);
    const fileInput = document.getElementById(`${planKey}File`);
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!entityDetails.companyName.trim() || !entityDetails.legalName.trim() || !selectedLicenseType) {
      setError("Please fill in all required fields: Company Name, Legal Name, and select a License Type.");
      return;
    }
    // Basic validation for director/UBO if their names are entered
    if (entityDetails.directorFullName.trim() && !entityDetails.directorEmail.trim()) {
        setError("If Director Name is provided, Director Email is also required.");
        return;
    }
    if (entityDetails.uboFullName.trim() && (!entityDetails.uboEmail.trim() || !entityDetails.uboOwnershipPercentage.trim())) {
        setError("If UBO Name is provided, UBO Email and Ownership Percentage are also required.");
        return;
    }


    setIsLoading(true);
    setIsUploading(true); 

    try {
      const collectedSupportingDocIds = [];
      for (const planKey of Object.keys(planFiles)) {
        const file = planFiles[planKey];
        if (file) {
          try {
            const uploadedDocId = await uploadDocument(file, `${planKey.replace(/([A-Z])/g, ' $1').trim()} Document`, entityDetails.companyName || "New Applicant");
            collectedSupportingDocIds.push(uploadedDocId);
            setUploadedDocumentIds(prev => ({...prev, [planKey]: uploadedDocId}));
          } catch (uploadError) {
            throw new Error(`Failed to upload document for ${planKey.replace(/([A-Z])/g, ' $1').trim()}: ${uploadError.message}`);
          }
        }
      }
      setIsUploading(false); 

      const newApplicationData = {
        entityData: { ...entityDetails }, 
        licenseTypeSought: selectedLicenseType,
        applicationType: "New License",
        source: "Manual Entry", 
        supportingDocumentIds: collectedSupportingDocIds, 
        assignedReviewerId: assignedReviewerId || null,
        reviewTeam: reviewTeam || null,
        reviewDeadlineSLA: reviewDeadlineSLA || null,
      };

      const createdApplication = await createApplication(newApplicationData);
      console.log("Application created:", createdApplication);
      alert("New application submitted successfully!");
      onApplicationSubmitSuccess(); 
    } catch (err) {
      setError(err.message || "Failed to submit application.");
      console.error("Submission error:", err);
      setIsUploading(false); 
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !staffList.length && !error) {
    return <div className="p-6 text-center text-gray-600 text-lg">Loading application form data...</div>;
  }

  const planSections = [
    { key: 'financialInfo', name: 'Financial Information' }, { key: 'amlPlan', name: 'AML Plan' },
    { key: 'cybersecurityPlan', name: 'Cybersecurity Plan' }, { key: 'openBankingPlan', name: 'Open Banking Plan' },
    { key: 'riskManagementPlan', name: 'Risk Management Plan' }, { key: 'testingPlanSandbox', name: 'Testing Plan (Sandbox)' },
  ];

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Submit New License Application</h1>
        <button onClick={onBackToList} className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none">
          &larr; Back to Dashboard
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg space-y-8">
        {error && <div className="p-3 mb-4 text-red-700 bg-red-100 rounded-md shadow">{error}</div>}

        {/* Section 1: Applicant Entity Details */}
        <div>
          <SectionTitle title="1. Applicant Entity Details" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Core Entity Fields */}
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name <span className="text-red-500">*</span></label>
              <input type="text" name="companyName" id="companyName" value={entityDetails.companyName} onChange={handleEntityDetailChange} required className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            <div>
              <label htmlFor="legalName" className="block text-sm font-medium text-gray-700">Legal Name <span className="text-red-500">*</span></label>
              <input type="text" name="legalName" id="legalName" value={entityDetails.legalName} onChange={handleEntityDetailChange} required className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            <div>
              <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700">Registration Number</label>
              <input type="text" name="registrationNumber" id="registrationNumber" value={entityDetails.registrationNumber} onChange={handleEntityDetailChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"/>
            </div>
             <div>
              <label htmlFor="dateOfIncorporation" className="block text-sm font-medium text-gray-700">Date of Incorporation</label>
              <input type="date" name="dateOfIncorporation" id="dateOfIncorporation" value={entityDetails.dateOfIncorporation} onChange={handleEntityDetailChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            <div>
              <label htmlFor="jurisdictionOfIncorporation" className="block text-sm font-medium text-gray-700">Jurisdiction of Incorporation</label>
              <input type="text" name="jurisdictionOfIncorporation" id="jurisdictionOfIncorporation" value={entityDetails.jurisdictionOfIncorporation} onChange={handleEntityDetailChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            <div>
              <label htmlFor="companyType" className="block text-sm font-medium text-gray-700">Company Type</label>
              <input type="text" name="companyType" id="companyType" value={entityDetails.companyType} onChange={handleEntityDetailChange} placeholder="e.g., Private Limited Company, LLC" className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="primaryAddress" className="block text-sm font-medium text-gray-700">Primary Business Address</label>
              <input type="text" name="primaryAddress" id="primaryAddress" value={entityDetails.primaryAddress} onChange={handleEntityDetailChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"/>
            </div>
             <div className="md:col-span-2">
              <label htmlFor="website" className="block text-sm font-medium text-gray-700">Company Website</label>
              <input type="url" name="website" id="website" value={entityDetails.website} onChange={handleEntityDetailChange} placeholder="https://example.com" className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"/>
            </div>
          </div>

          <SubSectionTitle title="Primary Contact" />
           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
                <label htmlFor="primaryContactFullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" name="primaryContactFullName" id="primaryContactFullName" value={entityDetails.primaryContactFullName} onChange={handleEntityDetailChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            <div>
                <label htmlFor="primaryContactEmail" className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" name="primaryContactEmail" id="primaryContactEmail" value={entityDetails.primaryContactEmail} onChange={handleEntityDetailChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            <div>
                <label htmlFor="primaryContactPhone" className="block text-sm font-medium text-gray-700">Phone</label>
                <input type="tel" name="primaryContactPhone" id="primaryContactPhone" value={entityDetails.primaryContactPhone} onChange={handleEntityDetailChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"/>
            </div>
             <div>
                <label htmlFor="primaryContactPosition" className="block text-sm font-medium text-gray-700">Position</label>
                <input type="text" name="primaryContactPosition" id="primaryContactPosition" value={entityDetails.primaryContactPosition} onChange={handleEntityDetailChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"/>
            </div>
           </div>

           {/* MODIFICATION: Director Details Section (Single Director for now) */}
            <SubSectionTitle title="Director Information (Add One Director)" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 p-4 border border-dashed border-gray-300 rounded-md">
                <div>
                    <label htmlFor="directorFullName" className="block text-sm font-medium text-gray-700">Director Full Name</label>
                    <input type="text" name="directorFullName" id="directorFullName" value={entityDetails.directorFullName} onChange={handleEntityDetailChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                <div>
                    <label htmlFor="directorEmail" className="block text-sm font-medium text-gray-700">Director Email</label>
                    <input type="email" name="directorEmail" id="directorEmail" value={entityDetails.directorEmail} onChange={handleEntityDetailChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                <div>
                    <label htmlFor="directorPhone" className="block text-sm font-medium text-gray-700">Director Phone</label>
                    <input type="tel" name="directorPhone" id="directorPhone" value={entityDetails.directorPhone} onChange={handleEntityDetailChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                <div>
                    <label htmlFor="directorDOB" className="block text-sm font-medium text-gray-700">Director Date of Birth</label>
                    <input type="date" name="directorDOB" id="directorDOB" value={entityDetails.directorDOB} onChange={handleEntityDetailChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                 <div className="md:col-span-2">
                    <label htmlFor="directorResidentialAddress" className="block text-sm font-medium text-gray-700">Director Residential Address</label>
                    <input type="text" name="directorResidentialAddress" id="directorResidentialAddress" value={entityDetails.directorResidentialAddress} onChange={handleEntityDetailChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                <div>
                    <label htmlFor="directorNationality" className="block text-sm font-medium text-gray-700">Director Nationality</label>
                    <input type="text" name="directorNationality" id="directorNationality" value={entityDetails.directorNationality} onChange={handleEntityDetailChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"/>
                </div>
            </div>

            {/* MODIFICATION: UBO Details Section (Single UBO for now) */}
            <SubSectionTitle title="Ultimate Beneficial Owner (UBO) Information (Add One UBO)" />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 p-4 border border-dashed border-gray-300 rounded-md">
                <div>
                    <label htmlFor="uboFullName" className="block text-sm font-medium text-gray-700">UBO Full Name</label>
                    <input type="text" name="uboFullName" id="uboFullName" value={entityDetails.uboFullName} onChange={handleEntityDetailChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                <div>
                    <label htmlFor="uboEmail" className="block text-sm font-medium text-gray-700">UBO Email</label>
                    <input type="email" name="uboEmail" id="uboEmail" value={entityDetails.uboEmail} onChange={handleEntityDetailChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                 <div>
                    <label htmlFor="uboOwnershipPercentage" className="block text-sm font-medium text-gray-700">Ownership Percentage (%)</label>
                    <input type="number" name="uboOwnershipPercentage" id="uboOwnershipPercentage" value={entityDetails.uboOwnershipPercentage} onChange={handleEntityDetailChange} min="0" max="100" placeholder="e.g., 25" className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                <div>
                    <label htmlFor="uboPhone" className="block text-sm font-medium text-gray-700">UBO Phone</label>
                    <input type="tel" name="uboPhone" id="uboPhone" value={entityDetails.uboPhone} onChange={handleEntityDetailChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                <div>
                    <label htmlFor="uboDOB" className="block text-sm font-medium text-gray-700">UBO Date of Birth</label>
                    <input type="date" name="uboDOB" id="uboDOB" value={entityDetails.uboDOB} onChange={handleEntityDetailChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="uboResidentialAddress" className="block text-sm font-medium text-gray-700">UBO Residential Address</label>
                    <input type="text" name="uboResidentialAddress" id="uboResidentialAddress" value={entityDetails.uboResidentialAddress} onChange={handleEntityDetailChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                 <div>
                    <label htmlFor="uboNationality" className="block text-sm font-medium text-gray-700">UBO Nationality</label>
                    <input type="text" name="uboNationality" id="uboNationality" value={entityDetails.uboNationality} onChange={handleEntityDetailChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"/>
                </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 italic">Note: Functionality to add multiple Directors/UBOs will be added later.</p>
        </div>


        {/* Section 2: License & Application Details */}
        <div>
          <SectionTitle title="2. License & Application Details" />
          {/* ... (License Type, Application Type, Source fields remain as in NewApplicationPage_R004) ... */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label htmlFor="selectedLicenseType" className="block text-sm font-medium text-gray-700">License Type Sought <span className="text-red-500">*</span></label>
              <select 
                id="selectedLicenseType" 
                name="selectedLicenseType" 
                value={selectedLicenseType}
                onChange={(e) => setSelectedLicenseType(e.target.value)}
                required
                className="mt-1 block w-full p-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm sm:text-sm"
              >
                <option value="">-- Select License Type --</option>
                {AVAILABLE_LICENSE_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="applicationType" className="block text-sm font-medium text-gray-700">Application Type</label>
              <input type="text" name="applicationType" id="applicationType" value="New License" readOnly className="mt-1 block w-full p-2 border border-gray-300 bg-gray-100 rounded-md shadow-sm sm:text-sm" />
            </div>
            <div>
              <label htmlFor="applicationSource" className="block text-sm font-medium text-gray-700">Application Source</label>
              <input type="text" name="applicationSource" id="applicationSource" value="Manual Entry" readOnly className="mt-1 block w-full p-2 border border-gray-300 bg-gray-100 rounded-md shadow-sm sm:text-sm" />
            </div>
          </div>
        </div>
        
        {/* Section 3: Supporting Plan Documents */}
        <div>
            <SectionTitle title="3. Supporting Plan Documents" />
            {/* ... (FileUploadInput components remain as in NewApplicationPage_R004) ... */}
            <p className="text-gray-500 text-sm mb-4">
                Upload the relevant document for each plan.
            </p>
            <div className="space-y-6"> 
                {planSections.map(plan => (
                    <FileUploadInput
                        key={plan.key}
                        planName={plan.name}
                        planKey={plan.key}
                        selectedFile={planFiles[plan.key]}
                        onChange={handleFileChange}
                        onClear={handleClearFile}
                    />
                ))}
            </div>
        </div>
        
        {/* Section 4: Reviewer Assignments */}
        <div>
          <SectionTitle title="4. Internal Assignment Details (Optional)" />
          {/* ... (Reviewer assignment fields remain as in NewApplicationPage_R004) ... */}
           <p className="text-gray-500 text-sm mb-2">Assign internal reviewers and set deadlines for this application.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
                <label htmlFor="assignedReviewerId" className="block text-sm font-medium text-gray-700">Lead Reviewer</label>
                <select 
                    id="assignedReviewerId" 
                    name="assignedReviewerId"
                    value={assignedReviewerId}
                    onChange={(e) => setAssignedReviewerId(e.target.value)}
                    className="mt-1 block w-full p-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm sm:text-sm"
                >
                    <option value="">-- Select Lead Reviewer --</option>
                    {staffList.map(staff => (
                        <option key={staff.staffId} value={staff.staffId}>{staff.name} ({staff.role})</option>
                    ))}
                </select>
            </div>
             <div>
                <label htmlFor="reviewTeam" className="block text-sm font-medium text-gray-700">Review Team</label>
                 <select 
                    id="reviewTeam" 
                    name="reviewTeam"
                    value={reviewTeam}
                    onChange={(e) => setReviewTeam(e.target.value)}
                    className="mt-1 block w-full p-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm sm:text-sm"
                >
                    <option value="">-- Select Team --</option>
                    <option value="Alpha Review Team">Alpha Review Team</option>
                    <option value="Beta Review Team">Beta Review Team</option>
                    <option value="Gamma Review Team">Gamma Review Team</option>
                </select>
            </div>
            <div>
                <label htmlFor="reviewDeadlineSLA" className="block text-sm font-medium text-gray-700">Review Deadline (SLA)</label>
                <input 
                    type="date" 
                    name="reviewDeadlineSLA" 
                    id="reviewDeadlineSLA" 
                    value={reviewDeadlineSLA}
                    onChange={(e) => setReviewDeadlineSLA(e.target.value)}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onBackToList}
              className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || isUploading}
              className="px-6 py-2 bg-green-500 text-white font-semibold rounded-md shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500 disabled:opacity-50"
            >
              {isLoading ? (isUploading ? 'Uploading Docs...' : 'Submitting...') : 'Submit New Application'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewApplicationPage;
