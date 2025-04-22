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