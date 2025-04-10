// MobileMenuButton.jsx
import React from 'react';
import { Menu } from 'lucide-react';

const MobileMenuButton = ({ toggleSidebar }) => {
  return (
    <div className="lg:hidden">
      <button
        onClick={toggleSidebar}
        aria-label="Open menu"
        className="text-white hover:text-primary-300 transition-all duration-300 hover:scale-110 cursor-pointer"
      >
        <Menu size={24} className="transition-transform duration-300" />
      </button>
    </div>
  );
};

export default MobileMenuButton;