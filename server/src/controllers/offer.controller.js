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

      // Using aggregation pipeline for more control and efficiency
      const offers = await Offer.aggregate([
         { $sort: { createdAt: -1 } },
         { $skip: skip },
         { $limit: limit },
         {
            $lookup: {
               from: "products",
               localField: "products",
               foreignField: "_id",
               as: "products",
               pipeline: [
                  {
                     $project: {
                        _id: 1,
                        slug: 1,
                        title: 1,
                        subTitle: 1,
                        description: 1,
                        price: 1,
                        images: 1,
                        size: 1,
                        inventory: 1,
                        isNewArrival: 1,
                        isUnderHotDeals: 1,
                        isBestSeller: 1
                     }
                  },
                  {
                     $lookup: {
                        from: "inventories",
                        localField: "inventory",
                        foreignField: "_id",
                        as: "inventoryData"
                     }
                  },
                  {
                     $lookup: {
                        from: "collections",
                        localField: "collections",
                        foreignField: "_id",
                        as: "collectionsData"
                     }
                  },
                  {
                     $addFields: {
                        inventory: { $arrayElemAt: ["$inventoryData", 0] },
                        collections: "$collectionsData"
                     }
                  },
                  {
                     $project: {
                        inventoryData: 0,
                        collectionsData: 0
                     }
                  }
               ]
            }
         },
         {
            $addFields: {
               activeStatus: {
                  $cond: {
                     if: {
                        $and: [
                           { $lte: ["$startDate", new Date()] },
                           { $gte: ["$endDate", new Date()] }
                        ]
                     },
                     then: true,
                     else: false
                  }
               }
            }
         }
      ]);

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
      console.error("Error fetching offers:", error);
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

// get offer detaild by offer code
export const getOfferDetailsByCode = async (req, res) => {
   try {
      const { slug } = req.params;
      if (!slug) {
         return res.status(400).json({
            success: false,
            message: "offer slug is required",
         });
      }

      const offer = await Offer.findOne({ offerCode: slug })
      if (!offer) {
         return res.status(404).json({
            success: false,
            message: "Offer not found",
         });
      }

      // return offer data 
      return res.status(200).json({
         success: true,
         message: "Offer fetched successfully",
         offer
      });

   } catch (error) {
      console.error("Error fetching offer by code:", error);
      return res.status(500).json({
         success: false,
         message: "Internal Server Error",
      });
   }
}