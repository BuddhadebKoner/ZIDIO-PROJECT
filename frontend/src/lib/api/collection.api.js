import axiosInstance from "../../config/config";

export const getAllCollections = async (page = 1, limit = 5) => {
   try {
      const response = await axiosInstance.get(
         `/collections/get-collections?page=${page}&limit=${limit}`
      );

      if (response.data && response.data.success) {
         return response.data;
      } else {
         throw new Error(response.data?.message || "Failed to fetch collections");
      }
   } catch (error) {
      console.error("Error fetching collections:", error);
      throw error;
   }
};

export const searchCollections = async (searchTerm = '', page = 1, limit = 5) => {
   try {
      const queryParams = new URLSearchParams({
         searchTerm,
         page: page.toString(),
         limit: limit.toString()
      });

      const response = await axiosInstance.get(
         `/collections/search?${queryParams.toString()}`
      );

      if (response.data && response.data.success) {
         return response.data;
      } else {
         throw new Error(response.data?.message || "Failed to search collections");
      }
   } catch (error) {
      console.error("Error searching collections:", error);
      throw error;
   }
};

export const getCollectionById = async (slug, token = null) => {
   try {
      const headers = {
         'Content-Type': 'application/json',
      };

      // If token is provided, add it to headers
      if (token) {
         headers.Authorization = `Bearer ${token}`;
      }

      const response = await axiosInstance.get(`/collections/${slug}`, {
         headers
      });
      if (response.data && response.data.success) {
         return response.data;
      } else {
         throw new Error(response.data?.message || "Failed to fetch collection");
      }
   } catch (error) {
      console.error("Error fetching collection:", error);
      throw error;
   }
}

// get products by collection id
export const getProductsByCollectionSlug = async (slug, page = 1, limit = 5) => {
   try {
      const response = await axiosInstance.get(
         `/collections/${slug}/products?page=${page}&limit=${limit}`
      );

      if (response.data && response.data.success) {
         return response.data;
      } else {
         throw new Error(response.data?.message || "Failed to fetch products");
      }
   } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
   }
};