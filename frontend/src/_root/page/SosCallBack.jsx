import React from 'react'
import { Link } from 'react-router-dom'

const SosCallBack = () => {
   return (
      <div className='flex flex-col justify-center items-center h-screen bg-surface text-text'>    
         {/* Main content */}
         <div className="comic-border bg-surface p-8 rounded-lg max-w-md w-full animate-fadeIn">
            <div className="text-center">
               <h1 className='text-4xl font-bold mb-4 text-primary-300'>Account Required</h1>
               
               <div className="section-divider"></div>
               
               <p className='text-lg mb-4'>
                  We couldn't find an account associated with your Google login.
               </p>
               
               <p className='text-text-muted mb-6'>
                  Please register for an account first before continuing with Google authentication.
               </p>
               
               <div className='flex flex-col sm:flex-row justify-center gap-4 mt-6'>
                  <Link
                     to="/sign-up" className='w-full btn-primary inline-block text-center'>
                     Create Account
                  </Link>
               </div>
            </div>
         </div>
         
         {/* Footer text */}
         <p className="text-text-muted mt-6 text-sm">
            Need help? Contact our support team.
         </p>
      </div>
   )
}

export default SosCallBack