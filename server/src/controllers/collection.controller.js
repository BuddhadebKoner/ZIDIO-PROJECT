import { Collection } from "../models/collection.model";

export const getCollections = async (req, res) => {
   try {
      let { page, limit } = req.query;
      page = parseInt(page) || 1;
      limit = parseInt(limit) || 5;

      if (page < 1 || limit < 1) {
         return res.status(400).json({
            success: false,
            message: "Invalid pagination parameters.",
         });
      }
      const skip = (page - 1) * limit;

      // fetch collections with pagination
      const collections = await Collection.find()
         .skip(skip)
         .limit(limit)
         .sort({ createdAt: -1 })
         .lean();

      const totalCollections = await Collection.countDocuments();

      return res.status(200).json({
         success: true,
         message: "Collections fetched successfully",
         collections,
         totalCollections,
         currentPage: page,
         totalPages: Math.ceil(totalCollections / limit),
      });
   } catch (error) {
      console.error("Error fetching collections", error);
      return res.status(500).json({
         success: false,
         message: "Internal Server Error",
      });
   }
};