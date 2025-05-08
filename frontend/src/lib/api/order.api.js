import axiosInstance from "../../config/config"

export const getOrders = async (page = 1, limit = 5) => {
   try {
      const response = await axiosInstance.get(`/orders/get-orders?page=${page}&limit=${limit}`);
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
export const getOrderById = async (trackId) => {
   try {
      const response = await axiosInstance.get(`/orders/get-order/${trackId}`);
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