import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
   api_key: process.env.CLOUDINARY_API_KEY,
   api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const deleteFromCloudinary = async (publicId) => {
   try {
      if (!publicId) {
         console.log("No publicId provided to deleteFromCloudinary");
         return null;
      }

      console.log("Attempting to delete from Cloudinary with publicId:", publicId);
      
      const response = await cloudinary.uploader.destroy(publicId);
      
      console.log("Cloudinary destroy response:", response);
      
      return response;
   } catch (error) {
      console.error("Cloudinary delete error:", error);
      throw new Error(`Image delete failed: ${error.message}`);
   }
};