// ProfileDropdown.jsx
import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useClerk } from '@clerk/clerk-react';
import { getAvatarUrl } from '../../utils/constant';

const ProfileDropdown = () => {
   const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
   const dropdownRef = useRef(null);
   const { currentUser, isLoading, isAuthenticated, error, isAdmin } = useAuth();
   const { signOut } = useClerk();

   // Close dropdown when clicking outside
   useEffect(() => {
      const handleClickOutside = (event) => {
         if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setProfileDropdownOpen(false);
         }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
         document.removeEventListener('mousedown', handleClickOutside);
      };
   }, []);

   // Handle sign out
   const handleSignOut = async () => {
      try {
         await signOut();
         setProfileDropdownOpen(false);
      } catch (error) {
         console.error("Sign out failed:", error);
         // Optionally show a toast notification here
      }
   };

   // Handle keyboard accessibility
   const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
         setProfileDropdownOpen(false);
      }
      if (event.key === 'Enter' || event.key === ' ') {
         setProfileDropdownOpen(!profileDropdownOpen);
      }
   };

   // List of profile menu items
   const menuItems = [
      { label: "Profile", path: "/profile" },
      ...(isAdmin ? [{ label: "Dashboard", path: "/admin" }] : []),
      { label: "Orders", path: "/profile/orders" },
      { label: "Your Cart", path: "/cart" },
   ];

   // Handle loading state
   if (isLoading) {
      return (
         <div className="hidden sm:flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-gray-700 animate-pulse"></div>
            <div className="h-4 w-4 bg-gray-700 animate-pulse"></div>
         </div>
      );
   }

   // Handle error state
   if (error) {
      return (
         <div className="hidden sm:block text-red-400 text-sm">
            Error loading profile
         </div>
      );
   }

   // Handle unauthenticated state
   if (!isAuthenticated || !currentUser) {
      return null; // Or return a login button component instead
   }

   return (
      <div className="hidden sm:block relative" ref={dropdownRef}>
         <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            onKeyDown={handleKeyDown}
            className="flex items-center gap-2 text-white hover:text-primary-300 transition-all duration-300"
            aria-haspopup="menu"
            aria-expanded={profileDropdownOpen}
            aria-label="Profile menu"
         >
            {currentUser?.avatar ? (
               <img
                  src={getAvatarUrl(currentUser.avatar || "IM")}
                  alt={currentUser.avatar || "User Avatar"} // Use name for alt text
                  className="h-6 w-6 rounded-full object-cover border border-white/20"
                  onError={(e) => {
                     e.target.onerror = null;
                     e.target.style.display = 'none';
                     e.target.nextSibling.style.display = 'flex';
                  }}
               />
            ) : (
               <div className="h-6 w-6 rounded-full bg-primary-300 flex items-center justify-center text-xs font-medium">
                  {currentUser?.fullName?.charAt(0) || "U"}
               </div>
            )}
            <ChevronDown
               size={16}
               className={`transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`}
            />
         </button>

         {/* Dropdown menu */}
         {profileDropdownOpen && (
            <ProfileMenu
               user={currentUser}
               menuItems={menuItems}
               onClose={() => setProfileDropdownOpen(false)}
               onSignOut={handleSignOut}
            />
         )}
      </div>
   );
};

// Separated Profile Menu component
const ProfileMenu = ({ user, menuItems, onClose, onSignOut }) => {
   // Use ref for focus trapping and keyboard navigation
   const menuRef = useRef(null);

   // Handle keyboard navigation
   useEffect(() => {
      const handleKeyDown = (e) => {
         if (e.key === 'Escape') {
            onClose();
         }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
   }, [onClose]);

   if (!user) return null;

   return (
      <div
         className="absolute right-0 mt-2 w-48  glass-morphism  rounded-md shadow-lg py-1 z-50"
         role="menu"
         aria-orientation="vertical"
         ref={menuRef}
         tabIndex={-1}
      >
         <div className="px-4 py-2 border-b border-white/10">
            <p className="text-white text-sm font-medium">{user.fullName || 'User'}</p>
            <p className="text-gray-400 text-xs truncate">{user.email || 'No email available'}</p>
         </div>

         {menuItems.map((item, index) => (
            <Link
               key={index}
               to={item.path}
               className="block px-4 py-2 text-sm text-white hover:bg-primary-300/20 hover:text-primary-300"
               onClick={onClose}
               role="menuitem"
            >
               {item.label}
            </Link>
         ))}

         <button
            onClick={onSignOut}
            className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300"
            role="menuitem"
         >
            Sign Out
         </button>
      </div>
   );
};

export default ProfileDropdown;