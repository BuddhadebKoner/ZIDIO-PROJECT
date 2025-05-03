import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, Link } from 'react-router-dom';
import { User, ShoppingBag, MapPin, LogOut, ChevronUp, ChevronDown, Camera, Loader2, AlertCircle, X, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { avatars, getAvatarUrl } from '../../utils/constant';
import { useUpdateAvatar } from '../../lib/query/queriesAndMutation';
import { toast } from 'react-toastify';

const Profile = () => {
  const location = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const [uiState, setUiState] = useState({
    errors: {
      updateError: null,
      generalError: null
    },
    notifications: []
  });

  const {
    mutate: updateAvatar,
    isPending: isUpdating,
    error: updateErrorRaw
  } = useUpdateAvatar();

  const { currentUser, isLoading, isAuthenticated, error: authError } = useAuth();

  useEffect(() => {
    if (updateErrorRaw) {
      const errorMessage = updateErrorRaw.message || "Failed to update avatar. Please try again.";
      setUiState(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          updateError: errorMessage
        }
      }));

      const timer = setTimeout(() => {
        setUiState(prev => ({
          ...prev,
          errors: {
            ...prev.errors,
            updateError: null
          }
        }));
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [updateErrorRaw]);

  useEffect(() => {
    if (authError) {
      setUiState(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          generalError: authError
        }
      }));
    }
  }, [authError]);

  const dismissError = (errorType) => {
    setUiState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [errorType]: null
      }
    }));
  };

  const maskPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return 'No phone number';

    const parts = phoneNumber.split(' ');
    let countryCode = '';
    let number = phoneNumber;

    if (parts.length > 1) {
      countryCode = parts[0] + ' ';
      number = parts[1];
    }

    if (number.length <= 4) return phoneNumber;

    const firstTwoDigits = number.substring(0, 2);
    const lastTwoDigits = number.substring(number.length - 2);
    const middleLength = number.length - 4;
    const maskedMiddle = '*'.repeat(middleLength);

    return `${countryCode}${firstTwoDigits}${maskedMiddle}${lastTwoDigits}`;
  };

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

  const handleAvatarSelect = async (avatarName) => {
    dismissError('updateError');

    updateAvatar(avatarName, {
      onSuccess: () => {
        toast.success("Avatar updated successfully!")
      },
      onError: (error) => {
        toast.error(error?.message || "Failed to update avatar")
      }
    });
  };

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
          <Link
            to={"/profile"}
          >
            <img
              src={getAvatarUrl(currentUser.avatar)}
              alt="User avatar"
              className="w-full h-full object-cover"
            />
          </Link>
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
        <aside className={`${showMobileMenu ? 'block' : 'hidden'} md:block w-full md:w-72 shadow-md md:shadow-none rounded-lg p-4 glass-morphism `}>
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
                }, {
                  title: "Wishlist",
                  path: "/profile/wishlist",
                  icon: <Star className="w-5 h-5" />
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

        <main className="flex-1 px-0 md:px-6 overflow-auto mt-10 md:mt-0">
          {location.pathname === '/profile' ? (
            <div className="">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center p-12">
                  <Loader2 className="w-12 h-12 animate-spin text-primary-500 mb-4" />
                  <p className="text-text-muted">Loading your profile...</p>
                </div>
              ) : uiState.errors.generalError ? (
                <div className="bg-accent-100 border-l-4 border-accent-500 p-4 mb-6 rounded">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertCircle className="h-6 w-6 text-accent-500 mr-3" />
                      <p className="text-accent-700">
                        {uiState.errors.generalError || "An error occurred while loading your profile"}
                      </p>
                    </div>
                    <button
                      onClick={() => dismissError('generalError')}
                      className="text-accent-500 hover:text-accent-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {uiState.notifications.map(notification => (
                    <div key={notification.id} className="bg-green-100 border-l-4 border-green-500 p-4 mb-6 rounded animate-fade-in">
                      <div className="flex items-center justify-between">
                        <p className="text-green-700">{notification.message}</p>
                        <button
                          onClick={() => setUiState(prev => ({
                            ...prev,
                            notifications: prev.notifications.filter(n => n.id !== notification.id)
                          }))}
                          className="text-green-500 hover:text-green-700"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {uiState.errors.updateError && (
                    <div className="bg-accent-100 border-l-4 border-accent-500 p-4 mb-6 rounded animate-fade-in">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <AlertCircle className="h-5 w-5 text-accent-500 mr-3" />
                          <p className="text-accent-700">
                            {uiState.errors.updateError}
                          </p>
                        </div>
                        <button
                          onClick={() => dismissError('updateError')}
                          className="text-accent-500 hover:text-accent-700"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* User profile information */}
                  <div className="bg-surface p-6 rounded-lg shadow-sm border border-gray-800/20 mb-6 glass-morphism">
                    <div className="flex flex-col md:flex-row md:items-center">
                      <div className="relative mb-4 md:mb-0 md:mr-6">
                        {renderAvatar("medium")}
                        <button
                          className="absolute bottom-0 right-0 bg-primary-600 p-2 rounded-full text-bg-white shadow-md"
                          title="Change avatar"
                          disabled={isUpdating || isLoading}
                        >
                          {isUpdating || isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Camera className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-text mb-1">{currentUser.fullName}</h2>
                        <p className="text-text-muted mb-1">{currentUser.email}</p>
                        <p className="text-text-muted">{maskPhoneNumber(currentUser.phone)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Avatar selection */}
                  <div className="bg-surface p-6 rounded-lg shadow-md border border-gray-800/20 mb-6 glass-morphism">
                    <h3 className="font-semibold text-text mb-4">Choose Avatar</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {avatars.map((avatar) => (
                        <div
                          key={avatar.id}
                          onClick={() => handleAvatarSelect(avatar.name)}
                          className={`cursor-pointer rounded-md p-2 flex flex-col items-center ${currentUser.avatar === avatar.name
                            ? 'bg-primary-600/20 ring-2 ring-primary-600'
                            : 'hover:bg-primary-600/20'
                            } ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                          <div className="w-16 h-16 rounded-full overflow-hidden">
                            <img
                              src={avatar.url}
                              alt={`Avatar ${avatar.name}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="mt-2 text-sm">{avatar.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stats cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-surface p-6 rounded-lg shadow-sm border border-gray-800/20 glass-morphism">
                      <div className="flex items-center">
                        <ShoppingBag className="w-8 h-8 text-primary-400 mr-3" />
                        <div>
                          <h3 className="font-semibold text-text">Orders</h3>
                          <p className="text-xl font-bold">{currentUser.orderCount || 0}</p>
                          <p className="text-sm text-text-muted mt-1">View your order history</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-surface p-6 rounded-lg shadow-sm border border-gray-800/20 glass-morphism">
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

                  {/* Quick actions */}
                  <div className="bg-surface p-6 rounded-lg shadow-sm border border-gray-800/20 glass-morphism">
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