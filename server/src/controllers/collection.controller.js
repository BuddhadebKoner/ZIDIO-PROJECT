import { Collection } from "../models/collection.model.js";

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

export const searchCollections = async (req, res) => {
   try {
      const { searchTerm, page = 1, limit = 5 } = req.query;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      if (pageNum < 1 || limitNum < 1) {
         return res.status(400).json({
            success: false,
            message: "Invalid pagination parameters.",
         });
      }

      const searchQuery = searchTerm
         ? {
            $or: [
               { name: { $regex: searchTerm, $options: 'i' } },
               { subtitle: { $regex: searchTerm, $options: 'i' } }
            ]
         }
         : {};

      const skip = (pageNum - 1) * limitNum;

      const collections = await Collection.find(searchQuery)
         .skip(skip)
         .limit(limitNum)
         .sort({ createdAt: -1 })
         .lean();

      const totalCollections = await Collection.countDocuments(searchQuery);

      return res.status(200).json({
         success: true,
         message: "Collections found successfully",
         collections,
         totalCollections,
         currentPage: pageNum,
         totalPages: Math.ceil(totalCollections / limitNum),
      });
   } catch (error) {
      console.error("Error searching collections:", error);
      return res.status(500).json({
         success: false,
         message: "Internal Server Error",
      });
   }
};