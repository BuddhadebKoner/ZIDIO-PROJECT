import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Search, ShoppingBag, UserRound, Menu, X, ChevronDown } from 'lucide-react'
import { useUser, useClerk } from '@clerk/clerk-react'


const Navbar = ({ toggleSidebar }) => {
   const [scrolled, setScrolled] = useState(false);
   const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
   const dropdownRef = useRef(null);
   const {
      user,
      isSignedIn,
   } = useUser();
   const { signOut } = useClerk();

   // Detect scroll position to change navbar appearance
   useEffect(() => {
      const handleScroll = () => {
         const isScrolled = window.scrollY > 40;
         if (isScrolled !== scrolled) {
            setScrolled(isScrolled);
         }
      };

      window.addEventListener('scroll', handleScroll);
      return () => {
         window.removeEventListener('scroll', handleScroll);
      };
   }, [scrolled]);

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

   return (
      <>
         <section className="relative">
            {/* Navbar - now with fixed position on scroll */}
            <nav className={`${scrolled ? 'fixed' : 'absolute'} top-0 left-0 right-0 z-50 flex justify-between items-center px-4 md:px-8 lg:px-30 py-4 text-white 
                           transition-all duration-300 ease-in-out hover:bg-black/80 cursor-pointer
                           ${scrolled
                  ? 'bg-black/80 backdrop-blur-md py-3 shadow-lg'
                  : 'bg-gradient-to-b from-black/40 to-transparent py-4'}`}>
               {/* Hamburger for mobile */}
               <div className="lg:hidden">
                  <button
                     onClick={toggleSidebar}
                     aria-label="Open menu"
                     className="text-white hover:text-primary-300 transition-all duration-300 hover:scale-110 cursor-pointer"
                  >
                     <Menu size={24} className="transition-transform duration-300" />
                  </button>
               </div>

               {/* Left menu - hidden on mobile */}
               <div className="hidden lg:flex items-center gap-8">
                  <Link
                     to={"/categories"}
                     className='text-sm font-semibold text-white hover:text-primary-300 relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-primary-300 hover:after:w-full after:transition-all after:duration-300 transition-all duration-300 cursor-pointer'>
                     Shop By Category
                  </Link>
                  <Link
                     to={"/collections"}
                     className='text-sm font-semibold text-white hover:text-primary-300 relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-primary-300 hover:after:w-full after:transition-all after:duration-300 transition-all duration-300 cursor-pointer'>
                     Shop By Collection
                  </Link>
                  <Link
                     to={"/offers"}
                     className='text-sm font-semibold text-white hover:text-primary-300 relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-primary-300 hover:after:w-full after:transition-all after:duration-300 transition-all duration-300 cursor-pointer'>
                     Offers
                  </Link>
               </div>

               {/* middle logo */}
               {
                  !scrolled && (
                     < div className="absolute inset-0 flex items-center justify-center flex-grow pointer-events-none">
                        <Link to={"/"} className="text-white text-2xl font-semibold hover:text-primary-300 transition-all duration-300 pointer-events-auto cursor-pointer">
                           <img
                              src="./logo.png"
                              className='h-20 w-20 rounded-full'
                              alt="" />
                        </Link>
                     </div>
                  )
               }

               {/* Right icons */}
               <div className="flex items-center gap-5">
                  <button className="hidden sm:block text-white hover:text-primary-300 transition-all duration-300 hover:scale-110 cursor-pointer">
                     <Search size={20} />
                  </button>
                  <Link to={"/cart"} className="text-white hover:text-primary-300 transition-all duration-300 hover:scale-110 relative group cursor-pointer">
                     <ShoppingBag size={20} />
                     <span className="absolute -top-1 -right-1 bg-primary-300 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">0</span>
                  </Link>
                  {/* user profile dropdown */}
                  {isSignedIn ? (
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
                           <ChevronDown size={16} className={`transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown menu */}
                        {profileDropdownOpen && (
                           <div className="absolute right-0 mt-2 w-48 bg-black/90 backdrop-blur-md border border-white/10 rounded-md shadow-lg py-1 z-50">
                              <div className="px-4 py-2 border-b border-white/10">
                                 <p className="text-white text-sm font-medium">{user.fullName || user.username}</p>
                                 <p className="text-gray-400 text-xs truncate">{user.primaryEmailAddress?.emailAddress}</p>
                              </div>
                              <Link
                                 to="/profile"
                                 className="block px-4 py-2 text-sm text-white hover:bg-primary-300/20 hover:text-primary-300"
                                 onClick={() => setProfileDropdownOpen(false)}
                              >
                                 Profile
                              </Link>
                              <Link
                                 to="/dashboard"
                                 className="block px-4 py-2 text-sm text-white hover:bg-primary-300/20 hover:text-primary-300"
                                 onClick={() => setProfileDropdownOpen(false)}
                              >
                                 Dashboard
                              </Link>
                              <Link
                                 to="/orders"
                                 className="block px-4 py-2 text-sm text-white hover:bg-primary-300/20 hover:text-primary-300"
                                 onClick={() => setProfileDropdownOpen(false)}
                              >
                                 Orders
                              </Link>
                              <Link
                                 to="/cart"
                                 className="block px-4 py-2 text-sm text-white hover:bg-primary-300/20 hover:text-primary-300"
                                 onClick={() => setProfileDropdownOpen(false)}
                              >
                                 Your Cart
                              </Link>
                              <button
                                 onClick={handleSignOut}
                                 className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300"
                              >
                                 Sign Out
                              </button>
                           </div>
                        )}
                     </div>
                  ) : (
                     <Link to="/sign-in" className="hidden sm:block text-white hover:text-primary-300 transition-all duration-300 hover:scale-110 cursor-pointer">
                        <UserRound size={20} />
                     </Link>
                  )}
               </div>
            </nav>
         </section >
      </>
   )
}

export default Navbar