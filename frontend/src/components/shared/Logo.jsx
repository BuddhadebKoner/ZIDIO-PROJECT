// Logo.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center flex-grow pointer-events-none z-50">
      <Link to={"/"} className="font-semibold hover:text-primary-300 transition-all duration-300 pointer-events-auto cursor-pointer">
        <img
          src="/logo.png"
          className='h-10 w-10 sm:h-14 sm:w-14 md:h-16 md:w-16 lg:h-20 lg:w-20 rounded-full hover:scale-105 transition-transform duration-300'
          alt="Logo" 
        />
      </Link>
    </div>
  );
};

export default Logo;