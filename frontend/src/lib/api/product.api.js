import axiosInstance from "../../config/config";

export const getAllProducts = async (page = 1, limit = 5) => {
   try {
      const response = await axiosInstance.get(
         `/products/get-products?page=${page}&limit=${limit}`
      );

      if (response.data && response.data.success) {
         return response.data;
      } else {
         throw new Error(response.data?.message || "Failed to fetch products");
      }
   } catch (error) {
      console.error("Error fetching collections:", error);
      throw error;
   }
};

export const searchProducts = async (searchTerm = '', page = 1, limit = 5) => {
   try {
      const queryParams = new URLSearchParams({
         searchTerm,
         page: page.toString(),
         limit: limit.toString()
      });

      const response = await axiosInstance.get(
         `/products/search?${queryParams.toString()}`
      );
      if (response.data && response.data.success) {
         return response.data;
      } else {
         throw new Error(response.data?.message || "Failed to search products");
      }
   } catch (error) {
      console.error("Error searching collections:", error);
      throw error;
   }
};

export const filterProducts = async (filterParams) => {
   try {
      const response = await axiosInstance.get(
         `/products/filter?${new URLSearchParams(filterParams).toString()}`
      );

      if (response.data && response.data.success) {
         return response.data;
      } else {
         throw new Error(response.data?.message || "Failed to filter products");
      }
   } catch (error) {
      console.error("Error filtering products:", error);
      throw error;
   }
}

export const getProductById = async (slug) => {
   try {
      const response = await axiosInstance.get(`/products/${slug}`);
      if (response.data && response.data.success) {
         return response.data;
      } else {
         throw new Error(response.data?.message || "Failed to fetch product");
      }
   } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
   }
}

// add to wishlist
export const addToWishlist = async (productId, token = null) => {
   try {
      const headers = {
         'Content-Type': 'application/json',
      };

      // If token is provided, add it to headers
      if (token) {
         headers.Authorization = `Bearer ${token}`;
      }

      const response = await axiosInstance.post(`/products/add-to-wishlist`, { productId }, {
         headers
      });
      if (response.data && response.data.success) {
         return response.data;
      } else {
         throw new Error(response.data?.message || "Failed to add to wishlist");
      }
   } catch (error) {
      return {
         message: error.message || "Failed to add to wishlist",
         response: error.response
      };
   }
}

// remove from wishlist
export const removeFromWishlist = async (productId, token = null) => {
   try {
      const headers = {
         'Content-Type': 'application/json',
      };

      // If token is provided, add it to headers
      if (token) {
         headers.Authorization = `Bearer ${token}`;
      }

      const response = await axiosInstance.post(`/products/remove-from-wishlist`, { productId }, {
         headers
      });
      if (response.data && response.data.success) {
         return response.data;
      } else {
         throw new Error(response.data?.message || "Failed to remove from wishlist");
      }
   } catch (error) {
      return {
         message: error.message || "Failed to remove from wishlist",
         response: error.response
      };
   }
}

// add to cart
export const addToCart = async (data, token = null) => {
   try {
      const headers = {
         'Content-Type': 'application/json',
      };

      // If token is provided, add it to headers
      if (token) {
         headers.Authorization = `Bearer ${token}`;
      }

      const response = await axiosInstance.post(`/products/add-to-cart`, data, {
         headers
      });
      if (response.data && response.data.success) {
         return response.data;
      } else {
         throw new Error(response.data?.message || "Failed to add to cart");
      }
   } catch (error) {
      return {
         message: error.message || "Failed to add to cart",
         response: error.response
      };
   }
}

// remove from cart
export const removeFromCart = async (productId, token = null) => {
   try {
      const headers = {
         'Content-Type': 'application/json',
      };

      // If token is provided, add it to headers
      if (token) {
         headers.Authorization = `Bearer ${token}`;
      }

      const response = await axiosInstance.post(`/products/remove-from-cart`, { productId }, {
         headers
      });
      if (response.data && response.data.success) {
         return response.data;
      } else {
         throw new Error(response.data?.message || "Failed to remove from cart");
      }
   } catch (error) {
      return {
         message: error.message || "Failed to remove from cart",
         response: error.response
      };
   }
}

// update cart quantity and size
export const updateCart = async (data, token = null) => {
   try {
      const headers = {
         'Content-Type': 'application/json',
      };

      // If token is provided, add it to headers
      if (token) {
         headers.Authorization = `Bearer ${token}`;
      }

      const response = await axiosInstance.put(`/products/update-cart`, data, {
         headers
      });
      if (response.data && response.data.success) {
         return response.data;
      } else {
         throw new Error(response.data?.message || "Failed to update cart");
      }
   } catch (error) {
      return {
         message: error.message || "Failed to update cart",
         response: error.response
      };
   }
}

// add review
export const addReview = async (data, token = null) => {
   try {
      const headers = {
         'Content-Type': 'application/json',
      };

      // If token is provided, add it to headers
      if (token) {
         headers.Authorization = `Bearer ${token}`;
      }

      const response = await axiosInstance.post(`/products/add-review`, data, {
         headers
      });

      console.log("addReview response", response);
      return response.data;
   } catch (error) {
      return {
         message: error.message || "Failed to add review",
         response: error.response
      };
   }
};

// get all reviews by product id pagination
export const getReviewsById = async (slug, page = 1, limit = 5) => {
   try {
      const response = await axiosInstance.get(`/products/get-reviews/${slug}?page=${page}&limit=${limit}`);
      if (response.data && response.data.success) {
         return response.data;
      } else {
         throw new Error(response.data?.message || "Failed to fetch reviews");
      }
   } catch (error) {
      console.error("Error fetching reviews:", error);
      throw error;
   }
}