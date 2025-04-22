import axiosInstance from "../../config/config.js";

export const getAllOffers = async (page = 1, limit = 5) => {
   try {
      const response = await axiosInstance.get(
         `/offers/get-offers?page=${page}&limit=${limit}`
      );

      if (response.data && response.data.success) {
         return response.data;
      } else {
         throw new Error(response.data?.message || "Failed to fetch offers");
      }
   } catch (error) {
      console.error("Error fetching offers:", error);
      throw error;
   }
}

export const searchOffers = async (searchTerm = '', page = 1, limit = 5) => { 
   try {
      const queryParams = new URLSearchParams({
         searchTerm,
         page: page.toString(),
         limit: limit.toString()
      });

      const response = await axiosInstance.get(
         `/offers/search?${queryParams.toString()}`
      );

      if (response.data && response.data.success) {
         return response.data;
      } else {
         throw new Error(response.data?.message || "Failed to search offers");
      }
   } catch (error) {
      console.error("Error searching offers:", error);
      throw error;
   }
}