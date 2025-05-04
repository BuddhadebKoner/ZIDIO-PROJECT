// DesktopNavLinks.jsx
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import NavbarDropdown from './NavbarDropdown';

const DesktopNavLinks = () => {
   const [activeDropdown, setActiveDropdown] = useState(null);
   const timeoutRef = useRef(null);
   
   const handleMouseEnter = (dropdownType) => {
      if (timeoutRef.current) {
         clearTimeout(timeoutRef.current);
         timeoutRef.current = null;
      }
      setActiveDropdown(dropdownType);
   };

   const handleMouseLeave = () => {
      timeoutRef.current = setTimeout(() => {
         setActiveDropdown(null);
      }, 200); // Small delay to prevent dropdown from closing when mouse moves between elements
   };

   const navItems = [
      { type: 'category', label: 'Shop By Category', path: '/category' },
      { type: 'collection', label: 'Shop By Collection', path: '/collections' },
      { type: 'offers', label: 'Offers', path: '/offers', noDropdown: true },
   ];

   return (
      <div className="hidden lg:flex items-center gap-8">
         {navItems.map((item) => (
            <div
               key={item.type}
               className="relative"
               onMouseEnter={item.noDropdown ? undefined : () => handleMouseEnter(item.type)}
               onMouseLeave={item.noDropdown ? undefined : handleMouseLeave}
            >
               <Link
                  to={item.path}
                  className='text-sm font-semibold text-white hover:text-primary-300 relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-primary-300 hover:after:w-full after:transition-all after:duration-300 transition-all duration-300 cursor-pointer'
               >
                  {item.label}
               </Link>

               {!item.noDropdown && activeDropdown === item.type && (
                  <div onMouseEnter={() => handleMouseEnter(item.type)} onMouseLeave={handleMouseLeave}>
                     <NavbarDropdown type={item.type} />
                  </div>
               )}
            </div>
         ))}
      </div>
   );
};

export default DesktopNavLinks;