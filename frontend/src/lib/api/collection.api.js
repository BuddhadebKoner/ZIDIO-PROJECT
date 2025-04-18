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

      // Fix the API endpoint to match the backend route
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