import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSignUp, useClerk } from '@clerk/clerk-react';

const SignUp = () => {
  const { signUp } = useSignUp();
  const { client } = useClerk();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errorMessage) setErrorMessage('');
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
    if (errorMessage) setErrorMessage('');
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      // Create a new user with Clerk using email code strategy
      const result = await signUp.create({
        firstName: formData.firstName,
        lastName: formData.lastName,
        emailAddress: formData.email,
      });

      // Start the email verification process
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // If successful, show OTP input field
      setIsOtpSent(true);
      console.log("Email verification code sent", result);
    } catch (error) {
      console.error("Error starting sign up:", error);
      setErrorMessage(error.errors?.[0]?.message || "Failed to start sign up process, please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      // Verify the OTP code
      const result = await signUp.attemptEmailAddressVerification({
        code: otp
      });

      if (result.status === "complete") {
        // Sign-up successful
        navigate('/'); // Redirect to your dashboard or protected page
      } else {
        // Handle other verification statuses
        console.log("Additional verification steps required:", result);
      }
    } catch (error) {
      console.error("Error verifying email:", error);
      setErrorMessage(error.errors?.[0]?.message || "Invalid verification code, please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await client.signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/auth",
        redirectUrlComplete: "/"
      });
    } catch (error) {
      console.error("Error with Google sign-up:", error);
      setErrorMessage("Failed to sign up with Google, please try again.");
    }
  };

  return (
    <div className="text-gray-100 max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-6 text-white">Create Account</h2>
      <p className='text-sm font-normal text-center mb-8'>
        {isOtpSent
          ? "Please enter the verification code sent to your email"
          : "Please enter your details to create an account"}
      </p>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-800 text-red-200 rounded-md text-sm">
          {errorMessage}
        </div>
      )}

      {!isOtpSent ? (
        // User info form
        <form onSubmit={handleSendOtp} className="space-y-5">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First name"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-200 placeholder-gray-500"
                required
              />
            </div>
            <div className="relative flex-1">
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last name"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-200 placeholder-gray-500"
                required
              />
            </div>
          </div>
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
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-gray-100 rounded-md transition-colors font-medium disabled:opacity-70"
          >
            {isLoading ? "Sending code..." : "Continue with Email"}
          </button>
        </form>
      ) : (
        // OTP verification form
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <div className="relative">
            <input
              type="text"
              id="otp"
              name="otp"
              value={otp}
              onChange={handleOtpChange}
              placeholder="Verification code"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-200 placeholder-gray-500"
              required
            />
          </div>
          <div className="flex flex-col space-y-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-gray-100 rounded-md transition-colors font-medium disabled:opacity-70"
            >
              {isLoading ? "Verifying..." : "Create Account"}
            </button>
            <button
              type="button"
              onClick={() => setIsOtpSent(false)}
              className="text-sm text-primary-400 hover:text-primary-300"
            >
              Edit your information
            </button>
          </div>
        </form>
      )}

      <div className="flex items-center my-4">
        <div className="flex-grow h-px bg-gray-700"></div>
        <span className="px-4 text-sm text-gray-500 font-medium">OR</span>
        <div className="flex-grow h-px bg-gray-700"></div>
      </div>

      <button
        onClick={handleGoogleSignUp}
        type="button"
        className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700 rounded-md transition-colors"
      >
        <img src="./google.svg" alt="Google" className="w-5 h-5" />
        Continue with Google
      </button>

      <p className="mt-6 text-center text-sm text-gray-400">
        Already have an account? {' '}
        <Link to="/sign-in" className="text-primary-400 hover:text-primary-300 font-medium">
          Log In
        </Link>
      </p>
    </div>
  );
};

export default SignUp;