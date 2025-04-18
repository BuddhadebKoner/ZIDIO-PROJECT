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