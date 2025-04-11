// ProfileDropdown.jsx
import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, UserRound } from 'lucide-react';
import { useUser, useClerk } from '@clerk/clerk-react';

const ProfileDropdown = () => {
   const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
   const dropdownRef = useRef(null);
   const { user } = useUser();
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
      await signOut();
      setProfileDropdownOpen(false);
   };

   // List of profile menu items
   const menuItems = [
      { label: "Profile", path: "/profile" },
      { label: "Dashboard", path: "/dashboard" },
      { label: "Orders", path: "/profile/orders" },
      { label: "Your Cart", path: "/cart" },
   ];

   return (
      <div className="hidden sm:block relative" ref={dropdownRef}>
         <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 text-white hover:text-primary-300 transition-all duration-300"
         >
            {user.imageUrl ? (
               <img
                  src={user.imageUrl}
                  alt={user.fullName || "User"}
                  className="h-6 w-6 rounded-full object-cover border border-white/20"
               />
            ) : (
               <div className="h-6 w-6 rounded-full bg-primary-300 flex items-center justify-center text-xs font-medium">
                  {user.firstName?.charAt(0) || user.username?.charAt(0) || "U"}
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
               user={user}
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
   return (
      <div className="absolute right-0 mt-2 w-48 bg-black/90 backdrop-blur-md border border-white/10 rounded-md shadow-lg py-1 z-50">
         <div className="px-4 py-2 border-b border-white/10">
            <p className="text-white text-sm font-medium">{user.fullName || user.username}</p>
            <p className="text-gray-400 text-xs truncate">{user.primaryEmailAddress?.emailAddress}</p>
         </div>

         {menuItems.map((item, index) => (
            <Link
               key={index}
               to={item.path}
               className="block px-4 py-2 text-sm text-white hover:bg-primary-300/20 hover:text-primary-300"
               onClick={onClose}
            >
               {item.label}
            </Link>
         ))}

         <button
            onClick={onSignOut}
            className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300"
         >
            Sign Out
         </button>
      </div>
   );
};

export default ProfileDropdown;