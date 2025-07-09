import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import { Outlet } from 'react-router-dom';

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-collapse on mobile
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header with integrated dialer */}
      <Header collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Mobile Overlay */}
      {isMobile && !collapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* Layout Container */}
      <div className="flex">
        {/* Desktop: Fixed Navbar, Mobile: Absolute Navbar */}
        <div className={`
          ${isMobile ? 'fixed' : 'fixed'} 
          ${isMobile ? 'top-16 left-0 bottom-0' : 'top-16 left-0 bottom-0'}
          ${isMobile && collapsed ? '-translate-x-full' : 'translate-x-0'}
          transition-transform duration-300 ease-in-out z-40
        `}>
          <Navbar collapsed={collapsed} setCollapsed={setCollapsed} />
        </div>

        {/* Main Content */}
        <main className={`
          flex-1 transition-all duration-300 relative
          ${isMobile ? 'ml-0' : collapsed ? 'ml-16' : 'ml-64'}
          pt-20 sm:pt-24 lg:pt-20
          p-4 lg:p-6
        `}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;