import axiosInstance from "../../config/config";

export const addProduct = async (productData) => {
   try {
      const response = await axiosInstance.post('/admin/add-product', productData);

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

export const updateProduct = async (slug, productData) => {
   if (!productData || Object.keys(productData).length === 0) {
      return {
         success: false,
         message: "Nothing to change"
      }
   }
   try {
      const response = await axiosInstance.put(`/admin/update-product/${slug}`, productData, {
         headers: {
            'Content-Type': 'application/json',
         },
      });

      return {
         success: true,
         message: response.data.message || "Product updated successfully",
         product: response.data.product,
      };
   } catch (error) {
      console.error('Error updating product:', error);

      if (error.response?.data?.fieldErrors) {
         return {
            success: false,
            message: error.response.data.message || "Product validation failed",
            fieldErrors: error.response.data.fieldErrors
         };
      }

      return {
         success: false,
         message: error.response?.data?.message || "Failed to update product",
         error: error.response?.data?.error || error.message
      };
   }
}

export const updateCollection = async (slug, collectionData) => {
   if (!collectionData || Object.keys(collectionData).length === 0) {
      return {
         success: false,
         message: "Nothing to change"
      }
   }
   try {
      const response = await axiosInstance.put(`/admin/update-collection/${slug}`, collectionData, {
         headers: {
            'Content-Type': 'application/json',
         },
      });

      return {
         success: true,
         message: response.data.message || "Collection updated successfully",
         product: response.data.collection,
      };
   } catch (error) {
      console.error('Error updating collection:', error);

      if (error.response?.data?.fieldErrors) {
         return {
            success: false,
            message: error.response.data.message || "Product validation failed",
            fieldErrors: error.response.data.fieldErrors
         };
      }

      return {
         success: false,
         message: error.response?.data?.message || "Failed to update collection",
         error: error.response?.data?.error || error.message
      };
   }
}

export const updateOffer = async (slug, offerData) => {
   console.log("updateOffer", slug);
   try {
      const response = await axiosInstance.put(`/admin/update-offer/${slug}`, offerData, {
         headers: {
            'Content-Type': 'application/json',
         },
      });

      return {
         success: true,
         message: response.data.message || "Offer updated successfully",
         product: response.data.offer,
      };
   } catch (error) {
      console.error('Error updating offer:', error);

      if (error.response?.data?.fieldErrors) {
         return {
            success: false,
            message: error.response.data.message || "Product validation failed",
            fieldErrors: error.response.data.fieldErrors
         };
      }

      return {
         success: false,
         message: error.response?.data?.message || "Failed to update offer",
         error: error.response?.data?.error || error.message
      };
   }
}

export const updateHomeContent = async (homeData) => {
   try {
      const response = await axiosInstance.put('/admin/update-home', homeData, {
         headers: {
            'Content-Type': 'application/json',
         },
      });

      return {
         success: true,
         message: response.data.message || "Home content updated successfully",
         product: response.data.home,
      };
   } catch (error) {
      console.error('Error updating home content:', error);

      if (error.response?.data?.fieldErrors) {
         return {
            success: false,
            message: error.response.data.message || "Product validation failed",
            fieldErrors: error.response.data.fieldErrors
         };
      }

      return {
         success: false,
         message: error.response?.data?.message || "Failed to update home content",
         error: error.response?.data?.error || error.message
      };
   }
}

export const getHomeContent = async () => {
   try {
      const response = await axiosInstance.get('/user/home-content');

      return {
         success: true,
         message: 'Home content fetched successfully',
         data: response.data,
      };
   } catch (error) {
      console.error('Error Fetching Home Content', error);
      throw error;
   }
};

// delete image from cloudinary by public_id
export const deleteImage = async (public_id) => {
   try {
      const response = await axiosInstance.delete('/admin/delete-image', {
         data: { public_id }
      });

      return {
         success: true,
         message: response.data.message || "Image deleted successfully",
         data: response.data,
      };
   } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
   }
}

// get all inventorys
export const getInventorys = async (page = 1, limit = 10) => {
   try {
      const response = await axiosInstance.get(`/admin/get-inventory?page=${page}&limit=${limit}`);
      return response.data;
   } catch (error) {
      console.error('Error fetching inventory:', error);
      throw error;
   }
}

// get inventory by slug
export const getInventoryBySlug = async (slug) => {
   try {
      const response = await axiosInstance.get(`/admin/get-inventory/${slug}`);
      return response.data;
   } catch (error) {
      console.error('Error fetching inventory:', error);
      throw error;
   }
}

// update inventory by slug
export const updateInventory = async (slug, inventoryData) => {
   try {
      const response = await axiosInstance.put(`/admin/update-inventory/${slug}`, inventoryData);

      return {
         success: true,
         message: response.data.message || "Inventory updated successfully",
         product: response.data.inventory,
      };
   } catch (error) {
      console.error('Error updating inventory:', error);

      if (error.response?.data?.fieldErrors) {
         return {
            success: false,
            message: error.response.data.message || "Product validation failed",
            fieldErrors: error.response.data.fieldErrors
         };
      }

      return {
         success: false,
         message: error.response?.data?.message || "Failed to update inventory",
         error: error.response?.data?.error || error.message
      };
   }
}

// get ordders with complex query
export const getOrdersForAdmin = async (queryString) => {
   try {
      const response = await axiosInstance.get(`/admin/get-orders?${queryString}`);
      return response.data;
   } catch (error) {
      console.error('Error fetching orders:', error);
      return {
         success: false,
         message: "Failed to fetch orders with query",
         error: error.message || 'Unknown error occurred'
      }
   }
}