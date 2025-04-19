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

      // Pagination setup
      page = parseInt(page) || 1;
      limit = parseInt(limit) || 10;
      if (page < 1 || limit < 1) {
         return res.status(400).json({
            success: false,
            message: "Invalid pagination parameters.",
         });
      }
      const skip = (page - 1) * limit;

      // Build query object
      const query = {};

      // Size filtering
      if (size) {
         if (Array.isArray(size)) {
            query.size = { $in: size };
         } else {
            query.size = size;
         }
      }

      // Category filtering
      if (categories || mainCategory || subCategory) {
         const categoryQuery = [];

         // Handle array of category objects (from JSON)
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

         // Handle individual main/sub category filters
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

      // Determine sort order
      let sortOptions = { createdAt: -1 }; // Default sort by newest

      // Price ordering - simple ascending or descending
      if (priceOrder) {
         if (priceOrder.toLowerCase() === 'asc') {
            sortOptions = { price: 1 };
         } else if (priceOrder.toLowerCase() === 'desc') {
            sortOptions = { price: -1 };
         }
      }

      // Execute query
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