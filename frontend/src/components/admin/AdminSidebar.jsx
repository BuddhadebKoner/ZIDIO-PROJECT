import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  LayoutGrid,
  ListOrdered,
  Tag,
  Settings,
  ShoppingBag,
  Users,
  MessageSquare,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAvatarUrl } from '../../utils/constant';

const AdminSidebar = () => {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(true);

  // Close sidebar by default on mobile screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Navigation items configuration for cleaner code
  const navItems = [
    {
      category: null,
      links: [
        { to: "/admin", icon: <LayoutDashboard size={20} />, text: "Dashboard", exact: true }
      ]
    },
    {
      category: "Catalog",
      links: [
        { to: "/admin/products", icon: <Package size={20} />, text: "Products" },
        { to: "/admin/collection", icon: <LayoutGrid size={20} />, text: "Collections" },
        { to: "/admin/category", icon: <ListOrdered size={20} />, text: "Categories" },
        { to: "/admin/offer", icon: <Tag size={20} />, text: "Offers" }
      ]
    },
    {
      category: "Sales",
      links: [
        { to: "/admin/orders", icon: <ShoppingBag size={20} />, text: "Orders" },
        { to: "/admin/customers", icon: <Users size={20} />, text: "Customers" }
      ]
    },
    {
      category: "System",
      links: [
        { to: "/admin/settings", icon: <Settings size={20} />, text: "Settings" },
        { to: "/admin/reviews", icon: <MessageSquare size={20} />, text: "Feedback" }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Toggle Button - Fixed position outside the sidebar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 rounded-lg shadow-lg"
        aria-label="Toggle Sidebar"
      >
        {isOpen ? null : <Menu size={20} />}
      </button>

      {/* Overlay for mobile when sidebar is open */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`w-64 h-screen glass-morphism fixed left-0 top-0 shadow-lg overflow-y-auto transition-transform duration-300 ease-in-out z-40 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-2 border-b border-gray-800">
          <Link to="/" className="flex items-center">
            <img
              src="/logo.png"
              className='w-10 h-10'
              alt="logo" />
            <p className='text-xl font-bold text-white'>
              Home
            </p>
          </Link>

          {/* Close button - only visible on mobile within the sidebar */}
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden text-white"
            aria-label="Close Sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="py-4">
          {navItems.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {section.category && (
                <div className="mt-6 mb-2 px-4">
                  <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">{section.category}</h3>
                </div>
              )}

              <ul className="space-y-1 px-3">
                {section.links.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <NavLink
                      to={item.to}
                      end={item.exact}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-primary-900 text-text' : 'text-text-muted hover:bg-primary-950 hover:text-text'
                        }`
                      }
                    >
                      {item.icon}
                      <span>{item.text}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Admin Profile Section */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-800 flex items-center justify-center overflow-hidden">
                {currentUser?.avatar ? (
                  <img
                    src={getAvatarUrl(currentUser.avatar) || '/default-avatar.png'}
                    className='w-10 h-10 object-cover'
                    alt={currentUser.fullName || 'Admin User'}
                  />
                ) : (
                  <span className="text-white font-medium">
                    {currentUser?.fullName?.charAt(0) || 'A'}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-text">{currentUser?.fullName || 'Admin User'}</p>
                <p className="text-xs text-text-muted">{currentUser?.role || ''}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;