import axiosInstance from "../../config/config";
import { useAuth } from '@clerk/clerk-react';

export const isAuthenticated = async () => {
   const { getToken } = useAuth()
   const token = await getToken();

   try {
      const response = await axiosInstance.post('/auth/is-authenticated', {
         headers: {
            "Authorization": `Bearer ${token}`,
         },
      });
      if (response.status === 200) {
         return {
            success: true,
            message: "User is authenticated",
            user: response.data.user,
         };
      }
      return {
         success: false,
         message: "Authentication failed",
         user: null,
      };
   } catch (error) {
      console.error('Error checking authentication:', error);
      return {
         success: false,
         message: 'Error checking authentication',
         user: null
      };
   }
};

// Upload image to Cloudinary
export const uploadImage = async (file, path) => {
   try {
      const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

      if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
         throw new Error('Missing Cloudinary configuration');
      }

      // Create a FormData instance for Cloudinary upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', `e-commerce/${path}`);

      // Direct upload to Cloudinary using fetch API
      const response = await fetch(
         `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
         {
            method: 'POST',
            body: formData,
         }
      );

      if (!response.ok) {
         throw new Error('Image upload to Cloudinary failed');
      }

      const data = await response.json();
      return {
         success: true,
         imageUrl: data.secure_url,
         imageId: data.public_id
      };
   } catch (error) {
      console.error("Cloudinary upload error:", error);
      return {
         success: false,
         message: error.message || "Failed to upload image"
      };
   }
};