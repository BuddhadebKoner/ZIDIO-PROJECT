import React from 'react'
import { Outlet, Link } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-950">
      {/* Main content/form section */}
      <section
        className="flex flex-1 justify-center items-center flex-col py-10 px-4 sm:px-6 md:px-8"
      >
        <Link to="/" className="mb-10 text-2xl font-bold text-primary-300 hover:text-primary-200 transition-colors">
          Logo
        </Link>
        <div className="w-full max-w-md bg-gray-900 rounded-xl shadow-xl p-8 border border-gray-800">
          <Outlet />
        </div>
      </section>

      {/* Auth sidebar/image section */}
      <div className="hidden lg:block h-screen w-1/2 bg-gray-900 relative">
        <div
          className="absolute inset-0 flex justify-center items-center">
          <div className="text-center p-8">
            <h1 className="text-4xl font-bold text-primary-300 mb-4">Welcome Back</h1>
            <p className="text-gray-300 max-w-md">
              Sign in to access your account, view your orders, and enjoy a personalized shopping experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;