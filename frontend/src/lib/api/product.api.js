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
export const addToWishlist = async (slug) => {
   try {
      const response = await axiosInstance.post(`/products/add-to-wishlist`, { slug });
      if (response.data && response.data.success) {
         return response.data;
      } else {
         throw new Error(response.data?.message || "Failed to add to wishlist");
      }
   } catch (error) {
      if (error.response) {
         // The request was made and the server 
         const errorMessage = error.response.data?.message || "Failed to add to wishlist";
         console.error("Server error adding to wishlist:", errorMessage);

         throw {
            message: errorMessage,
            response: error.response
         };
      } else if (error.request) {
         console.error("Network error adding to wishlist:", error.request);
         throw new Error("Network error. Please check your connection.");
      } else {
         console.error("Error adding to wishlist:", error.message);
         throw error;
      }
   }
}

// add to cart
export const addTocart = async (productId, quantity = 1) => {
   try {
      const response = await axiosInstance.post(`/products/add-to-cart`, { productId, quantity });
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