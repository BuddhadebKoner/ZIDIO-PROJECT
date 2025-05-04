import { clerkClient } from "@clerk/express";
import { User } from "../models/user.model.js";
import { avatars } from "../constant.js";


export const isAuthenticated = async (req, res) => {
   try {
      const userId = req.userId;

      // Using aggregation pipeline to fetch user with related collections
      const userArray = await User.aggregate([
         // Match the user by clerkId
         { $match: { clerkId: userId } },

         // Lookup address collection if not empty
         {
            $lookup: {
               from: "addresses",
               localField: "address",
               foreignField: "_id",
               as: "addressDetails"
            }
         },

         // Lookup orders collection if not empty
         {
            $lookup: {
               from: "orders",
               let: { orderIds: "$orders" },
               pipeline: [
                  { $match: { $expr: { $in: ["$_id", "$$orderIds"] } } }
               ],
               as: "ordersDetails"
            }
         },

         // Lookup products for cart if not empty
         {
            $lookup: {
               from: "products",
               let: { cartIds: "$cart" },
               pipeline: [
                  { $match: { $expr: { $in: ["$_id", "$$cartIds"] } } }
               ],
               as: "cartDetails"
            }
         },

         // Lookup products for wishlist if not empty
         {
            $lookup: {
               from: "products",
               let: { wishlistIds: "$wishlist" },
               pipeline: [
                  { $match: { $expr: { $in: ["$_id", "$$wishlistIds"] } } },
                  // Lookup offers for each product
                  {
                     $lookup: {
                        from: "offers",
                        localField: "offer",
                        foreignField: "_id",
                        as: "offerDetails"
                     }
                  },
                  {
                     $addFields: {
                        offerDetails: { $arrayElemAt: ["$offerDetails", 0] },
                        // Limit images to first 2
                        images: { $slice: ["$images", 2] }
                     }
                  },
                  {
                     $addFields: {
                        isOfferActive: {
                           $cond: [
                              { $eq: ["$offerDetails", null] },
                              false,
                              {
                                 $and: [
                                    "$offerDetails.offerStatus",
                                    { $lte: ["$offerDetails.startDate", new Date()] },
                                    { $gte: ["$offerDetails.endDate", new Date()] }
                                 ]
                              }
                           ]
                        },
                        finalPrice: {
                           $cond: [
                              {
                                 $and: [
                                    { $ne: ["$offerDetails", null] },
                                    "$offerDetails.offerStatus",
                                    { $lte: ["$offerDetails.startDate", new Date()] },
                                    { $gte: ["$offerDetails.endDate", new Date()] }
                                 ]
                              },
                              { $subtract: ["$price", { $multiply: ["$price", { $divide: ["$offerDetails.discountValue", 100] }] }] },
                              "$price"
                           ]
                        }
                     }
                  },
                  {
                     $project: {
                        _id: 1,
                        slug: 1,
                        title: 1,
                        size: 1,
                        subTitle: { $ifNull: ["$subTitle", "$description"] },
                        price: "$finalPrice",
                        images: 1,
                        isNewArrival: 1,
                        isUnderHotDeals: 1,
                        hasDiscount: { $ne: ["$offerDetails", null] },
                        offer: {
                           $cond: [
                              { $eq: ["$offerDetails", null] },
                              null,
                              {
                                 discountValue: "$offerDetails.discountValue",
                                 active: "$isOfferActive"
                              }
                           ]
                        }
                     }
                  }
               ],
               as: "wishlistDetails"
            }
         },

         // Lookup notifications collection if not empty
         {
            $lookup: {
               from: "notifications",
               let: { notificationIds: "$notifications" },
               pipeline: [
                  { $match: { $expr: { $in: ["$_id", "$$notificationIds"] } } }
               ],
               as: "notificationsDetails"
            }
         },

         // Replace fields with populated data only if they exist
         {
            $addFields: {
               address: { $cond: [{ $gt: [{ $size: "$addressDetails" }, 0] }, { $arrayElemAt: ["$addressDetails", 0] }, "$address"] },
               orders: { $cond: [{ $gt: [{ $size: "$ordersDetails" }, 0] }, "$ordersDetails", "$orders"] },
               cart: { $cond: [{ $gt: [{ $size: "$cartDetails" }, 0] }, "$cartDetails", "$cart"] },
               wishlist: { $cond: [{ $gt: [{ $size: "$wishlistDetails" }, 0] }, "$wishlistDetails", "$wishlist"] },
               notifications: { $cond: [{ $gt: [{ $size: "$notificationsDetails" }, 0] }, "$notificationsDetails", "$notifications"] }
            }
         },

         // Remove temporary fields
         {
            $project: {
               addressDetails: 0,
               ordersDetails: 0,
               cartDetails: 0,
               wishlistDetails: 0,
               notificationsDetails: 0
            }
         }
      ]);

      let user = userArray.length > 0 ? userArray[0] : null;

      const clerkUser = await clerkClient.users.getUser(userId);

      // console.log("Clerk User:", clerkUser.publicMetadata);
      const isClerkAdmin = clerkUser.publicMetadata && clerkUser.publicMetadata.role === 'admin';

      if (user) {
         if (isClerkAdmin && user.role !== 'admin') {
            // For direct model update after aggregation
            await User.updateOne({ clerkId: userId }, { role: 'admin' });
            user.role = 'admin';
         }

         // User exists, return user data
         return res.status(200).json({
            success: true,
            message: "User is authenticated",
            user
         });
      } else {
         const fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();
         const email = clerkUser.emailAddresses[0]?.emailAddress;

         if (!email) {
            return res.status(400).json({
               success: false,
               message: "Email is required",
               isNewUser: true
            });
         }

         const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

         user = new User({
            clerkId: userId,
            fullName,
            email,
            role: isClerkAdmin ? "admin" : "user",
            avatar: randomAvatar.name,
         });

         // Save the new user
         await user.save();

         return res.status(201).json({
            success: true,
            message: "User created successfully",
            user
         });
      }
   } catch (error) {
      return res.status(500).json({
         success: false,
         message: "Internal server error",
         error: error.message
      });
   }
};