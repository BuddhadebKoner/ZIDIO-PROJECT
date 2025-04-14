import { Outlet, Navigate } from 'react-router-dom'
import AdminSidebar from '../components/admin/AdminSidebar'
import { useAuth } from '../context/AuthContext';
import { LoaderCircle } from 'lucide-react';

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
      return <Navigate to="/sign-in" replace />;
   }

   if (!isAdmin) {
      return <Navigate to="/sign-in" replace />;
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