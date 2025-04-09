import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [successfulCreation, setSuccessfulCreation] = useState(false)
  const [error, setError] = useState('')

  // Send the password reset code to the user's email
  const handleSendResetCode = (e) => {
    e.preventDefault()
    // This would connect to your actual authentication system
    console.log('Sending reset code to:', email)
    
    // For demo purposes, simulate successful code sending
    setSuccessfulCreation(true)
    setError('')
  }

  // Reset the user's password
  const handleResetPassword = (e) => {
    e.preventDefault()
    // This would connect to your actual authentication system
    console.log('Resetting password with code:', code, 'and new password')
    
    // For demo purposes, simulate successful reset
    setError('')
    // Redirect would happen here in a real implementation
  }

  return (
    <div className="text-gray-100 max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-6 text-white">Forgot Password</h2>
      <p className='text-sm font-normal text-center mb-8'>
        {!successfulCreation 
          ? "Enter your email address to receive a password reset code" 
          : "Enter the code sent to your email and your new password"
        }
      </p>
      
      <form onSubmit={!successfulCreation ? handleSendResetCode : handleResetPassword} className="space-y-5">
        {!successfulCreation ? (
          <>
            <div className="relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-200 placeholder-gray-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-gray-100 rounded-md transition-colors font-medium"
            >
              Send Reset Code
            </button>
          </>
        ) : (
          <>
            <div className="relative">
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Reset code"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-200 placeholder-gray-500"
                required
              />
            </div>

            <div className="relative">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-200 placeholder-gray-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-gray-100 rounded-md transition-colors font-medium"
            >
              Reset Password
            </button>
          </>
        )}
        
        {error && (
          <div className="p-3 bg-red-900/50 border border-red-800 rounded-md text-red-200 text-sm">
            {error}
          </div>
        )}
      </form>

      <p className="mt-6 text-center text-sm text-gray-400">
        Remember your password?{' '}
        <Link to="/sign-in" className="text-primary-400 hover:text-primary-300 font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default ForgotPassword