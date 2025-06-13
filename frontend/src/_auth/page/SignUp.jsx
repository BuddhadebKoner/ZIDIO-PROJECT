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
      const result = await signUp.create({
        firstName: formData.firstName,
        lastName: formData.lastName,
        emailAddress: formData.email,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

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
      const result = await signUp.attemptEmailAddressVerification({
        code: otp
      });

      if (result.status === "complete") {
        navigate('/');
      } else {
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
    <div className="text-text w-full mx-auto p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6 text-text">Create Account</h2>
      <p className='text-xs sm:text-sm font-normal text-center mb-6 sm:mb-8 text-text-muted px-2'>
        {isOtpSent
          ? "Please enter the verification code sent to your email"
          : "Please enter your details to create an account"}
      </p>

      {errorMessage && (
        <div className="mb-4 p-3 bg-error/20 border border-error/50 text-error rounded-md text-xs sm:text-sm">
          {errorMessage}
        </div>
      )}

      {!isOtpSent ? (
        <form onSubmit={handleSendOtp} className="space-y-4 sm:space-y-5">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First name"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-surface border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted text-sm sm:text-base"
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
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-surface border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted text-sm sm:text-base"
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
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-surface border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted text-sm sm:text-base"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full disabled:opacity-70 py-2.5 sm:py-3 text-sm sm:text-base"
          >
            {isLoading ? "Sending code..." : "Continue with Email"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4 sm:space-y-5">
          <div className="relative">
            <input
              type="text"
              id="otp"
              name="otp"
              value={otp}
              onChange={handleOtpChange}
              placeholder="Verification code"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-surface border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted text-sm sm:text-base"
              required
            />
          </div>
          <div className="flex flex-col space-y-3">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-70 py-2.5 sm:py-3 text-sm sm:text-base"
            >
              {isLoading ? "Verifying..." : "Create Account"}
            </button>
            <button
              type="button"
              onClick={() => setIsOtpSent(false)}
              className="text-xs sm:text-sm text-primary-400 hover:text-primary-300 py-2"
            >
              Edit your information
            </button>
          </div>
        </form>
      )}

      <div className="flex items-center my-4 sm:my-6">
        <div className="flex-grow h-px bg-gray-700"></div>
        <span className="px-3 sm:px-4 text-xs sm:text-sm text-text-muted font-medium">OR</span>
        <div className="flex-grow h-px bg-gray-700"></div>
      </div>

      <button
        onClick={handleGoogleSignUp}
        type="button"
        className="w-full flex items-center justify-center gap-2 sm:gap-3 py-2.5 sm:py-3 px-4 bg-surface border border-gray-700 text-text rounded-md hover:opacity-90 transition-opacity text-sm sm:text-base"
      >
        <img src="./google.svg" alt="Google" className="w-4 h-4 sm:w-5 sm:h-5" />
        Continue with Google
      </button>

      <p className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-text-muted">
        Already have an account? {' '}
        <Link to="/sign-in" className="text-primary-400 hover:text-primary-300 font-medium">
          Log In
        </Link>
      </p>
    </div>
  );
};

export default SignUp;