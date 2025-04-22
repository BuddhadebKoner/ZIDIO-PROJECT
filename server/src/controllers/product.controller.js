import { Product } from "../models/product.model.js";

export const getProducts = async (req, res) => {
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

      const products = await Product.find()
         .skip(skip)
         .limit(limit)
         .sort({ createdAt: -1 })
         .lean();

      const totalProducts = await Product.countDocuments();

      return res.status(200).json({
         success: true,
         message: "Products fetched successfully",
         products,
         totalProducts,
         currentPage: page,
         totalPages: Math.ceil(totalProducts / limit),
      });
   } catch (error) {
      console.error("Error fetching collections", error);
      return res.status(500).json({
         success: false,
         message: "Internal Server Error",
      });
   }
};

export const searchProducts = async (req, res) => {
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
               { title: { $regex: searchTerm, $options: "i" } },
               { subtitle: { $regex: searchTerm, $options: "i" } },
               { description: { $regex: searchTerm, $options: "i" } },
               { tags: { $regex: searchTerm, $options: "i" } },
               { technologyStack: { $regex: searchTerm, $options: "i" } },
            ],
         }
         : {};

      const skip = (pageNum - 1) * limitNum;

      const products = await Product.find(searchQuery)
         .skip(skip)
         .limit(limitNum)
         .sort({ createdAt: -1 })
         .lean();

      const totalProducts = await Product.countDocuments(searchQuery);
      return res.status(200).json({
         success: true,
         message: "Products fetched successfully",
         products,
         totalProducts,
         currentPage: pageNum,
         totalPages: Math.ceil(totalProducts / limitNum),
      });
   } catch (error) {
      console.error("Error searching products", error);
      return res.status(500).json({
         success: false,
         message: "Internal Server Error",
      });
   }
};

export const filterProducts = async (req, res) => {
   try {
      let { page, limit, priceOrder, size, categories, mainCategory, subCategory } = req.query;

      page = parseInt(page) || 1;
      limit = parseInt(limit) || 10;
      if (page < 1 || limit < 1) {
         return res.status(400).json({
            success: false,
            message: "Invalid pagination parameters.",
         });
      }
      const skip = (page - 1) * limit;

      const query = {};

      if (size) {
         if (Array.isArray(size)) {
            query.size = { $in: size };
         } else {
            query.size = size;
         }
      }

      if (categories || mainCategory || subCategory) {
         const categoryQuery = [];

         if (categories) {
            try {
               const parsedCategories = typeof categories === 'string' ? JSON.parse(categories) : categories;
               if (Array.isArray(parsedCategories)) {
                  parsedCategories.forEach(category => {
                     categoryQuery.push({
                        'categories.main': category.main,
                        'categories.sub': category.sub
                     });
                  });
               }
            } catch (e) {
               console.error("Error parsing categories:", e);
            }
         }

         if (mainCategory) {
            if (subCategory) {
               categoryQuery.push({
                  'categories.main': mainCategory,
                  'categories.sub': subCategory
               });
            } else {
               categoryQuery.push({ 'categories.main': mainCategory });
            }
         } else if (subCategory) {
            categoryQuery.push({ 'categories.sub': subCategory });
         }

         if (categoryQuery.length > 0) {
            query.$or = categoryQuery;
         }
      }

      let sortOptions = { createdAt: -1 };

      if (priceOrder) {
         if (priceOrder.toLowerCase() === 'asc') {
            sortOptions = { price: 1 };
         } else if (priceOrder.toLowerCase() === 'desc') {
            sortOptions = { price: -1 };
         }
      }

      const products = await Product.find(query)
         .skip(skip)
         .limit(limit)
         .sort(sortOptions)
         .lean();

      const totalProducts = await Product.countDocuments(query);

      return res.status(200).json({
         success: true,
         message: "Products filtered successfully",
         products,
         totalProducts,
         currentPage: page,
         totalPages: Math.ceil(totalProducts / limit),
         filters: {
            priceOrder: priceOrder || null,
            size: size || null,
            categories: categories || (mainCategory || subCategory ? { main: mainCategory, sub: subCategory } : null)
         }
      });
   } catch (error) {
      console.error("Error filtering products", error);
      return res.status(500).json({
         success: false,
         message: "Internal Server Error",
      });
   }
};

export const getProductById = async (req, res) => {
   try {
      const { slug } = req.params;

      if (!slug) {
         return res.status(400).json({
            success: false,
            message: "Product ID is required.",
         });
      }

      const currentDate = new Date();

      const productAggregation = await Product.aggregate([
         { $match: { slug } },
         {
            $lookup: {
               from: "collections",
               localField: "collections",
               foreignField: "_id",
               as: "collections"
            }
         },
         {
            $lookup: {
               from: "offers",
               localField: "offer",
               foreignField: "_id",
               as: "offerData"
            }
         },
         {
            $addFields: {
               offer: {
                  $cond: {
                     if: { $gt: [{ $size: "$offerData" }, 0] },
                     then: { $arrayElemAt: ["$offerData", 0] },
                     else: null
                  }
               },
               isOfferValid: {
                  $cond: {
                     if: { $gt: [{ $size: "$offerData" }, 0] },
                     then: {
                        $and: [
                           { $eq: [{ $arrayElemAt: ["$offerData.offerStatus", 0] }, true] },
                           { $lte: [{ $arrayElemAt: ["$offerData.startDate", 0] }, currentDate] },
                           { $gte: [{ $arrayElemAt: ["$offerData.endDate", 0] }, currentDate] }
                        ]
                     },
                     else: false
                  }
               }
            }
         },
         {
            $addFields: {
               finalPrice: {
                  $cond: {
                     if: "$isOfferValid",
                     then: {
                        $round: [
                           {
                              $subtract: [
                                 "$price",
                                 {
                                    $multiply: [
                                       "$price",
                                       {
                                          $divide: [{ $arrayElemAt: ["$offerData.discountValue", 0] }, 100]
                                       }
                                    ]
                                 }
                              ]
                           },
                           0
                        ]
                     },
                     else: "$price"
                  }
               },
               discountAmount: {
                  $cond: {
                     if: "$isOfferValid",
                     then: {
                        $round: [
                           {
                              $multiply: [
                                 "$price",
                                 { $divide: [{ $arrayElemAt: ["$offerData.discountValue", 0] }, 100] }
                              ]
                           },
                           0
                        ]
                     },
                     else: 0
                  }
               }
            }
         },
         {
            $project: {
               offerData: 0
            }
         }
      ]);

      if (!productAggregation.length) {
         return res.status(404).json({
            success: false,
            message: "Product not found.",
         });
      }

      const product = productAggregation[0];

      return res.status(200).json({
         success: true,
         message: "Product fetched successfully",
         product,
      });
   } catch (error) {
      console.error("Error fetching product by ID", error);
      return res.status(500).json({
         success: false,
         message: "Internal Server Error",
      });
   }
};