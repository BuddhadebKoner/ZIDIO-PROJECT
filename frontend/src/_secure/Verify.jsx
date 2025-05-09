import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FullPageLoader from '../components/loaders/FullPageLoader';
import { verifyPayment } from '../lib/api/order.api';
import { CheckCircle, AlertTriangle, Home, ShoppingBag } from 'lucide-react';

const Verify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [message, setMessage] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(true);
  const verificationAttempted = useRef(false);
  const redirectTimer = useRef(null);

  // Extract query parameters
  const success = searchParams.get('success');
  const orderId = searchParams.get('orderId');

  const {
    currentUser,
    isLoading,
  } = useAuth();

  // Clear any redirect timers when component unmounts
  useEffect(() => {
    return () => {
      if (redirectTimer.current) {
        clearTimeout(redirectTimer.current);
      }
    };
  }, []);

  // Validate URL parameters
  useEffect(() => {
    // Check if URL parameters are valid
    if (!orderId || (success !== 'true' && success !== 'false')) {
      setIsValidUrl(false);
      setVerificationStatus('error');
      setMessage('Invalid verification parameters. Please return to the shop and try again.');
      return;
    }

    // Ensure we only trigger verification once
    if (!verificationAttempted.current && orderId) {
      verificationAttempted.current = true;
      handleVerifyPayment();
    }
  }, [success, orderId]);

  // Auto-navigate after verification completes
  useEffect(() => {
    if (verificationStatus === 'success') {
      // Automatically redirect to orders page after 3 seconds
      redirectTimer.current = setTimeout(() => {
        navigate('/profile/orders');
      }, 3000);
    }
  }, [verificationStatus, navigate]);

  const handleVerifyPayment = async () => {
    try {
      const verifyOrder = {
        orderId: orderId,
        paymentSuccess: success === 'true', // Convert string to boolean
      };

      const response = await verifyPayment(verifyOrder);

      if (response.success) {
        setVerificationStatus('success');
        setMessage(response.message || 'Payment verified successfully! Redirecting to your orders...');
      } else {
        setVerificationStatus('error');
        setMessage(response.message || 'Failed to verify payment.');
      }

      // Don't log sensitive information in production
      if (process.env.NODE_ENV !== 'production') {
        console.log('Verification response:', response);
      }
    } catch (error) {
      setVerificationStatus('error');
      setMessage('Error processing verification.');

      // Don't log sensitive information in production
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error verifying payment:', error);
      }
    }
  }

  if (isLoading) {
    return <FullPageLoader />;
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-surface rounded-lg shadow-lg comic-border">
      <h2 className="text-2xl font-bold mb-6 text-center text-text">Payment Verification</h2>

      {!isValidUrl && (
        <div className="text-center">
          <div className="bg-red-100 text-error p-4 rounded-lg mb-4">
            <div className="flex justify-center mb-2">
              <AlertTriangle size={32} className="text-error" />
            </div>
            <p className="font-semibold">Invalid Verification Request</p>
            <p>{message}</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            <div className="flex items-center gap-2">
              <Home size={18} />
              <span>Back to Home</span>
            </div>
          </button>
        </div>
      )}

      {isValidUrl && verificationStatus === 'pending' && (
        <div className="text-center">
          <p className="mb-4 text-text">Verifying your payment...</p>
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mx-auto"></div>
        </div>
      )}

      {isValidUrl && verificationStatus === 'success' && (
        <div className="text-center">
          <div className="bg-green-100 text-success p-4 rounded-lg mb-4">
            <div className="flex justify-center mb-2">
              <CheckCircle size={32} className="text-success" />
            </div>
            <p className="font-semibold">Success!</p>
            <p>{message}</p>
          </div>
          <div className="flex justify-center items-center gap-2 text-text-muted">
            <ShoppingBag size={16} />
            <span>Redirecting to your orders...</span>
          </div>
        </div>
      )}

      {isValidUrl && verificationStatus === 'error' && (
        <div className="text-center">
          <div className="bg-red-100 text-error p-4 rounded-lg mb-4">
            <div className="flex justify-center mb-2">
              <AlertTriangle size={32} className="text-error" />
            </div>
            <p className="font-semibold">Verification Failed</p>
            <p>{message}</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            <div className="flex items-center gap-2">
              <Home size={18} />
              <span>Back to Home</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default Verify;