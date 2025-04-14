import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { User, ShoppingBag, MapPin, LogOut, ChevronUp, ChevronDown, Camera, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; // Make sure to import the actual auth context

const Profile = () => {
  const location = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  // Get authentication data from context
  const { currentUser, isLoading, isAuthenticated, error } = useAuth();

  // Available avatars in the public folder with names
  const avatars = [
    { path: "/garbage/avatars/BW.png", name: "BW" },
    { path: "/garbage/avatars/CA.png", name: "CA" },
    { path: "/garbage/avatars/IM.png", name: "IM" },
    { path: "/garbage/avatars/SM.png", name: "SM" }
  ];

  // Redirect if not authenticated should be handled in a route guard or here
  if (!isLoading && !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 bg-surface rounded-lg shadow-md">
          <AlertCircle className="mx-auto h-12 w-12 text-accent-500 mb-4" />
          <h3 className="text-lg font-medium mb-2">Authentication Required</h3>
          <p className="text-text-muted mb-4">Please log in to view your profile.</p>
          <NavLink 
            to="/login" 
            className="inline-block px-4 py-2 bg-primary-700 text-bg-white rounded-md hover:bg-primary-800 transition-colors"
          >
            Go to Login
          </NavLink>
        </div>
      </div>
    );
  }

  // Handle avatar selection - using proper error handling
  const handleAvatarSelect = async (avatarPath) => {
    setIsUpdating(true);
    setUpdateError(null);
    
    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.05) {
            resolve();
          } else {
            reject(new Error("Failed to update avatar"));
          }
        }, 1000);
      });
    } catch (error) {
      setUpdateError("Failed to update avatar. Please try again.");
      console.error("Avatar update error:", error);
    } finally {
      setIsUpdating(false);
      setShowAvatarSelector(false);
    }
  };

  // Render avatar (either custom or initials)
  const renderAvatar = (size = "medium") => {
    const sizeClasses = {
      small: "w-12 h-12",
      medium: "w-20 h-20",
      large: "w-24 h-24"
    };

    const textSizeClasses = {
      small: "text-lg",
      medium: "text-3xl",
      large: "text-4xl"
    };

    if (isLoading || !currentUser) {
      return (
        <div className={`${sizeClasses[size]} rounded-full bg-gray-200 flex items-center justify-center`}>
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      );
    }

    const initials = currentUser.name 
      ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
      : 'U';

    if (currentUser.avatar) {
      return (
        <div className={`${sizeClasses[size]} rounded-full relative overflow-hidden`}>
          <img
            src={currentUser.avatar}
            alt="User avatar"
            className="w-full h-full object-cover"
          />
        </div>
      );
    } else {
      return (
        <div className={`${sizeClasses[size]} rounded-full bg-primary-600 flex items-center justify-center text-bg-white relative`}>
          <span className={textSizeClasses[size]}>{initials}</span>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-fit mt-20 px-4 md:px-8 lg:px-30 py-4">
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
              {renderAvatar("small")}
              <div>
                Overview
              </div>
            </div>
          </div>

          <nav className="">
            <div className="flex flex-col space-y-2">
              {[
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
              ].map((item) => (
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
              {isLoading ? (
                <div className="flex flex-col items-center justify-center p-12">
                  <Loader2 className="w-12 h-12 animate-spin text-primary-500 mb-4" />
                  <p className="text-text-muted">Loading your profile...</p>
                </div>
              ) : error ? (
                <div className="bg-accent-100 border-l-4 border-accent-500 p-4 mb-6 rounded">
                  <div className="flex items-center">
                    <AlertCircle className="h-6 w-6 text-accent-500 mr-3" />
                    <p className="text-accent-700">
                      {error || "An error occurred while loading your profile"}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Display update error if any */}
                  {updateError && (
                    <div className="bg-accent-100 border-l-4 border-accent-500 p-4 mb-6 rounded">
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-accent-500 mr-3" />
                        <p className="text-accent-700">{updateError}</p>
                      </div>
                    </div>
                  )}
                
                  <div className="bg-surface rounded-lg shadow-sm p-6 mb-6 border border-gray-800/20">
                    <div className="flex flex-col md:flex-row md:items-center">
                      {/* Avatar with change option */}
                      <div className="relative mb-4 md:mb-0 md:mr-6">
                        {renderAvatar("medium")}
                        <button
                          onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                          className="absolute bottom-0 right-0 bg-primary-600 p-2 rounded-full text-bg-white shadow-md"
                          title="Change avatar"
                          disabled={isUpdating} 
                        >
                          {isUpdating ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Camera className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-text mb-1">{currentUser.fullName}</h2>
                        <p className="text-text-muted mb-1">{currentUser.email}</p>
                        <p className="text-text-muted">{currentUser.phone || 'No phone number'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Avatar Selector */}
                  {showAvatarSelector && (
                    <div className="bg-surface p-6 rounded-lg shadow-md border border-gray-800/20 mb-6">
                      <h3 className="font-semibold text-text mb-4">Choose Avatar</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                        {/* Option to use initials */}
                        <div
                          onClick={() => handleAvatarSelect(null)}
                          className={`cursor-pointer rounded-md p-2 flex flex-col items-center ${currentUser.avatar === null ? 'bg-primary-600/20 ring-2 ring-primary-600' : 'hover:bg-primary-600/20'}`}
                        >
                          <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-xl font-semibold text-bg-white">
                            {currentUser.name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U'}
                          </div>
                          <span className="mt-2 text-sm">Initials</span>
                        </div>

                        {/* Available avatars */}
                        {avatars.map((avatar, index) => (
                          <div
                            key={index}
                            onClick={() => handleAvatarSelect(avatar.path)}
                            className={`cursor-pointer rounded-md p-2 flex flex-col items-center ${currentUser.avatar === avatar.path ? 'bg-primary-600/20 ring-2 ring-primary-600' : 'hover:bg-primary-600/20'}`}
                          >
                            <div className="w-16 h-16 rounded-full overflow-hidden">
                              <img
                                src={avatar.path}
                                alt={`Avatar ${avatar.name}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="mt-2 text-sm">{avatar.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Order and Address summary cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-surface p-6 rounded-lg shadow-sm border border-gray-800/20">
                      <div className="flex items-center">
                        <ShoppingBag className="w-8 h-8 text-primary-400 mr-3" />
                        <div>
                          <h3 className="font-semibold text-text">Orders</h3>
                          <p className="text-xl font-bold">{currentUser.orderCount || 0}</p>
                          <p className="text-sm text-text-muted mt-1">View your order history</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-surface p-6 rounded-lg shadow-sm border border-gray-800/20">
                      <div className="flex items-center">
                        <MapPin className="w-8 h-8 text-primary-400 mr-3" />
                        <div>
                          <h3 className="font-semibold text-text">Saved Addresses</h3>
                          <p className="text-xl font-bold">{currentUser.savedAddresses || 0}</p>
                          <p className="text-sm text-text-muted mt-1">Manage your delivery addresses</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-surface p-6 rounded-lg shadow-sm border border-gray-800/20">
                    <h3 className="font-semibold text-text mb-4">Quick Actions</h3>
                    <div className="flex flex-wrap gap-3">
                      {[
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
                      ].map((item) => (
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
                </>
              )}
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