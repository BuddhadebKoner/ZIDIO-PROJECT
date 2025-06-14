import axiosInstance from "../../../config/config";

export const placeOrderOnlinePayment = async (orderData, token = null) => {

   if (orderData?.orderType !== "ONLINE") { 
      return {
         success: false,
         message: "Invalid order type. Expected 'ONLINE'.",
         error: "Invalid order type"
      };
   }

   try {
      const headers = {
         'Content-Type': 'application/json',
      };

      // If token is provided, add it to headers
      if (token) {
         headers.Authorization = `Bearer ${token}`;
      }

      const response = await axiosInstance.post('/orders/place-order-online', orderData, {
         headers
      });
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

// Place order with cash on delivery
export const placeOrderCashOnDelivery = async (orderData, token = null) => {
   if (orderData?.orderType !== "COD") {
      return {
         success: false,
         message: "Invalid order type. Expected 'COD'.",
         error: "Invalid order type"
      };
   }
   try {
      const headers = {
         'Content-Type': 'application/json',
      };

      // If token is provided, add it to headers
      if (token) {
         headers.Authorization = `Bearer ${token}`;
      }

      const response = await axiosInstance.post('/orders/place-order-cod', orderData, {
         headers
      });
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
// Place order with online and cash
export const placeOrderCashAndOnlineMixed = async (orderData, token = null) => {
   if (orderData?.orderType !== "COD+ONLINE") {
      return {
         success: false,
         message: "Invalid order type. Expected 'COD+ONLINE'.",
         error: "Invalid order type"
      };
   }
   try {
      const headers = {
         'Content-Type': 'application/json',
      };

      // If token is provided, add it to headers
      if (token) {
         headers.Authorization = `Bearer ${token}`;
      }

      const response = await axiosInstance.post('/orders/place-order-online-cash', orderData, {
         headers
      });
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