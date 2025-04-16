import { Search, UserRound } from "lucide-react";
import DesktopNavLinks from "../shared/DesktopNavLinks";
import Logo from "../shared/Logo";
import MobileMenuButton from "../shared/MobileMenuButton";
import ProfileDropdown from "../shared/ProfileDropdown";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import CartIcon from "../shared/CartIcon";
import ElementLoader from "../loaders/ElementLoader";

const Navbar = ({ toggleSidebar }) => {
   const [scrolled, setScrolled] = useState(false);
   const { isAuthenticated, cartItemsCount, isLoading, error } = useAuth();

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

   return (
      <section className="z-40 relative">
         <nav className={`${scrolled ? 'fixed' : 'absolute'} top-0 left-0 right-0 z-50 flex justify-between items-center px-4 md:px-8 lg:px-30 py-4 text-white 
                       transition-all duration-300 ease-in-out 
                       ${scrolled
               ? 'glass-morphism py-3 shadow-lg'
               : 'bg-gradient-to-b from-black to-transparent py-4 group'}`}>

            {/* Add a pseudo-element overlay for hover effect when not scrolled */}
            {!scrolled && 
               <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 glass-morphism pointer-events-none z-0"></div>
            }

            {/* Hamburger for mobile */}
            <MobileMenuButton toggleSidebar={toggleSidebar} />

            {/* Left menu - hidden on mobile */}
            <DesktopNavLinks />

            {/* middle logo */}
            {!scrolled && <Logo />}

            {/* Right icons */}
            <div className="flex items-center gap-5 relative z-10">
               <Link
                  to={"/search/"}
                  className="hidden sm:block text-white hover:text-primary-300 transition-all duration-300 hover:scale-110 cursor-pointer">
                  <Search size={20} />
               </Link>

               <CartIcon itemCount={cartItemsCount} />

               {isLoading ? (
                  <ElementLoader />
               ) : isAuthenticated ? (
                  <ProfileDropdown />
               ) : (
                  <Link to="/sign-in" className="hidden sm:block text-white hover:text-primary-300 transition-all duration-300 hover:scale-110 cursor-pointer">
                     <UserRound size={20} />
                  </Link>
               )}
            </div>
         </nav>
      </section>
   )
}

export default Navbar