import axiosInstance from "../../config/config";

export const getAllCollections = async (page = 1, limit = 5) => {
   try {
      const response = await axiosInstance.get(
         `/api/collections/get-collections?page=${page}&limit=${limit}`,
      );

      return response.data
   } catch (error) {
      console.error("Error fetching collections", error);
      return {
         success: false,
         message: "Internal Server Error",
      };
   }
}