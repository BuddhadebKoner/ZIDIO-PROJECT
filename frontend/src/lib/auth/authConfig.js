// Authentication configuration utilities
import { useAuth } from '@clerk/clerk-react';
import axiosInstance from '../../config/config';

// Create a custom hook for authenticated requests
export const useAuthenticatedRequest = () => {
  const { getToken } = useAuth();

  const makeAuthenticatedRequest = async (config) => {
    try {
      const token = await getToken();
      if (token) {
        if (!config.headers) {
          config.headers = {};
        }
        config.headers.Authorization = `Bearer ${token}`;
      }
      return axiosInstance(config);
    } catch (error) {
      console.error('Error making authenticated request:', error);
      throw error;
    }
  };

  return { makeAuthenticatedRequest };
};

// Function to add auth header to axios instance
export const addAuthToAxios = async (getToken) => {
  try {
    const token = await getToken();
    if (token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error setting auth header:', error);
  }
};

// Function to remove auth header from axios instance
export const removeAuthFromAxios = () => {
  delete axiosInstance.defaults.headers.common['Authorization'];
};
