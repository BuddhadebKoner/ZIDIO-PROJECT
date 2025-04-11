import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { User, ShoppingBag, MapPin, LogOut, Menu, ChevronUp, ChevronDown } from 'lucide-react';

const Profile = () => {
  const location = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // User data with phone number
  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    avatar: "JD",
    orderCount: 12,
    savedAddresses: 2
  };

  // Navigation items with Lucide icons
  const navItems = [
    {
      title: "Account Details",
      path: "/profile/account-details",
      icon: <User className="w-5 h-5" />
    },
    {
      title: "Orders",
      path: "/profile/orders",
      icon: <ShoppingBag className="w-5 h-5" />
    },
    {
      title: "Address",
      path: "/profile/address",
      icon: <MapPin className="w-5 h-5" />
    }
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-fit mt-10 px-4 md:px-8 lg:px-30 py-4">
      {/* Mobile menu toggle */}
      <div className="md:hidden">
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="w-full flex items-center justify-between p-3 bg-primary-700 rounded-md text-bg-white"
        >
          <span>Profile Menu</span>
          {showMobileMenu ?
            <ChevronUp className="w-5 h-5" /> :
            <ChevronDown className="w-5 h-5" />
          }
        </button>
      </div>

      <div className="flex flex-col md:flex-row w-full">
        {/* Sidebar */}
        <aside className={`${showMobileMenu ? 'block' : 'hidden'} md:block w-full md:w-72 shadow-md md:shadow-none rounded-lg bg-surface p-4`}>
          {/* User Quick Info */} 
          <div className="pb-6 border-b border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-lg font-semibold text-bg-white">
                {user.avatar}
              </div>
              <div>
                <h3 className="font-bold text-text">{user.name}</h3>
                <p className="text-sm text-text-muted">{user.email}</p>
              </div>
            </div>
          </div>

          <nav className="">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setShowMobileMenu(false)}
                  className={({ isActive }) =>
                    `flex items-center p-3 rounded-md transition-all ${isActive
                      ? "bg-primary-700 text-bg-white font-medium shadow-sm"
                      : "hover:bg-primary-800/20 text-text-muted hover:text-text"
                    }`
                  }
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.title}</span>
                </NavLink>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-800">
              <button
                className="w-full p-3 bg-accent-500 hover:bg-accent-600 rounded-md text-bg-white transition-colors flex items-center justify-center gap-2"
                onClick={() => alert('Logout functionality would go here')}
              >
                <span>Logout</span>
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content - Outlet for nested routes */}
        <main className="flex-1 px-0 md:px-6 overflow-auto mt-10 md:mt-0">
          {location.pathname === '/profile' ? (
            <div className="">  
              <div className="bg-surface rounded-lg shadow-sm p-6 mb-6 border border-gray-800/20">
                <div className="flex flex-col md:flex-row md:items-center">
                  <div className="w-20 h-20 rounded-full bg-primary-600 flex items-center justify-center text-3xl text-bg-white mb-4 md:mb-0 md:mr-6">
                    {user.avatar}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-text mb-1">{user.name}</h2>
                    <p className="text-text-muted mb-1">{user.email}</p>
                    <p className="text-text-muted">{user.phone}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-surface p-6 rounded-lg shadow-sm border border-gray-800/20">
                  <div className="flex items-center">
                    <ShoppingBag className="w-8 h-8 text-primary-400 mr-3" />
                    <div>
                      <h3 className="font-semibold text-text">Orders</h3>
                      <p className="text-xl font-bold">{user.orderCount}</p>
                      <p className="text-sm text-text-muted mt-1">View your order history</p>
                    </div>
                  </div>
                </div>
                <div className="bg-surface p-6 rounded-lg shadow-sm border border-gray-800/20">
                  <div className="flex items-center">
                    <MapPin className="w-8 h-8 text-primary-400 mr-3" />
                    <div>
                      <h3 className="font-semibold text-text">Saved Addresses</h3>
                      <p className="text-xl font-bold">{user.savedAddresses}</p>
                      <p className="text-sm text-text-muted mt-1">Manage your delivery addresses</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface p-6 rounded-lg shadow-sm border border-gray-800/20">
                <h3 className="font-semibold text-text mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className="px-4 py-2 bg-primary-700/10 hover:bg-primary-700/20 text-text rounded-md flex items-center transition-colors"
                    >
                      <span className="mr-2">{item.icon}</span>
                      <span>{item.title}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};

export default Profile;