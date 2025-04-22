import { Offer } from "../models/offer.model.js";

// get all offers and search collection
export const getAllOffers = async (req, res) => {
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


      const offers = await Offer.find()
         .skip(skip)
         .limit(limit)
         .sort({ createdAt: -1 })
         .lean();

      const totalOffers = await Offer.countDocuments();

      return res.status(200).json({
         success: true,
         message: "Offers fetched successfully",
         offers,
         totalOffers,
         currentPage: page,
         totalPages: Math.ceil(totalOffers / limit),
      });
   } catch (error) {
      console.error("Error fetching collections", error);
      return res.status(500).json({
         success: false,
         message: "Internal Server Error",
      });
   }
}

export const searchOffers = async (req, res) => {
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
               { offerName: { $regex: searchTerm, $options: 'i' } },
               { offerCode: { $regex: searchTerm, $options: 'i' } },
            ]
         }
         : {};

      const skip = (pageNum - 1) * limitNum;

      const offers = await Offer.find(searchQuery)
         .skip(skip)
         .limit(limitNum)
         .sort({ createdAt: -1 })
         .lean();

      const totalOffers = await Offer.countDocuments(searchQuery);

      return res.status(200).json({
         success: true,
         message: "Offers fetched successfully",
         offers,
         totalOffers,
         currentPage: pageNum,
         totalPages: Math.ceil(totalOffers / limitNum),
      });
   } catch (error) {
      console.error("Error searching collections:", error);
      return res.status(500).json({
         success: false,
         message: "Internal Server Error",
      });
   }
}