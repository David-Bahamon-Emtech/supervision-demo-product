// src/components/Layout/Layout.jsx
import React from 'react';
import Sidebar from '../Sidebar/Sidebar.jsx';

const Layout = ({ activeTab, setActiveTab, children }) => {
  return (
    <div className="flex h-screen bg-theme-bg"> {/* CHANGE HERE */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-y-auto ml-64">
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;