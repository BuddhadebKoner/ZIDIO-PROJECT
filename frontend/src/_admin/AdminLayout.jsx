import { Outlet, Navigate } from 'react-router-dom'
import AdminSidebar from '../components/admin/AdminSidebar'
import { useAuth } from '../context/AuthContext';
import { LayoutGrid, LoaderCircle } from 'lucide-react';

const AdminLayout = () => {
   const { isAuthenticated, isAdmin, isLoading } = useAuth();

   if (isLoading) {
      return (
         <div className="flex items-center justify-center min-h-screen bg-background">
            <LoaderCircle size="lg" />
         </div>
      );
   }

   if (!isAuthenticated) {
      return <Navigate to="/sign-in?redirect=/admin" replace />;
   }

   if (!isAdmin) {
      return (
         <div className="flex flex-col items-center justify-center min-h-screen bg-background text-text p-6">
            <LayoutGrid size={64} className="text-primary-700 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Unauthorized Access</h1>
            <p className="text-text-muted mb-6 text-center">You don't have permission to access the admin panel.</p>
            <a href="/" className="px-4 py-2 bg-primary-700 text-white rounded-md hover:bg-primary-800 transition-colors">
               Return to Homepage
            </a>
         </div>
      );
   }

   return (
      <div className="w-full flex min-h-screen">
         {/* Sidebar */}
         <AdminSidebar />

         {/* Main content */}
         <main className="flex-1 ml-64 p-6 z-30">
            <Outlet />
         </main>
      </div>
   );
};

export default AdminLayout;