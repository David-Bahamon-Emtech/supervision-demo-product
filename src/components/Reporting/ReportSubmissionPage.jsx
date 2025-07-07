import React, { useState, useEffect } from 'react';
import { getLicensedEntities } from '../Licensing/licensingService.js';
import { createComplianceSubmission } from './reportingService.js';

// --- Icon Components (using inline SVG for portability) ---
const BuildingIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="9" x2="9" y1="22" y2="4"/><line x1="15" x2="15" y1="22" y2="4"/><line x1="3" x2="21" y1="8" y2="8"/><line x1="3" x2="21" y1="16" y2="16"/></svg>;
const FileTextIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>;
const DollarSignIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const ShieldIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const UploadIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>;
const UserCheckIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>;
const CpuIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M9 2v2"/><path d="M9 20v2"/><path d="M2 9h2"/><path d="M2 15h2"/><path d="M20 9h2"/><path d="M20 15h2"/></svg>;
const AlertCircleIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>;
const EmtechLogo = ({ className }) => <img src="/assets/logos/logo.png" alt="EMTECH Logo" className={className} />;

// --- Form Input Components (moved outside to prevent recreation on re-renders) ---
const InputField = React.memo(({ id, label, value, error, onChange, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input 
            id={id} 
            value={value || ''} 
            onChange={onChange}
            {...props}
            className={`w-full p-3 border rounded-lg text-sm ${props.readOnly ? 'bg-gray-100' : ''} ${error ? 'border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`} 
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
));

const SelectField = React.memo(({ id, label, value, onChange, error, children, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select 
            id={id} 
            value={value || ''} 
            onChange={onChange} 
            {...props}
            className={`w-full p-3 border rounded-lg text-sm ${error ? 'border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
        >
            {children}
        </select>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
));

const CheckboxField = React.memo(({ id, label, checked, onChange, error }) => (
     <div className="flex items-start">
        <div className="flex items-center h-5">
            <input 
                id={id} 
                type="checkbox" 
                checked={checked || false} 
                onChange={onChange}
                className={`h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${error ? 'border-red-500' : ''}`} 
            />
        </div>
        <div className="ml-3 text-sm">
            <label htmlFor={id} className="font-medium text-gray-700">{label}</label>
            {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
    </div>
));

const FileInput = React.memo(({ id, label, onChange, error, file, ...props }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input 
        id={id} 
        type="file" 
        onChange={onChange} 
        {...props} 
        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-blue-700 hover:file:bg-blue-50 border border-gray-300 rounded-lg" 
      />
      {file && <p className="text-xs text-gray-500 mt-1">Selected: {file.name}</p>}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
));

const ReportSubmissionPage = ({ onBack }) => {
  const [licensedEntities, setLicensedEntities] = useState([]);
  const [formData, setFormData] = useState({
    entityDetails: {
      entityId: '', companyName: '', licenseNumber: '', reportingOfficer: '',
      officerEmail: '', officerPhone: '',
    },
    reportDetails: {
      reportType: '', reportingPeriod: '', submissionDeadline: '',
      reportingFrequency: '',
    },
    businessMetrics: {
      totalAssets: '', totalLiabilities: '', customerFunds: '', activeCustomers: '',
    },
    techAttestation: {
        cloudProvider: 'AWS', cloudLocalContent: '85', database: 'PostgreSQL', dbLocalContent: '95',
        backendLanguage: 'Node.js', backendLocalContent: '80',
        attestation: false
    },
    compliance: {
      materialChanges: false, materialChangesDetails: '', regulatoryBreaches: false,
      breachDetails: '',
    },
    files: {
      primaryReport: null, auditedFinancials: null, managementLetter: null,
      supportingDocuments: []
    },
    certifications: {
      dataAccuracy: false, materialCompliance: false, timelyReporting: false, authorizedSubmission: false
    }
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [metricsFile, setMetricsFile] = useState(null);
  const [isAutofilling, setIsAutofilling] = useState(false);

  useEffect(() => {
    const fetchEntities = async () => {
        try {
            const entities = await getLicensedEntities();
            setLicensedEntities(entities);
        } catch (error) {
            console.error("Failed to fetch licensed entities:", error);
            setErrors(prev => ({...prev, pageLoad: "Could not load licensed entities. Please try again later."}));
        }
    };
    fetchEntities();
  }, []);

  const handleEntitySelection = (selectedEntityId) => {
    const entity = licensedEntities.find(e => e.entityId === selectedEntityId);
    if (entity) {
        setFormData(prev => ({
            ...prev,
            entityDetails: {
                entityId: entity.entityId,
                companyName: entity.companyName,
                licenseNumber: entity.licenseNumber,
                reportingOfficer: entity.reportingOfficer,
                officerEmail: entity.officerEmail,
                officerPhone: entity.officerPhone,
            }
        }));
    } else {
        setFormData(prev => ({
            ...prev,
            entityDetails: {
              entityId: '', companyName: '', licenseNumber: '', reportingOfficer: '',
              officerEmail: '', officerPhone: '',
            }
        }));
    }
  };

  const reportTypes = [
    'Quarterly Financial Report', 'Annual Compliance Report', 'Customer Asset Report',
    'AML/CTF Compliance Report', 'Cybersecurity Incident Report', 'Material Change Notification',
    'Prudential Return', 'Consumer Complaint Summary'
  ];

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
    if (errors[`${section}.${field}`]) {
      setErrors(prev => ({ ...prev, [`${section}.${field}`]: undefined }));
    }
  };

  const handleFileChange = (fileType, files) => {
    const file = fileType === 'supportingDocuments' ? Array.from(files) : files[0];
    setFormData(prev => ({
      ...prev,
      files: { ...prev.files, [fileType]: file }
    }));
  };

  const handleAutofillMetrics = () => {
    if (!metricsFile) {
        alert("Please select a metrics file to upload first.");
        return;
    }
    setIsAutofilling(true);
    setTimeout(() => {
        const extractedData = {
            totalAssets: '150750000',
            totalLiabilities: '85300000',
            customerFunds: '65450000',
            activeCustomers: '12500',
        };
        setFormData(prev => ({
            ...prev,
            businessMetrics: extractedData
        }));
        setIsAutofilling(false);
    }, 1500);
  };

  const validateStep = (step) => {
    const newErrors = {};
    switch (step) {
      case 1:
        if (!formData.entityDetails.entityId) newErrors['entityDetails.entityId'] = 'An entity must be selected';
        break;
      case 2:
        if (!formData.reportDetails.reportType) newErrors['reportDetails.reportType'] = 'Report type is required';
        if (!formData.reportDetails.reportingPeriod) newErrors['reportDetails.reportingPeriod'] = 'Reporting period is required';
        break;
      case 3:
        if (formData.reportDetails.reportType.includes('Financial') || formData.reportDetails.reportType.includes('Prudential')) {
          if (!formData.businessMetrics.totalAssets) newErrors['businessMetrics.totalAssets'] = 'Total assets required for financial reports';
          if (!formData.businessMetrics.customerFunds) newErrors['businessMetrics.customerFunds'] = 'Customer funds required';
        }
        break;
      case 4:
        if (!formData.techAttestation.attestation) newErrors['techAttestation.attestation'] = 'You must attest to the technology mix.';
        break;
      case 6:
        if (!formData.files.primaryReport) newErrors['files.primaryReport'] = 'Primary report file is required';
        if (formData.reportDetails.reportType.includes('Financial') && !formData.files.auditedFinancials) {
          newErrors['files.auditedFinancials'] = 'Audited financials required for financial reports';
        }
        break;
      case 7:
        Object.keys(formData.certifications).forEach(cert => {
          if (!formData.certifications[cert]) {
            newErrors[`certifications.${cert}`] = 'All certifications must be checked';
          }
        });
        break;
      default:
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 7));
    }
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(7)) return;
    setIsSubmitting(true);
    try {
        await createComplianceSubmission(formData);
        alert('Report submitted successfully! Submission ID: RPT-2025-' + Math.random().toString(36).substr(2, 9).toUpperCase());
        onBack();
    } catch (error) {
        console.error("Submission failed:", error);
        setErrors(prev => ({ ...prev, submission: error.message || "An unexpected error occurred."}));
    } finally {
        setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'Entity Details', icon: BuildingIcon },
    { number: 2, title: 'Report Information', icon: FileTextIcon },
    { number: 3, title: 'Business Metrics', icon: DollarSignIcon },
    { number: 4, title: 'Technology', icon: CpuIcon },
    { number: 5, title: 'Compliance Matters', icon: ShieldIcon },
    { number: 6, title: 'File Upload', icon: UploadIcon },
    { number: 7, title: 'Certification', icon: UserCheckIcon }
  ];

  const renderStepIndicator = () => (
    <div className="mb-8 hidden md:block">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          return (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center text-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                  isCompleted ? 'bg-green-500 border-green-500 text-white' :
                  isActive ? 'bg-blue-500 border-blue-500 text-white' :
                  'bg-gray-100 border-gray-300 text-gray-500'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <p className={`text-xs font-medium mt-2 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-4 ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );

  const renderEntityDetails = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Entity Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField 
          id="entityId" 
          label="Select Your Entity *" 
          value={formData.entityDetails.entityId} 
          onChange={(e) => handleEntitySelection(e.target.value)} 
          error={errors['entityDetails.entityId']}
        >
            <option value="">-- Select Your Licensed Entity --</option>
            {licensedEntities.map(entity => (
                <option key={entity.entityId} value={entity.entityId}>{entity.companyName}</option>
            ))}
        </SelectField>
        <InputField id="companyName" label="Company Name" value={formData.entityDetails.companyName} readOnly />
        <InputField id="licenseNumber" label="License Number" value={formData.entityDetails.licenseNumber} readOnly />
        <InputField id="reportingOfficer" label="Reporting Officer" value={formData.entityDetails.reportingOfficer} readOnly />
        <InputField id="officerEmail" label="Officer Email" type="email" value={formData.entityDetails.officerEmail} readOnly />
        <InputField id="officerPhone" label="Officer Phone" type="tel" value={formData.entityDetails.officerPhone} readOnly />
      </div>
    </div>
  );

  const renderReportDetails = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Report Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField 
          id="reportType" 
          label="Report Type *" 
          value={formData.reportDetails.reportType} 
          onChange={(e) => handleInputChange('reportDetails', 'reportType', e.target.value)} 
          error={errors['reportDetails.reportType']}
        >
          <option value="">Select report type</option>
          {reportTypes.map(type => <option key={type} value={type}>{type}</option>)}
        </SelectField>
        <InputField 
          id="reportingPeriod" 
          label="Reporting Period *" 
          value={formData.reportDetails.reportingPeriod} 
          onChange={(e) => handleInputChange('reportDetails', 'reportingPeriod', e.target.value)} 
          error={errors['reportDetails.reportingPeriod']} 
          placeholder="e.g., Q4 2024, FY 2024" 
        />
        <InputField 
          id="submissionDeadline" 
          label="Submission Deadline" 
          type="date" 
          value={formData.reportDetails.submissionDeadline} 
          onChange={(e) => handleInputChange('reportDetails', 'submissionDeadline', e.target.value)} 
        />
        <SelectField 
          id="reportingFrequency" 
          label="Reporting Frequency" 
          value={formData.reportDetails.reportingFrequency} 
          onChange={(e) => handleInputChange('reportDetails', 'reportingFrequency', e.target.value)}
        >
          <option value="">Select frequency</option>
          <option value="Monthly">Monthly</option>
          <option value="Quarterly">Quarterly</option>
          <option value="Semi-Annual">Semi-Annual</option>
          <option value="Annual">Annual</option>
          <option value="Ad-hoc">Ad-hoc</option>
        </SelectField>
      </div>
    </div>
  );

  const renderBusinessMetrics = () => (
    <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Key Business Metrics</h3>
        <div className="p-4 border bg-gray-50 rounded-lg">
            <label htmlFor="metrics-file" className="block text-sm font-medium text-gray-700 mb-1">Autofill from Financial Statement</label>
            <div className="flex items-center space-x-2">
                <input type="file" id="metrics-file" onChange={(e) => setMetricsFile(e.target.files[0])} accept=".pdf,.csv"
                    className="flex-grow w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-white file:text-blue-700 hover:file:bg-blue-50 border border-gray-300 rounded-md" />
                <button type="button" onClick={handleAutofillMetrics} disabled={!metricsFile || isAutofilling}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center">
                    {isAutofilling ? (
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : 'Autofill'}
                </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Upload a PDF or CSV to automatically populate the fields below.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <InputField 
              id="totalAssets" 
              label="Total Assets (USD)" 
              type="number" 
              value={formData.businessMetrics.totalAssets} 
              onChange={(e) => handleInputChange('businessMetrics', 'totalAssets', e.target.value)} 
              error={errors['businessMetrics.totalAssets']} 
              placeholder="0.00" 
            />
            <InputField 
              id="totalLiabilities" 
              label="Total Liabilities (USD)" 
              type="number" 
              value={formData.businessMetrics.totalLiabilities} 
              onChange={(e) => handleInputChange('businessMetrics', 'totalLiabilities', e.target.value)} 
              placeholder="0.00" 
            />
            <InputField 
              id="customerFunds" 
              label="Customer Funds (USD)" 
              type="number" 
              value={formData.businessMetrics.customerFunds} 
              onChange={(e) => handleInputChange('businessMetrics', 'customerFunds', e.target.value)} 
              error={errors['businessMetrics.customerFunds']} 
              placeholder="0.00" 
            />
            <InputField 
              id="activeCustomers" 
              label="Active Customers" 
              type="number" 
              value={formData.businessMetrics.activeCustomers} 
              onChange={(e) => handleInputChange('businessMetrics', 'activeCustomers', e.target.value)} 
              placeholder="0" 
            />
        </div>
    </div>
  );

  const renderTechAttestation = () => (
    <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Technology Mix Attestation</h3>
        <p className="text-sm text-gray-600">Disclose the primary technologies used and attest to the percentage of local content/development for each component.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4 p-4 border rounded-md bg-gray-50/50">
            <InputField 
              id="cloudProvider" 
              label="Cloud Provider" 
              value={formData.techAttestation.cloudProvider} 
              onChange={(e) => handleInputChange('techAttestation', 'cloudProvider', e.target.value)} 
              placeholder="e.g., AWS, Azure, GCP" 
            />
            <InputField 
              id="cloudLocalContent" 
              label="Local Content %" 
              type="number" 
              min="0" 
              max="100" 
              value={formData.techAttestation.cloudLocalContent} 
              onChange={(e) => handleInputChange('techAttestation', 'cloudLocalContent', e.target.value)} 
              placeholder="e.g., 80" 
            />
            <InputField 
              id="database" 
              label="Primary Database" 
              value={formData.techAttestation.database} 
              onChange={(e) => handleInputChange('techAttestation', 'database', e.target.value)} 
              placeholder="e.g., PostgreSQL, MongoDB" 
            />
            <InputField 
              id="dbLocalContent" 
              label="Local Content %" 
              type="number" 
              min="0" 
              max="100" 
              value={formData.techAttestation.dbLocalContent} 
              onChange={(e) => handleInputChange('techAttestation', 'dbLocalContent', e.target.value)} 
              placeholder="e.g., 90" 
            />
            <InputField 
              id="backendLanguage" 
              label="Backend Language/Framework" 
              value={formData.techAttestation.backendLanguage} 
              onChange={(e) => handleInputChange('techAttestation', 'backendLanguage', e.target.value)} 
              placeholder="e.g., Node.js, Python/Django" 
            />
            <InputField 
              id="backendLocalContent" 
              label="Local Content %" 
              type="number" 
              min="0" 
              max="100" 
              value={formData.techAttestation.backendLocalContent} 
              onChange={(e) => handleInputChange('techAttestation', 'backendLocalContent', e.target.value)} 
              placeholder="e.g., 75" 
            />
        </div>
        <div className="mt-4">
           <CheckboxField 
             id="techAttestation" 
             label="I certify that the technology mix adheres to the 80% local content requirement where applicable." 
             checked={formData.techAttestation.attestation} 
             onChange={(e) => handleInputChange('techAttestation', 'attestation', e.target.checked)} 
             error={errors['techAttestation.attestation']} 
           />
        </div>
    </div>
  );

  const renderComplianceMatters = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Compliance and Risk Matters</h3>
      <p className="text-sm text-gray-600">Disclose any significant events or concerns during the reporting period:</p>
      <div className="space-y-4">
        {[
          { key: 'materialChanges', label: 'Material Changes to Business Operations', details: 'materialChangesDetails' },
          { key: 'regulatoryBreaches', label: 'Regulatory Breaches or Violations', details: 'breachDetails' },
        ].map(item => (
          <div key={item.key} className="border rounded-lg p-4">
            <CheckboxField 
              id={item.key} 
              label={item.label} 
              checked={formData.compliance[item.key]} 
              onChange={(e) => handleInputChange('compliance', item.key, e.target.checked)} 
            />
            {formData.compliance[item.key] && (
              <textarea 
                value={formData.compliance[item.details]} 
                onChange={(e) => handleInputChange('compliance', item.details, e.target.value)} 
                className="w-full p-2 mt-2 border border-gray-300 rounded-lg text-sm" 
                rows="3" 
                placeholder="Provide detailed description..." 
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderFileUpload = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Required Documents</h3>
      <div className="space-y-4">
        <FileInput 
          id="primaryReport" 
          label="Primary Report File *" 
          onChange={(e) => handleFileChange('primaryReport', e.target.files)} 
          error={errors['files.primaryReport']} 
          file={formData.files.primaryReport} 
          accept=".pdf,.xlsx,.xls,.doc,.docx" 
        />
        {formData.reportDetails.reportType.includes('Financial') && (
          <FileInput 
            id="auditedFinancials" 
            label="Audited Financial Statements *" 
            onChange={(e) => handleFileChange('auditedFinancials', e.target.files)} 
            error={errors['files.auditedFinancials']} 
            file={formData.files.auditedFinancials} 
            accept=".pdf" 
          />
        )}
        <FileInput 
          id="managementLetter" 
          label="Management Letter (if applicable)" 
          onChange={(e) => handleFileChange('managementLetter', e.target.files)} 
          file={formData.files.managementLetter} 
          accept=".pdf" 
        />
        <FileInput 
          id="supportingDocuments" 
          label="Supporting Documents" 
          multiple 
          onChange={(e) => handleFileChange('supportingDocuments', e.target.files)} 
          file={formData.files.supportingDocuments.length > 0 ? {name: `${formData.files.supportingDocuments.length} file(s) selected`} : null} 
        />
      </div>
    </div>
  );

  const renderCertification = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Certification and Attestation</h3>
      <p className="text-sm text-gray-600">As the authorized representative, I certify the following:</p>
      <div className="space-y-4">
        {[
          { key: 'dataAccuracy', label: 'The information provided in this report is true, complete, and accurate to the best of my knowledge' },
          { key: 'materialCompliance', label: 'All material compliance obligations have been disclosed' },
          { key: 'timelyReporting', label: 'This report is being submitted within the required timeframe' },
          { key: 'authorizedSubmission', label: 'I am authorized to submit this report on behalf of the entity' }
        ].map(cert => (
          <CheckboxField 
            key={cert.key} 
            id={cert.key} 
            label={cert.label} 
            checked={formData.certifications[cert.key]} 
            onChange={(e) => handleInputChange('certifications', cert.key, e.target.checked)} 
            error={errors[`certifications.${cert.key}`]} 
          />
        ))}
      </div>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
        <div className="flex items-start">
          <AlertCircleIcon className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-yellow-800">Important Notice</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Providing false or misleading information may result in regulatory penalties, license suspension, or other enforcement actions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderEntityDetails();
      case 2: return renderReportDetails();
      case 3: return renderBusinessMetrics();
      case 4: return renderTechAttestation();
      case 5: return renderComplianceMatters();
      case 6: return renderFileUpload();
      case 7: return renderCertification();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
        <header style={{ backgroundColor: '#1C2024' }} className="shadow-md">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <EmtechLogo className="h-20 w-auto" />
                    <h1 className="text-2xl font-semibold text-white">Report Submission Portal</h1>
                </div>
                <button onClick={onBack} className="text-sm font-medium text-gray-300 hover:text-white">
                    Exit Submission
                </button>
            </div>
        </header>

        <main className="py-10">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                    {errors.pageLoad && <div className="p-3 mb-4 text-red-700 bg-red-100 rounded-md shadow">{errors.pageLoad}</div>}
                    {renderStepIndicator()}
                    <div className="mt-8">
                        <form onSubmit={handleSubmit}>
                            {renderCurrentStep()}
                            <div className="flex justify-between mt-8 pt-6 border-t">
                                <button type="button" onClick={prevStep} disabled={currentStep === 1 || isSubmitting}
                                    className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                                    Previous
                                </button>
                                {currentStep < 7 ? (
                                    <button type="button" onClick={nextStep}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                                        Next
                                    </button>
                                ) : (
                                    <button type="submit" disabled={isSubmitting}
                                        className="px-6 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                                        {isSubmitting ? 'Submitting...' : 'Submit Report'}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    </div>
  );
};

export default ReportSubmissionPage;