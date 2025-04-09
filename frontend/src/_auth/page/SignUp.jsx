import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const SignUp = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log(formData);
  };

  return (
    <div className="text-gray-100 max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-6 text-white">Create Account</h2>
      <p className='text-sm font-normal text-center mb-8'>Create account for buying our beautiful shirts</p>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="relative">
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email address"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-200 placeholder-gray-500"
            required
          />
        </div>

        <div className="relative">
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-200 placeholder-gray-500"
            required
          />
        </div>

        <div className="relative">
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm password"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-200 placeholder-gray-500"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-gray-100 rounded-md transition-colors font-medium"
        >
          Create Account
        </button>
        
        <div className="flex items-center my-4">
          <div className="flex-grow h-px bg-gray-700"></div>
          <span className="px-4 text-sm text-gray-500 font-medium">OR</span>
          <div className="flex-grow h-px bg-gray-700"></div>
        </div>
        
        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700 rounded-md transition-colors"
        >
          <img src="./google.svg" alt="google-icon" />
          Continue with Google
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-400">
        Already have an account ? {' '}
        <Link to="/sign-in" className="text-primary-400 hover:text-primary-300 font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default SignUp;