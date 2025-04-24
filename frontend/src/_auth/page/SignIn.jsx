import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSignIn, useClerk } from '@clerk/clerk-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const SignIn = () => {
  const { signIn } = useSignIn();
  const { client } = useClerk();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const { refreshUserData } = useAuth();

  const [email, setEmail] = useState('');

  const handleChange = (e) => {
    setEmail(e.target.value);
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
      // Start the email OTP verification process
      const result = await signIn.create({
        strategy: "email_code",
        identifier: email
      });

      // If successful, show OTP input field
      setIsOtpSent(true);
      console.log("Email code sent", result);
    } catch (error) {
      console.error("Error sending email code:", error);
      setErrorMessage(error.errors?.[0]?.message || "Failed to send verification code, please try again.");
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
      const result = await signIn.attemptFirstFactor({
        strategy: "email_code",
        code: otp
      });

      if (result.status === "complete") {
        toast.info("Reload Required")
        // Sign-in successful, redirect
        navigate('/');
      } else {
        // Handle edge cases
        console.log("Additional verification steps required:", result);
      }
    } catch (error) {
      console.error("Error verifying code:", error);
      setErrorMessage(error.errors?.[0]?.message || "Invalid verification code, please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await client.signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/"
      });
    } catch (error) {
      console.error("Error with Google sign-in:", error);
      setErrorMessage("Failed to sign in with Google, please try again.");
    }
  };

  return (
    <div className="text-text max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-6 text-text">Log In</h2>
      <p className='text-sm font-normal text-center mb-8 text-text-muted'>
        {isOtpSent
          ? "Please enter the verification code sent to your email"
          : "Please enter your email to receive a verification code"}
      </p>

      {errorMessage && (
        <div className="mb-4 p-3 bg-error/20 border border-error/50 text-error rounded-md text-sm">
          {errorMessage}
        </div>
      )}

      {!isOtpSent ? (
        // Email input form
        <form onSubmit={handleSendOtp} className="space-y-5">
          <div className="relative">
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="Email address"
              className="w-full px-4 py-3 bg-surface border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full disabled:opacity-70"
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
              className="w-full px-4 py-3 bg-surface border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted"
              required
            />
          </div>
          <div className="flex flex-col space-y-3">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-70"
            >
              {isLoading ? "Verifying..." : "Verify Code"}
            </button>
            <button
              type="button"
              onClick={() => setIsOtpSent(false)}
              className="text-sm text-primary-400 hover:text-primary-300"
            >
              Use a different email
            </button>
          </div>
        </form>
      )}

      <div className="flex items-center my-4">
        <div className="flex-grow h-px bg-gray-700"></div>
        <span className="px-4 text-sm text-text-muted font-medium">OR</span>
        <div className="flex-grow h-px bg-gray-700"></div>
      </div>

      <button
        onClick={handleGoogleSignIn}
        type="button"
        className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-surface border border-gray-700 text-text rounded-md hover:opacity-90 transition-opacity"
      >
        <img src="./google.svg" alt="Google" className="w-5 h-5" />
        Continue with Google
      </button>

      <p className="mt-6 text-center text-sm text-text-muted">
        New User? {' '}
        <Link to="/sign-up" className="text-primary-400 hover:text-primary-300 font-medium">
          Create Account
        </Link>
      </p>
    </div>
  );
};

export default SignIn;