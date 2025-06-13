import React from 'react'
import { Outlet, Link } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <>
      <header className='flex justify-center items-center bg-gray-900 p-3 text-gray-100 border-b border-gray-800'>
        <p className="text-xs sm:text-sm font-normal text-center px-2">
          Use code <span className="text-primary-300 font-semibold">SAVE350</span> & get ₹350/- off on order value of ₹3000
        </p>
      </header>
      
      <div className="min-h-screen bg-gray-950 flex flex-col lg:flex-row">
        {/* Image section - hidden on mobile, visible on desktop */}
        <div className="hidden lg:flex lg:w-1/2 bg-gray-900 relative">
          <div className="absolute inset-0 flex justify-center items-center">
            <img
              src="https://images.unsplash.com/photo-1592513002316-e4fa19175023?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzh8fG1hcnZlbHxlbnwwfHwwfHx8MA%3D%3D"
              className='w-full h-full object-cover object-center'
              alt="Authentication background" 
            />
          </div>
        </div>

        {/* Main content/form section */}
        <section className="flex-1 lg:w-1/2 flex justify-center items-center flex-col relative min-h-screen lg:min-h-0 py-8 px-4 sm:px-6 md:px-8 lg:py-10">
          <Link 
            to="/" 
            className="absolute top-4 left-4 sm:top-6 sm:left-6 flex justify-center items-center hover:opacity-80 transition-opacity"
          >
            <img
              src="./logo.png"
              className='w-8 h-8 sm:w-10 sm:h-10'
              alt="logo" 
            />
            <p className='text-lg sm:text-xl font-bold text-white ml-2'>
              Home
            </p>
          </Link>
          
          <div className="w-full max-w-sm sm:max-w-md mt-12 sm:mt-16 lg:mt-0">
            <Outlet />
          </div>
        </section>
      </div>
    </>
  );
};

export default AuthLayout;