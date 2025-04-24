import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AuthCallback = () => {
  const { refreshUserData, isLoading, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Refresh user data after OAuth callback
        await refreshUserData();
        
        // Redirect to home page or dashboard after successful auth
        navigate('/');
      } catch (error) {
        console.error('Error in auth callback:', error);
        navigate('/sign-in');
      }
    };

    handleCallback();
  }, [refreshUserData, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-lg mb-4">Completing authentication...</p>
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
      </div>
    </div>
  );
};

export default AuthCallback;