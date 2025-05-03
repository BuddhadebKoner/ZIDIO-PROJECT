import axiosInstance from "../../config/config";

export const getUpdateAvatar = async (avatar) => {
   try {
      const response = await axiosInstance.patch('/user/update-avatar',
         { avatar },
         {
            headers: {
               'Content-Type': 'application/json',
            },
         }
      );

      if (response.status === 200) {
         return {
            success: true,
            message: 'Avatar updated successfully',
            user: response.data.user,
         };
      }

      return {
         success: false,
         message: 'Failed to update avatar',
         user: null,
      }
   } catch (error) {
      console.error('Error Updating Avatar', error);
      return {
         success: false,
         message: 'Error Updating Avatar',
         user: null
      };
   }
};

export const getUpdateUser = async (updateProfile) => {
   try {
      const response = await axiosInstance.patch('/user/update-profile',
         { ...updateProfile },
         {
            headers: {
               'Content-Type': 'application/json',
            },
         }
      );

      return {
         success: true,
         message: 'User updated successfully',
      };
   } catch (error) {
      console.error('Error Updating User', error);

      if (error.response && error.response.status === 429) {
         throw {
            response: {
               data: {
                  message: error.response.data.message || 'Too many requests. Please try again later.'
               }
            }
         };
      }

      // For other errors, throw a generic error
      throw {
         response: {
            data: {
               message: error.response?.data?.message || 'Failed to update user'
            }
         }
      };
   }
};

// add address
export const getAddAddress = async (address) => {
   try {
      const response = await axiosInstance.post('/user/add-address',
         { ...address },
         {
            headers: {
               'Content-Type': 'application/json',
            },
         }
      );

      console.log('Address Added', response);

      return {
         success: true,
         message: 'Address added successfully',
      };
   } catch (error) {
      console.error('Error Adding Address', error);
      throw error;
   }
};

// update address
export const getUpdateAddress = async (address) => {
   try {
      const response = await axiosInstance.patch('/user/update-address',
         { ...address },
         {
            headers: {
               'Content-Type': 'application/json',
            },
         }
      );

      console.log('Address Updated', response);

      return {
         success: true,
         message: 'Address updated successfully',
      };
   } catch (error) {
      console.error('Error Updating Address', error);
      throw error;
   }
};

export const getHomeContentDetails = async () => {
   try {
      const response = await axiosInstance.get('/user/home-content-details');

      return response.data.homeContent;
   } catch (error) {
      console.error('Error Fetching Home Content', error);
      throw error;
   }
};

// extream search
export const getExtreamSearch = async (search) => {
   try {
      const response = await axiosInstance.get('/user/extream-search', {
         params: { searchTerm: search },
      });
      return response.data.data;
   } catch (error) {
      console.error('Error Fetching Extream Search', error);
      throw error;
   }
};

// get cart products
export const getCartProducts = async () => {
   try {
      const response = await axiosInstance.get('/user/cart-products');

      if (response.data.success) {
         return response.data.cartData;
       }
      return [];
   } catch (error) {
      console.error('Error Fetching Cart Products', error);
      throw error;
   }
};