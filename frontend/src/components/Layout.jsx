import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Dynamic width with animations */}
      <aside className={`
        fixed h-full bg-white border-r border-gray-200 z-50 transform transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${sidebarCollapsed ? 'lg:w-16' : 'w-65 lg:w-65'}
      `}>
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={handleSidebarClose}
          isCollapsed={sidebarCollapsed}
          onToggle={handleSidebarToggle}
        />
      </aside>

      {/* Main content area */}
      <div className={`
        flex-1 flex flex-col bg-gray-50 transition-all duration-300 ease-in-out
        ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-65'}
      `}>
        {/* Top navigation bar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-gray-200 bg-white shadow-sm">
          <Navbar 
            onMenuClick={handleMenuClick}
            onSidebarToggle={handleSidebarToggle}
            sidebarCollapsed={sidebarCollapsed}
          />
        </header>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden bg-gray-600 bg-opacity-75 transition-opacity duration-300" 
          onClick={handleSidebarClose}
        />
      )}
    </div>
  );
};

export default Layout;
