import mongoose from "mongoose";
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

export const getCollectionsById = async (req, res) => {
   try {
      const { slug } = req.params;

      if (!slug) {
         return res.status(400).json({
            success: false,
            message: "Collection slug is required",
         });
      }

      const collection = await Collection.findOne({ slug }).lean();

      if (!collection) {
         return res.status(404).json({
            success: false,
            message: "Collection not found",
         });
      }

      return res.status(200).json({
         success: true,
         message: "Collection fetched successfully",
         collection,
      });
   } catch (error) {
      console.error("Error fetching collection by ID:", error);
      return res.status(500).json({
         success: false,
         message: "Internal Server Error",
      });
   }
};

export const getProductsByCollectionSlug = async (req, res) => {
   try {
      // 1. Extract and validate pagination params
      const { page = 1, limit = 5 } = req.query;
      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);

      if (pageNumber < 1 || limitNumber < 1) {
         return res.status(400).json({
            success: false,
            message: "Invalid pagination parameters. Page and limit must be positive integers."
         });
      }

      // 2. Validate collection slug
      const { slug } = req.params;
      if (!slug) {
         return res.status(400).json({
            success: false,
            message: "Collection slug is required"
         });
      }

      // 3. Fetch collection
      const collection = await Collection.findOne({ slug }).lean();
      if (!collection) {
         return res.status(404).json({
            success: false,
            message: "Collection not found"
         });
      }

      // Check if collection has products
      if (!collection.products || collection.products.length === 0) {
         return res.status(200).json({
            success: true,
            message: "No products in this collection",
            products: [],
            totalProducts: 0,
            currentPage: pageNumber,
            totalPages: 0,
            collection: {
               _id: collection._id,
               name: collection.name,
               slug: collection.slug,
               subtitle: collection.subtitle,
               bannerImageUrl: collection.bannerImageUrl
            }
         });
      }

      // 4. Calculate pagination values
      const skip = (pageNumber - 1) * limitNumber;
      const currentDate = new Date();

      // 5. Fetch products with optimized aggregation pipeline
      const Product = mongoose.model("Product");
      const products = await Product.aggregate([
         // Match only products in this collection (use index)
         { $match: { _id: { $in: collection.products } } },

         // Apply sorting
         { $sort: { createdAt: -1 } },

         // Apply pagination
         { $skip: skip },
         { $limit: limitNumber },

         // Lookup offers in a single stage
         {
            $lookup: {
               from: "offers",
               localField: "offer",
               foreignField: "_id",
               as: "offerData"
            }
         },

         // Process and transform data in a single stage
         {
            $addFields: {
               offer: {
                  $cond: {
                     if: {
                        $and: [
                           { $gt: [{ $size: "$offerData" }, 0] },
                           { $eq: [{ $arrayElemAt: ["$offerData.offerStatus", 0] }, true] },
                           { $lte: [{ $arrayElemAt: ["$offerData.startDate", 0] }, currentDate] },
                           { $gte: [{ $arrayElemAt: ["$offerData.endDate", 0] }, currentDate] }
                        ]
                     },
                     then: {
                        $mergeObjects: [
                           { $arrayElemAt: ["$offerData", 0] },
                           { active: true }
                        ]
                     },
                     else: null
                  }
               }
            }
         },

         // Remove temporary fields
         { $project: { offerData: 0 } }
      ]);

      // 6. Return formatted response
      return res.status(200).json({
         success: true,
         message: "Products fetched successfully",
         products,
         totalProducts: collection.products.length,
         currentPage: pageNumber,
         totalPages: Math.ceil(collection.products.length / limitNumber),
         collection: {
            _id: collection._id,
            name: collection.name,
            slug: collection.slug,
            subtitle: collection.subtitle,
            bannerImageUrl: collection.bannerImageUrl
         }
      });
   } catch (error) {
      return res.status(500).json({
         success: false,
         message: "Internal Server Error",
         error: error.message
      });
   }
};