import axiosInstance from "../../../config/config";

export const placeOrder = async (orderData) => {
   try {
      const response = await axiosInstance.post('/orders/place-order', orderData);
      if (!response.data.success) {
         console.error("Error placing order:", response.message);
      }
      return response.data;
   } catch (error) {
      console.error("Error placing order:", error);
      return {
         success: false,
         message: error.response?.data?.message || "Failed to place order",
         error: error.message
      };
   }
}