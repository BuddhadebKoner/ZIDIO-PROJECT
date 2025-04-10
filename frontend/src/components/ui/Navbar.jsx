import { Search, UserRound } from "lucide-react";
import DesktopNavLinks from "../shared/DesktopNavLinks";
import Logo from "../shared/Logo";
import MobileMenuButton from "../shared/MobileMenuButton";
import ProfileDropdown from "../shared/ProfileDropdown";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import CartIcon from "../shared/CartIcon";

const Navbar = ({ toggleSidebar }) => {
   const [scrolled, setScrolled] = useState(false);
   const { isSignedIn } = useUser();

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
      <section className="relative">
         <nav className={`${scrolled ? 'fixed' : 'absolute'} top-0 left-0 right-0 z-50 flex justify-between items-center px-4 md:px-8 lg:px-30 py-4 text-white 
                       transition-all duration-300 ease-in-out hover:bg-black/80 cursor-pointer
                       ${scrolled
               ? 'bg-black/80 backdrop-blur-md py-3 shadow-lg'
               : 'bg-gradient-to-b from-black/40 to-transparent py-4'}`}>

            {/* Hamburger for mobile */}
            <MobileMenuButton toggleSidebar={toggleSidebar} />

            {/* Left menu - hidden on mobile */}
            <DesktopNavLinks />

            {/* middle logo */}
            {!scrolled && <Logo />}

            {/* Right icons */}
            <div className="flex items-center gap-5">
               <Link
                  to={"/search/"}
                  className="hidden sm:block text-white hover:text-primary-300 transition-all duration-300 hover:scale-110 cursor-pointer">
                  <Search size={20} />
               </Link>

               <CartIcon itemCount={0} />

               {isSignedIn ? (
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