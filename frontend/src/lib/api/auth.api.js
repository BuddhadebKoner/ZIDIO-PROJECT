import axiosInstance from "../../config/config";

// Create a function that takes the token as a parameter
export const isAuthenticated = async (token = null) => {
   try {
      const headers = {
         'Content-Type': 'application/json',
      };
      
      // If token is provided, add it to headers
      if (token) {
         headers.Authorization = `Bearer ${token}`;
      }

      console.log('Auth API - Making request with token:', token ? 'Present' : 'Not present');

      const response = await axiosInstance.post('/auth/is-authenticated', {}, {
         headers
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
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      return {
         success: false,
         message: error.response?.data?.message || 'Error checking authentication',
         user: null
      };
   }
};

// Upload image to Cloudinary
export const uploadImage = async (file, path, progressCallback = null) => {
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

      // Use XMLHttpRequest for progress tracking if callback provided
      if (progressCallback) {
         return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            
            xhr.upload.addEventListener('progress', (e) => {
               if (e.lengthComputable) {
                  const progress = Math.round((e.loaded / e.total) * 100);
                  progressCallback(progress);
               }
            });

            xhr.addEventListener('load', () => {
               if (xhr.status === 200) {
                  try {
                     const data = JSON.parse(xhr.responseText);
                     resolve({
                        success: true,
                        imageUrl: data.secure_url,
                        imageId: data.public_id
                     });
                  } catch (parseError) {
                     reject(new Error('Failed to parse response'));
                  }
               } else {
                  reject(new Error('Image upload to Cloudinary failed'));
               }
            });

            xhr.addEventListener('error', () => {
               reject(new Error('Network error during upload'));
            });

            xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`);
            xhr.send(formData);
         });
      }

      // Direct upload to Cloudinary using fetch API (no progress tracking)
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