import axiosInstance from "../../config/config";

export const addProduct = async (productData) => {
   try {
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

export const addCollection = async (collectionData) => {
   try {
      const response = await axiosInstance.post('/admin/add-collection', collectionData, {
         headers: {
            'Content-Type': 'application/json',
         },
      });

      // Handle successful response
      return {
         success: true,
         message: response.data.message || "Collection added successfully",
         product: response.data.collection,
      };
   } catch (error) {
      console.error('Error adding collection:', error);

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
         message: error.response?.data?.message || "Failed to add collection",
         error: error.response?.data?.error || error.message
      };
   }
};

export const addOffer = async (offerData) => { 
   try {
      const response = await axiosInstance.post('/admin/add-offer', offerData, {
         headers: {
            'Content-Type': 'application/json',
         },
      });

      return {
         success: true,
         message: response.data.message || "Offer added successfully",
         product: response.data.offer,
      };
   } catch (error) {
      console.error('Error adding offer:', error);

      if (error.response?.data?.fieldErrors) {
         return {
            success: false,
            message: error.response.data.message || "Product validation failed",
            fieldErrors: error.response.data.fieldErrors
         };
      }

      return {
         success: false,
         message: error.response?.data?.message || "Failed to add offer",
         error: error.response?.data?.error || error.message
      };
   }
}