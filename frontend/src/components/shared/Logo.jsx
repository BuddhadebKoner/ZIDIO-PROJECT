// Logo.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center flex-grow pointer-events-none z-50">
      <Link to={"/"} className="font-semibold hover:text-primary-300 transition-all duration-300 pointer-events-auto cursor-pointer">
        <img
          src="/loadingLogo.gif"
          alt="Loading..."
          style={{ width: "150px" }}
        />
      </Link>
    </div>
  );
};

export default Logo;