
// src/components/Sidebar/Sidebar.js
import React from 'react';
import EmtechLogo from '../Logo/EmtechLogo.jsx';
import {
  HomeIcon,
  IdentificationIcon,
  DocumentChartBarIcon, // Assuming you might reuse this or import a new one
  BellAlertIcon,
  ShieldExclamationIcon,
  BuildingLibraryIcon,
  UsersIcon,
  MagnifyingGlassIcon,
  ChartPieIcon,
  ExclamationTriangleIcon,
  FolderIcon,
  CogIcon,
  WrenchScrewdriverIcon
  // If you choose a different icon, make sure to import it here
  // e.g., PresentationChartLineIcon if you want something different for reports
} from '@heroicons/react/24/outline';

const sidebarNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
  { id: 'licensing', label: 'Licensing', icon: IdentificationIcon },
  // New "Reporting" Tab - Ensure 'id' matches the case in App.js
  { id: 'reporting', label: 'Reporting', icon: DocumentChartBarIcon }, // Or your chosen icon
  { id: 'regulatory-updates', label: 'Regulatory Updates', icon: BellAlertIcon },
  { id: 'risk-assessment', label: 'Risk Assessment', icon: ShieldExclamationIcon },
  { id: 'macro-supervision', label: 'Macro Supervision', icon: BuildingLibraryIcon },
  { id: 'market-conduct', label: 'Market Conduct', icon: UsersIcon },
  { id: 'examinations', label: 'Examinations', icon: MagnifyingGlassIcon },
  { id: 'data-analytics', label: 'Data & Analytics', icon: ChartPieIcon },
  { id: 'enforcement', label: 'Enforcement', icon: ExclamationTriangleIcon },
  { id: 'document-management', label: 'Document Management', icon: FolderIcon },
];

const Sidebar = ({ activeTab, setActiveTab }) => {
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  const currentLogoUrl = '/assets/logos/logo.png';

  return (
    <div className="w-64 bg-sidebar-bg text-sidebar-text h-screen fixed top-0 left-0 flex flex-col">
      <div className="p-0 mt-10">
        <div className="mb-2 p-4 rounded">
          <EmtechLogo logoUrl={currentLogoUrl} altText="EMTECH Logo" />
        </div>
      </div>

      <nav className="flex-grow px-2 mt-2 overflow-y-auto">
        <div className="border-b border-gray-600 pb-2 mb-2 mx-2"></div>
        {sidebarNavItems.map(item => {
          const IconComponent = item.icon;
          return (
            <div
              key={item.id}
              className={`flex items-center py-2 px-4 mx-2 my-1 cursor-pointer rounded ${
                activeTab === item.id
                  ? 'bg-sidebar-highlight-bg text-sidebar-highlight-text font-semibold'
                  : 'hover:bg-sidebar-highlight-bg hover:text-sidebar-highlight-text'
              }`}
              onClick={() => handleTabClick(item.id)}
            >
              <IconComponent className="w-[22px] h-[22px] mr-3 flex-shrink-0 text-emtech-gold" />
              <span className="truncate text-sm">{item.label}</span> {/* */}
            </div>
          );
        })}
        <div className="border-b border-gray-600 pt-2 mt-2 mx-2"></div>
      </nav>

      <div className="px-2 py-2">
         <div
            className={`flex items-center py-2 px-4 mx-2 my-1 cursor-pointer rounded ${
              activeTab === 'manage'
                ? 'bg-sidebar-highlight-bg text-sidebar-highlight-text font-semibold'
                : 'hover:bg-sidebar-highlight-bg hover:text-sidebar-highlight-text'
            }`}
            onClick={() => handleTabClick('manage')}
          >
            <WrenchScrewdriverIcon className="w-[22px] h-[22px] mr-3 flex-shrink-0 text-emtech-gold" /> {/* Updated icon size */}
            <span className="text-sm">Manage</span> {/* */}
          </div>

         <div
            className={`flex items-center py-2 px-4 mx-2 my-1 cursor-pointer rounded ${
              activeTab === 'settings'
                ? 'bg-sidebar-highlight-bg text-sidebar-highlight-text font-semibold'
                : 'hover:bg-sidebar-highlight-bg hover:text-sidebar-highlight-text'
            }`}
            onClick={() => handleTabClick('settings')}
          >
            <CogIcon className="w-[22px] h-[22px] mr-3 flex-shrink-0 text-emtech-gold" /> {/* Updated icon size */}
            <span className="text-sm">Settings</span> {/* */}
          </div>
      </div>

      <div className="p-4 text-center text-xs border-t border-gray-600">
        Powered by{' '}
        <span className="font-bold">
          E<span style={{ color: 'var(--emtech-gold)' }}>M</span>TECH
        </span>
      </div>
    </div>
  );
};

export default Sidebar;