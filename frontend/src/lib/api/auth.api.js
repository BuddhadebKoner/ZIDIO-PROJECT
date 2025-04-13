import axiosInstance from "../../config/config";

export const isAuthenticated = async () => {
   try {
      const response = await axiosInstance.post('/auth/is-authenticated');

      if(response.status === 200) {
         return ({
            success: true,
            message: "User is authenticated",
            user: response.data.user,
         })
      }
   } catch (error) {
      console.error('Error checking authentication:', error);
      return JSON.stringify({
         success: false,
         message: 'Error checking authentication',
      });
   }
};