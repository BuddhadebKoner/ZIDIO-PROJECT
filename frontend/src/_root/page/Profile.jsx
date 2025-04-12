import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { User, ShoppingBag, MapPin, LogOut, ChevronUp, ChevronDown, Camera, Loader2 } from 'lucide-react';

const Profile = () => {
  const location = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [userData, setUserData] = useState(null);

  // Available avatars in the public folder with names
  const avatars = [
    { path: "/garbage/avatars/BW.png", name: "BW" },
    { path: "/garbage/avatars/CA.png", name: "CA" },
    { path: "/garbage/avatars/IM.png", name: "IM" },
    { path: "/garbage/avatars/SM.png", name: "SM" }
  ];

  // Simulate fetching user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock user data
      const data = {
        name: "Buddhadeb Koner",
        email: "iambuddhadebkoner@gmail.com",
        phone: "+91 1234567890",
        initials: "BK",
        orderCount: 12,
        savedAddresses: 2,
        avatar: null 
      };

      setUserData(data);
      setIsLoading(false);
    };

    fetchUserData();
  }, []);

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

  // Handle avatar selection - simulate API update
  const handleAvatarSelect = async (avatarPath) => {
    setIsUpdating(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update local state to simulate successful API response
    setUserData(prev => ({
      ...prev,
      avatar: avatarPath
    }));

    setSelectedAvatar(avatarPath);
    setIsUpdating(false);
    setShowAvatarSelector(false);
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

    if (!userData) {
      return (
        <div className={`${sizeClasses[size]} rounded-full bg-gray-200 flex items-center justify-center`}>
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      );
    }

    if (userData.avatar) {
      return (
        <div className={`${sizeClasses[size]} rounded-full relative overflow-hidden`}>
          <img
            src={userData.avatar}
            alt="User avatar"
            className="w-full h-full object-cover"
          />
        </div>
      );
    } else {
      return (
        <div className={`${sizeClasses[size]} rounded-full bg-primary-600 flex items-center justify-center text-bg-white relative`}>
          <span className={textSizeClasses[size]}>{userData.initials}</span>
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
              {isLoading ? (
                <div className="flex flex-col items-center justify-center p-12">
                  <Loader2 className="w-12 h-12 animate-spin text-primary-500 mb-4" />
                  <p className="text-text-muted">Loading your profile...</p>
                </div>
              ) : (
                <>
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
                        <h2 className="text-2xl font-bold text-text mb-1">{userData.name}</h2>
                        <p className="text-text-muted mb-1">{userData.email}</p>
                        <p className="text-text-muted">{userData.phone}</p>
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
                          className={`cursor-pointer rounded-md p-2 flex flex-col items-center ${userData.avatar === null ? 'bg-primary-600/20 ring-2 ring-primary-600' : 'hover:bg-primary-600/20'}`}
                        >
                          <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-xl font-semibold text-bg-white">
                            {userData.initials}
                          </div>
                          <span className="mt-2 text-sm">Initials</span>
                        </div>

                        {/* Available avatars */}
                        {avatars.map((avatar, index) => (
                          <div
                            key={index}
                            onClick={() => handleAvatarSelect(avatar.path)}
                            className={`cursor-pointer rounded-md p-2 flex flex-col items-center ${userData.avatar === avatar.path ? 'bg-primary-600/20 ring-2 ring-primary-600' : 'hover:bg-primary-600/20'}`}
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-surface p-6 rounded-lg shadow-sm border border-gray-800/20">
                      <div className="flex items-center">
                        <ShoppingBag className="w-8 h-8 text-primary-400 mr-3" />
                        <div>
                          <h3 className="font-semibold text-text">Orders</h3>
                          <p className="text-xl font-bold">{userData.orderCount}</p>
                          <p className="text-sm text-text-muted mt-1">View your order history</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-surface p-6 rounded-lg shadow-sm border border-gray-800/20">
                      <div className="flex items-center">
                        <MapPin className="w-8 h-8 text-primary-400 mr-3" />
                        <div>
                          <h3 className="font-semibold text-text">Saved Addresses</h3>
                          <p className="text-xl font-bold">{userData.savedAddresses}</p>
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