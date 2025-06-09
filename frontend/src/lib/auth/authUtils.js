// Authentication utilities for API calls
import { useAuth } from '@clerk/clerk-react';
import axiosInstance from '../../config/config';

// Create authenticated axios request
export const createAuthenticatedRequest = async (getToken) => {
  const token = await getToken();
  
  return {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };
};

// Helper function to make authenticated API calls
export const makeAuthenticatedRequest = async (config, getToken) => {
  try {
    const token = await getToken();
    
    const requestConfig = {
      ...config,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };

    return await axiosInstance(requestConfig);
  } catch (error) {
    console.error('Authenticated request failed:', error);
    throw error;
  }
};

// Custom hook for authenticated requests
export const useAuthenticatedAPI = () => {
  const { getToken } = useAuth();

  const makeRequest = async (config) => {
    return makeAuthenticatedRequest(config, getToken);
  };

  const createHeaders = async () => {
    return createAuthenticatedRequest(getToken);
  };

  return { makeRequest, createHeaders, getToken };
};
