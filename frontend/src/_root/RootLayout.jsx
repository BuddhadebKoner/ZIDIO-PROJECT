import React, { useState } from 'react'
import Navbar from '../components/ui/Navbar'
import Sidebar from '../components/ui/Sidebar'
import { Outlet } from 'react-router-dom'

const RootLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="w-full flex flex-col min-h-screen bg-gray-950">
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="flex-1 py-8 z-30">
        <Outlet />
      </main>
    </div>
  );
};

export default RootLayout;