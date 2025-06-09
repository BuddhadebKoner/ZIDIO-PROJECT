import axiosInstance from "../../config/config"

export const getOrders = async (page = 1, limit = 5, token = null) => {
   try {
      const headers = {
         'Content-Type': 'application/json',
      };

      // If token is provided, add it to headers
      if (token) {
         headers.Authorization = `Bearer ${token}`;
      }

      const response = await axiosInstance.get(`/orders/get-orders?page=${page}&limit=${limit}`, {
         headers
      });
      if (!response.data.success) {
         return {
            success: false,
            message: response.data.message
         }
      }

      return response.data;
   } catch (error) {
      return {
         success: false,
         message: "Failed to fetch orders api",
         error: error.message
      }
   }
}

// Get order by ID
export const getOrderById = async (trackId, token = null) => {
   try {
      const headers = {
         'Content-Type': 'application/json',
      };

      // If token is provided, add it to headers
      if (token) {
         headers.Authorization = `Bearer ${token}`;
      }

      const response = await axiosInstance.get(`/orders/get-order/${trackId}`, {
         headers
      });
      if (!response.data.success) {
         return {
            success: false,
            message: response.data.message
         }
      }

      return response.data;
   } catch (error) {
      return {
         success: false,
         message: "Failed to fetch order by ID",
         error: error.message
      }
   }
}

// verify payment
export const verifyPayment = async (verifyOrder, token = null) => {
   try {
      const headers = {
         'Content-Type': 'application/json',
      };

      // If token is provided, add it to headers
      if (token) {
         headers.Authorization = `Bearer ${token}`;
      }

      const response = await axiosInstance.post(`/orders/verify-payment`, verifyOrder, {
         headers
      });
      return response.data;
   } catch (error) {
      return {
         success: false,
         message: "Failed to verify payment",
         error: error.message
      }
   }
}