// src/components/Layout/DevRoadmapBanner.jsx
import React from 'react'; // Removed useState because visibility is controlled by parent

const AccordionItem = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen); // Use React.useState explicitly
  return (
    <div className="border border-blue-300 rounded-lg mb-3 bg-white/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-3 font-semibold text-blue-800 text-left"
      >
        <span>{title}</span>
        <svg className={`w-5 h-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>
      {isOpen && (
        <div className="p-4 border-t border-blue-200">
          {children}
        </div>
      )}
    </div>
  );
};

const FeatureDetail = ({ feature }) => (
    <div className="mb-4 pb-4 border-b border-blue-200 last:border-b-0">
        <h5 className="font-bold text-blue-700">{feature.name}</h5>
        <dl className="mt-1 pl-2 border-l-2 border-blue-200">
            <div className="mt-1">
                <dt className="text-sm font-semibold text-gray-700">Goal:</dt>
                <dd className="text-sm text-gray-800 pl-2">{feature.goal}</dd>
            </div>
            <div className="mt-2">
                <dt className="text-sm font-semibold text-gray-700">Key Components:</dt>
                <dd className="text-sm text-gray-800 pl-2">
                    <ul className="list-disc list-inside mt-1">
                        {feature.components.map(comp => <li key={comp}>{comp}</li>)}
                    </ul>
                </dd>
            </div>
             <div className="mt-2">
                <dt className="text-sm font-semibold text-gray-700">Proposed Location:</dt>
                <dd className="text-sm text-gray-800 pl-2 font-mono bg-blue-50 rounded-sm inline-block px-1">{feature.location}</dd>
            </div>
        </dl>
    </div>
);


const DevRoadmapBanner = ({ isOpen, onClose }) => { // Accept isOpen and onClose props

  if (!isOpen) { // Only render if isOpen is true
    return null;
  }

  const trinidadFeatures = [
    {
        name: "Advanced Risk Management Module",
        goal: "Develop analytic tools for risk assessment, monitoring, and management that can generate a composite risk score from varied quantitative and qualitative data inputs.",
        components: ["Composite risk scoring engine", "Integration of structured (returns) and unstructured (reports) data", "User-modifiable risk parameters and weightings"],
        location: "Risk Assessment"
    },
    {
        name: "External Data Intake Portal & Returns Configuration",
        goal: "Establish a secure portal for regulated entities to submit the many specific regulatory returns listed in the RFP and allow admins to configure these returns.",
        components: ["Secure login for financial institutions", "File upload interface with validation", "Admin UI to define and manage specific return templates", "Submission tracking"],
        location: "Data Management"
    },
    {
        name: "AI-Powered Unstructured Data Analysis",
        goal: "Build the capability to automatically summarize and extract useful information from unstructured documents like annual reports, financial statements, and policies to aid in supervision.",
        components: ["NLP-based text summarization", "Entity and topic extraction", "Automated checks against legislative guidelines (as a stretch goal)"],
        location: "Data & Analytics"
    },
     {
        name: "Dedicated 'Regulatory Approvals' Module",
        goal: "Handle miscellaneous approvals noted in the RFP appendix, such as mergers, new branches, and new products, which have different workflows than initial licensing.",
        components: ["Configurable workflows for different approval types", "Document management specific to each approval case", "Decision recording and tracking"],
        location: "Licensing"
    },
    {
        name: "Regulatory Sandbox Management Module",
        goal: "Create a dedicated module to manage the full lifecycle of entities participating in the regulatory sandbox, as per the RFP's list of high-level processes.",
        components: ["Sandbox application workflow", "Monitoring dashboards for sandbox entities", "Milestone tracking and reporting for sandbox tests"],
        location: "Licensing"
    },
    {
        name: "Enforcement & Market Conduct Modules",
        goal: "Build out the currently empty 'Enforcement' and 'Market Conduct' sections to manage case files, track violations, and monitor market-wide conduct.",
        components: ["Case management for enforcement actions", "Market conduct data collection and analysis tools", "Violation tracking and reporting"],
        location: "Enforcement & Market Conduct"
    },
    {
        name: "System Administration & Finance",
        goal: "Incorporate core administrative functions required by the RFP, such as receiving payments, managing communications, and providing comprehensive audit trails.",
        components: ["Integration with a payment gateway for application fees (Cost Recovery)", "A comprehensive, user-facing audit trail module", "A centralized communications module for managing mailing lists", "Configuration for system integrations (FAME/FEDM)"],
        location: "Settings / Licensing / Manage"
    }
  ];

  const bermudaFeatures = [
    {
        name: "Embedded Supervision & On-Chain Monitoring",
        goal: "Develop tools for direct, real-time oversight of DeFi protocols by connecting to blockchains, a core requirement of the Bermuda pilot.",
        components: ["Real-time collateralization ratio dashboards for stablecoins/lending", "Configuration for connecting to different blockchain nodes (RPC endpoints)", "Event listeners for specific smart contracts to track critical events"],
        location: "Macro Supervision"
    },
    {
        name: "Smart Contract & DeFi Risk Analysis",
        goal: "Create tools to analyze smart contracts and DeFi protocol risks, moving beyond traditional entity-based supervision.",
        components: ["A tool to ingest smart contract addresses and fetch their code/ABI", "Static analysis feature to check for common vulnerabilities", "Analytics for DeFi-specific risks (e.g., liquidity pool concentration)"],
        location: "Examinations"
    },
    {
        name: "Supervisory Process Analytics",
        goal: "Quantify the efficiency gains from the new Suptech tools, a specific objective of the Bermuda pilot, by tracking internal performance metrics.",
        components: ["Dashboards on workflow analytics (e.g., time per case, automation success rate)", "Reporting on supervisory actions and their outcomes", "Metrics on user activity and system performance"],
        location: "Data & Analytics"
    },
    {
        name: "Collaborative Pilot Portal",
        goal: "Establish a shared digital workspace for the BMA and pilot participants to collaborate, manage project milestones, and share findings as outlined in the RFP.",
        components: ["Secure messaging channel", "Shared document repository", "Project timeline and milestone tracker", "Findings and reporting submission area"],
        location: "A new top-level tab or within 'Document Management'"
    }
  ];

  const barbadosFeatures = [
    {
        name: "Advanced Inspection Management Module",
        goal: "Support the end-to-end workflow for both on-site and off-site inspections.",
        components: ["Workflow creation for inspection stages", "Secure portal for licensee evidence submission", "Centralized storage for working papers, findings, and reports", "Offline capabilities for examiners", "Integrated 360-degree view of each supervised entity"],
        location: "Examinations"
    },
    {
        name: "Automated Communications & Notifications",
        goal: "Automate and log all communication with financial institutions for a complete audit trail.",
        components: ["Automated email notifications for license expirations", "Automated alerts for compliance reporting deadlines", "Automated notifications for fee payments", "Integrated direct chat/messaging functionality", "Centralized storage for all communications"],
        location: "Settings"
    },
    {
        name: "Self-Service Form & Schedule Designer",
        goal: "Empower the regulator to design, update, and implement all data collection forms and schedules without vendor intervention.",
        components: ["Drag-and-drop interface for form creation", "Support for complex financial schedules and returns", "User-managed validation rules, including cross-form and cross-period checks", "Versioning and lifecycle management for all forms"],
        location: "Manage"
    },
    {
        name: "Automated Certificate Issuance",
        goal: "Automatically generate and issue official certificates upon the successful completion of an approval workflow.",
        components: ["Configurable certificate templates", "Integration with the workflow module to trigger issuance on 'Approved' status", "Digital certificate generation (e.g., PDF)", "Secure delivery mechanism to the licensee"],
        location: "Licensing"
    },
    {
        name: "Third-Party Integration Hub",
        goal: "Enable seamless integration with external data sources and services to enhance supervisory capabilities.",
        components: ["API for e-signature service integration", "Connectors for web scraping and unstructured data collection", "Native integration with data science tools (Python, R)", "API for publishing reports and data to 3rd party tools like SharePoint"],
        location: "Data Management"
    }
  ];

  return (
    <div className="relative bg-blue-100 border-b-2 border-blue-300 p-4 shadow-md">
      <button
        onClick={onClose} // Call the onClose prop to hide the banner
        className="absolute top-2 right-3 text-blue-600 hover:text-blue-800"
        aria-label="Dismiss"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>

      <h3 className="text-lg font-bold text-blue-800 mb-3">Development Roadmap: Key Features for Implementation</h3>

      <AccordionItem title="Trinidad & Tobago RFP - Core Suptech Features" defaultOpen={true}>
        {trinidadFeatures.map(feature => <FeatureDetail key={feature.name} feature={feature} />)}
      </AccordionItem>

      <AccordionItem title="Bermuda RFP - DeFi & Embedded Supervision Features">
        {bermudaFeatures.map(feature => <FeatureDetail key={feature.name} feature={feature} />)}
      </AccordionItem>

      <AccordionItem title="Barbados RFP - Additional Core & Data Features">
        {barbadosFeatures.map(feature => <FeatureDetail key={feature.name} feature={feature} />)}
      </AccordionItem>
    </div>
  );
};

export default DevRoadmapBanner;