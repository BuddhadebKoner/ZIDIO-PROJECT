import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FullPageLoader from '../components/loaders/FullPageLoader';

const Verify = () => {
  const [searchParams] = useSearchParams();

  // Extract query parameters
  const success = searchParams.get('success');
  const orderId = searchParams.get('orderId');

  const {
    currentUser,
    isLoading,
  } = useAuth();

  useEffect(() => {
    console.log('Success:', success);
    console.log('Order ID:', orderId);
  }, [success, orderId]);

  if (isLoading) {
    return (
      <>
        <FullPageLoader />
      </>
    )
  }

  return (
    <div>
      <h2>Verification Page</h2>
      <p>Success: {success}</p>
      <p>Order ID: {orderId}</p>
    </div>
  );
};

export default Verify;