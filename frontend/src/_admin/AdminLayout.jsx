import { Outlet, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import AdminSidebar from '../components/admin/AdminSidebar'
import { useAuth } from '../context/AuthContext';
import { LoaderCircle } from 'lucide-react';

const AdminLayout = () => {
   const { isAuthenticated, isAdmin, isLoading } = useAuth();
   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
   
   // Track sidebar state for responsive layout
   useEffect(() => {
      const handleResize = () => {
        setIsSidebarOpen(window.innerWidth >= 768);
      };
      
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
   }, []);
   
   // Function to handle sidebar toggle from child component
   const handleSidebarToggle = (isOpen) => {
      setIsSidebarOpen(isOpen);
   };

   if (isLoading) {
      return (
         <div className="flex items-center justify-center min-h-screen bg-background">
            <LoaderCircle size="lg" />
         </div>
      );
   }

   if (!isAuthenticated) {
      return <Navigate to="/sign-in" replace />;
   }

   if (!isAdmin) {
      return <Navigate to="/sign-in" replace />;
   }

   return (
      <div className="w-full flex">
         {/* Sidebar */}
         <AdminSidebar onToggle={handleSidebarToggle} />

         {/* Main content */}
         <main className={`flex-1 transition-all duration-300 ${
            isSidebarOpen ? 'md:ml-64' : 'ml-0'
         } p-6 z-30`}>
            <Outlet />
         </main>
      </div>
   );
};

export default AdminLayout;