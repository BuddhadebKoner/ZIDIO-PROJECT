import axiosInstance from "../../config/config";

export const addProduct = async (productData, token = null) => {
   try {
      const headers = {
         'Content-Type': 'application/json',
      };

      // If token is provided, add it to headers
      if (token) {
         headers.Authorization = `Bearer ${token}`;
      }

      const response = await axiosInstance.post('/admin/add-product', productData, {
         headers
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

export const addCollection = async (collectionData, token = null) => {
   try {
      const headers = {
         'Content-Type': 'application/json',
      };

      // If token is provided, add it to headers
      if (token) {
         headers.Authorization = `Bearer ${token}`;
      }

      const response = await axiosInstance.post('/admin/add-collection', collectionData, {
         headers
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

export const addOffer = async (offerData, token = null) => {
   try {
      const headers = {
         'Content-Type': 'application/json',
      };

      // If token is provided, add it to headers
      if (token) {
         headers.Authorization = `Bearer ${token}`;
      }

      const response = await axiosInstance.post('/admin/add-offer', offerData, {
         headers
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

export const updateProduct = async (slug, productData, token = null) => {
   if (!productData || Object.keys(productData).length === 0) {
      return {
         success: false,
         message: "Nothing to change"
      }
   }
   try {
      const headers = {
         'Content-Type': 'application/json',
      };

      // If token is provided, add it to headers
      if (token) {
         headers.Authorization = `Bearer ${token}`;
      }

      const response = await axiosInstance.put(`/admin/update-product/${slug}`, productData, {
         headers
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

export const updateCollection = async (slug, collectionData, token = null) => {
   if (!collectionData || Object.keys(collectionData).length === 0) {
      return {
         success: false,
         message: "Nothing to change"
      }
   }
   try {
      const headers = {
         'Content-Type': 'application/json',
      };

      // If token is provided, add it to headers
      if (token) {
         headers.Authorization = `Bearer ${token}`;
      }

      const response = await axiosInstance.put(`/admin/update-collection/${slug}`, collectionData, {
         headers
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

export const updateOffer = async (slug, offerData, token = null) => {
   console.log("updateOffer", slug);
   try {
      const headers = {
         'Content-Type': 'application/json',
      };

      // If token is provided, add it to headers
      if (token) {
         headers.Authorization = `Bearer ${token}`;
      }

      const response = await axiosInstance.put(`/admin/update-offer/${slug}`, offerData, {
         headers
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

export const updateHomeContent = async (homeData, token = null) => {
   try {
      const headers = {
         'Content-Type': 'application/json',
      };

      // If token is provided, add it to headers
      if (token) {
         headers.Authorization = `Bearer ${token}`;
      }

      const response = await axiosInstance.put('/admin/update-home', homeData, {
         headers
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

export const getHomeContent = async (token = null) => {
   try {
      const headers = {
         'Content-Type': 'application/json',
      };

      // If token is provided, add it to headers
      if (token) {
         headers.Authorization = `Bearer ${token}`;
      }

      const response = await axiosInstance.get('/admin/get-home', {
         headers
      });

      return {
         success: true,
         message: response.data.message || "Home content fetched successfully",
         homeContent: response.data.home,
      };
   } catch (error) {
      console.error('Error Fetching Home Content', error);
      throw error;
   }
};

// delete image from cloudinary by public_id
export const deleteImage = async (public_id, token = null) => {

   try {
      const headers = {
         'Content-Type': 'application/json',
      };

      // If token is provided, add it to headers
      if (token) {
         headers.Authorization = `Bearer ${token}`;
      }

      const response = await axiosInstance.delete('/admin/delete-image', {
         data: { public_id },
         headers
      });

      return {
         success: true,
         message: response.data.message || "Image deleted successfully",
         data: response.data,
      };
   } catch (error) {
      console.error('Error deleting image:', error);
      return {
         success: false,
         message: error.response?.data?.message || "Failed to delete image",
         error: error.response?.data?.error || error.message
      };
   }
}

// get all inventorys
export const getInventorys = async (page = 1, limit = 10, token = null) => {
   try {
      const headers = {
         'Content-Type': 'application/json',
      };

      // If token is provided, add it to headers
      if (token) {
         headers.Authorization = `Bearer ${token}`;
      }

      const response = await axiosInstance.get(`/admin/get-inventory?page=${page}&limit=${limit}`, {
         headers
      });
      return response.data;
   } catch (error) {
      console.error('Error fetching inventory:', error);
      throw error;
   }
}

// get inventory by slug
export const getInventoryBySlug = async (slug, token = null) => {
   try {
      const headers = {
         'Content-Type': 'application/json',
      };

      // If token is provided, add it to headers
      if (token) {
         headers.Authorization = `Bearer ${token}`;
      }

      const response = await axiosInstance.get(`/admin/get-inventory/${slug}`, {
         headers
      });
      return response.data;
   } catch (error) {
      console.error('Error fetching inventory:', error);
      throw error;
   }
}

// update inventory by slug
export const updateInventory = async (slug, inventoryData, token = null) => {
   try {
      const headers = {
         'Content-Type': 'application/json',
      };

      // If token is provided, add it to headers
      if (token) {
         headers.Authorization = `Bearer ${token}`;
      }

      const response = await axiosInstance.put(`/admin/update-inventory/${slug}`, inventoryData, {
         headers
      });

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
export const getOrdersForAdmin = async (queryString, token = null) => {
   try {
      const headers = {
         'Content-Type': 'application/json',
      };

      // If token is provided, add it to headers
      if (token) {
         headers.Authorization = `Bearer ${token}`;
      }

      const response = await axiosInstance.get(`/admin/get-orders?${queryString}`, {
         headers
      });
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

// update order status
export const updateOrder = async (orderId, orderAction, token = null) => {
   try {
      const headers = {
         'Content-Type': 'application/json',
      };

      // If token is provided, add it to headers
      if (token) {
         headers.Authorization = `Bearer ${token}`;
      }

      const response = await axiosInstance.patch(`/admin/update-order/${orderId}`, orderAction, {
         headers
      });

      return {
         success: true,
         message: response.data.message || "Order updated successfully",
         product: response.data.order,
      };
   } catch (error) {
      console.error('Error updating order:', error);

      if (error.response?.data?.fieldErrors) {
         return {
            success: false,
            message: error.response.data.message || "Product validation failed",
            fieldErrors: error.response.data.fieldErrors
         };
      }

      return {
         success: false,
         message: error.response?.data?.message || "Failed to update order",
         error: error.response?.data?.error || error.message
      };
   }
}

// get all reviews
export const getReviews = async (page = 1, limit = 10, token = null) => {
   try {
      const headers = {
         'Content-Type': 'application/json',
      };

      // If token is provided, add it to headers
      if (token) {
         headers.Authorization = `Bearer ${token}`;
      }

      const response = await axiosInstance.get(`/admin/get-reviews?page=${page}&limit=${limit}`, {
         headers
      });
      return response.data;
   } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
   }
}

// get all customers
export const getCustomers = async (page = 1, limit = 10, token = null) => {
   try {
      const headers = {
         'Content-Type': 'application/json',
      };

      // If token is provided, add it to headers
      if (token) {
         headers.Authorization = `Bearer ${token}`;
      }

      const response = await axiosInstance.get(`/admin/get-customers?page=${page}&limit=${limit}`, {
         headers
      });
      return response.data;
   } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
   }
}

// get dashboard stats
export const getDashboardStats = async (token = null) => {
   try {
      const headers = {
         'Content-Type': 'application/json',
      };

      // If token is provided, add it to headers
      if (token) {
         headers.Authorization = `Bearer ${token}`;
      }

      const response = await axiosInstance.get(`/admin/get-dashboard-stats`, {
         headers
      });
      return response.data;
   } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
   }
}