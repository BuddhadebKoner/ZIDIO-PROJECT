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

      // Set pagination defaults
      page = parseInt(page) || 1;
      limit = parseInt(limit) || 10;

      if (page < 1 || limit < 1) {
         return res.status(400).json({
            success: false,
            message: "Invalid pagination parameters."
         });
      }

      const skip = (page - 1) * limit;
      const query = {};

      // Handle size filtering
      if (size) {
         if (Array.isArray(size)) {
            query.size = { $in: size };
         } else {
            query.size = size;
         }
      }

      // Handle category filtering
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

      // Set sorting options
      let sortOptions = { createdAt: -1 };
      if (priceOrder) {
         if (priceOrder.toLowerCase() === 'asc') {
            sortOptions = { price: 1 };
         } else if (priceOrder.toLowerCase() === 'desc') {
            sortOptions = { price: -1 };
         }
      }

      // Only select fields needed for the ProductCard component
      const selectedFields = {
         slug: 1,
         title: 1,
         subTitle: 1,
         description: 1,
         price: 1,
         'images': 1,
         isNewArrival: 1,
         isUnderHotDeals: 1,
         offer: 1
      };

      // Fetch products with limited fields and populate offer with correct fields
      const products = await Product.find(query)
         .select(selectedFields)
         .populate({
            path: 'offer',
            select: 'offerStatus discountValue startDate endDate'
         })
         .skip(skip)
         .limit(limit)
         .sort(sortOptions)
         .lean();

      // Calculate final prices with offers and limit images to 2
      const productsWithCalculatedPrices = products.map(product => {
         let finalPrice = product.price;
         let discount = null;

         // Calculate price if there's an active offer
         if (product.offer && product.offer.offerStatus) {
            const now = new Date();
            const startDate = new Date(product.offer.startDate);
            const endDate = new Date(product.offer.endDate);

            if (startDate <= now && endDate >= now) {
               discount = (product.price * product.offer.discountValue) / 100;
               finalPrice = product.price - discount;
            }
         }

         // Return only necessary fields with limited images
         return {
            slug: product.slug,
            title: product.title,
            subTitle: product.subTitle || product.description,
            price: finalPrice,
            images: product.images?.slice(0, 2) || [], // Only include first 2 images
            isNewArrival: product.isNewArrival,
            isUnderHotDeals: product.isUnderHotDeals,
            hasDiscount: discount !== null,
            offer: product.offer ? {
               discountValue: product.offer.discountValue,
               active: product.offer.offerStatus &&
                  new Date(product.offer.startDate) <= new Date() &&
                  new Date(product.offer.endDate) >= new Date()
            } : null
         };
      });

      const totalProducts = await Product.countDocuments(query);

      return res.status(200).json({
         success: true,
         message: "Products filtered successfully",
         products: productsWithCalculatedPrices,
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
         message: "Internal Server Error"
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
               isOfferActive: {
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
               offer: {
                  $cond: {
                     if: "$isOfferActive",
                     then: { $arrayElemAt: ["$offerData", 0] },
                     else: null
                  }
               },
               finalPrice: {
                  $cond: {
                     if: "$isOfferActive",
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
                     if: "$isOfferActive",
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
               offerData: 0,
               isOfferActive: 0
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