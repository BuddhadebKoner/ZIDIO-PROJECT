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
    <>
      <header
        className='flex justify-center items-center bg-gray-900 p-3 text-gray-100 border-b border-gray-800'>
        <p className="text-sm font-normal">Use code <span className="text-primary-300 font-semibold">SAVE350</span> & get ₹350/- off on order value of ₹3000</p>
      </header>
      <div className="w-full flex flex-col min-h-fit">
        <Navbar toggleSidebar={toggleSidebar} />
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 py-0 z-30">
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default RootLayout;