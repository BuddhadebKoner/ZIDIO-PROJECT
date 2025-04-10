// Logo.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center flex-grow pointer-events-none z-50">
      <Link to={"/"} className="text-white text-2xl font-semibold hover:text-primary-300 transition-all duration-300 pointer-events-auto cursor-pointer">
        <img
          src="/logo.png"
          className='h-20 w-20 rounded-full'
          alt="Logo" />
      </Link>
    </div>
  );
};

export default Logo;