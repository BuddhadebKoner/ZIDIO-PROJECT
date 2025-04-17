import axiosInstance from "../../config/config";

export const addProduct = async (productData) => {
   try {
      // Log the product data being sent to the server (optional)
      console.log("Sending product data:", productData);

      const response = await axiosInstance.post('/admin/add-product', productData, {
         headers: {
            'Content-Type': 'application/json',
         },
      });

      // Handle successful response
      return {
         success: true,
         message: response.data.message || "Product added successfully",
         product: response.data.product,
      };
   } catch (error) {
      console.error('Error adding product:', error);

      // Check if we have a response with field-specific validation errors
      if (error.response?.data?.fieldErrors) {
         return {
            success: false,
            message: error.response.data.message || "Product validation failed",
            fieldErrors: error.response.data.fieldErrors
         };
      }

      // Generic error handling
      return {
         success: false,
         message: error.response?.data?.message || "Failed to add product",
         error: error.response?.data?.error || error.message
      };
   }
};