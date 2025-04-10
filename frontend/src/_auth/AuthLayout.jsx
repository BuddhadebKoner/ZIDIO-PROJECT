import React from 'react'
import { Outlet, Link } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="flex h-fit bg-gray-950 overflow-hidden">
      {/* Main content/form section */}
      <div className="hidden lg:block h-screen w-1/2 bg-gray-900 relative">
        <div
          className="absolute inset-0 flex justify-center items-center">
          <img
            src="https://images.unsplash.com/photo-1592513002316-e4fa19175023?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzh8fG1hcnZlbHxlbnwwfHwwfHx8MA%3D%3D"
            className='w-full h-full object-cover object-center'
            alt="" />
        </div>
      </div>
      <section
        className="w-1/2 flex justify-center items-center flex-col py-10 px-4 sm:px-6 md:px-8"
      >
        <div className='flex justify-center items-center'>
          <img
            src="./logo.png"
            className='w-10 h-10'
            alt="logo" />
          <Link to="/" className="text-2xl font-bold text-white">
            Home
          </Link>
        </div>
        <div className="w-full">
          <Outlet />
        </div>
      </section>

      {/* Auth sidebar/image section */}
    </div>
  );
};

export default AuthLayout;