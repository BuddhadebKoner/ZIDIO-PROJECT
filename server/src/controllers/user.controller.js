import { avatars } from "../constant.js";
import { Address } from "../models/address.model.js";
import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import { Collection } from "../models/collection.model.js";
import { Offer } from "../models/offer.model.js";

export const updateAvatar = async (req, res) => {
   try {
      const userId = req.userId;
      const { avatar } = req.body;
      if (!avatar) {
         return res.status(400).json({
            success: false,
            message: "Avatar is required"
         });
      }

      let user = await User.findOne({ clerkId: userId });
      if (!user) {
         return res.status(404).json({
            success: false,
            message: "User not found"
         });
      }

      const avatarExists = avatars.find(item => item.name === avatar);
      if (!avatarExists) {
         return res.status(400).json({
            success: false,
            message: "Avatar not found"
         });
      }

      user.avatar = avatar;
      await user.save();

      return res.status(200).json({
         success: true,
         message: "Avatar updated successfully",
      });

   } catch (error) {
      return res.status(500).json({
         success: false,
         message: "Internal server error",
         error: error.message
      });
   }
};

export const updateUserDetails = async (req, res) => {
   try {
      const userId = req.userId;
      let user = await User.findOne({ clerkId: userId });
      if (!user) {
         return res.status(404).json({
            success: false,
            message: "User not found"
         });
      }

      const { fullName, phone } = req.body;
      if (!fullName && !phone) {
         return res.status(400).json({
            success: false,
            message: "Fullname or phone number is required to update"
         });
      }

      if (!user.profileUpdates) {
         user.profileUpdates = [];
      }

      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      user.profileUpdates = user.profileUpdates.filter(timestamp => new Date(timestamp) > twentyFourHoursAgo);

      if (user.profileUpdates.length >= 3) {
         return res.status(429).json({
            success: false,
            message: "Profile update limit reached. Please try again later."
         });
      }

      if (fullName) {
         user.fullName = fullName;
      }
      if (phone) {
         user.phone = phone;
      }

      user.profileUpdates.push(now);

      await user.save();

      return res.status(200).json({
         success: true,
         message: "User updated successfully",
      });
   } catch (error) {
      return res.status(500).json({
         success: false,
         message: "Internal server error",
         error: error.message
      });
   }
}

// add address 
export const addAddress = async (req, res) => {
   try {
      const userId = req.userId;
      const { addressLine1, addressLine2, city, state, country, postalCode } = req.body;

      const requiredFields = { addressLine1, city, state, country, postalCode };
      const missingFields = Object.keys(requiredFields).filter(key => !requiredFields[key]);

      if (missingFields.length > 0) {
         return res.status(400).json({
            success: false,
            message: `Missing required fields: ${missingFields.join(', ')}`
         });
      }

      if (addressLine1.trim().length < 3) {
         return res.status(400).json({
            success: false,
            message: "Address line 1 must be at least 3 characters"
         });
      }

      if (city.trim().length < 2) {
         return res.status(400).json({
            success: false,
            message: "City must be at least 2 characters"
         });
      }

      if (state.trim().length < 2) {
         return res.status(400).json({
            success: false,
            message: "State must be at least 2 characters"
         });
      }

      const postalCodeRegex = /^[a-zA-Z0-9\s-]{3,10}$/;
      if (!postalCodeRegex.test(postalCode.trim())) {
         return res.status(400).json({
            success: false,
            message: "Invalid postal code format"
         });
      }

      let user = await User.findOne({ clerkId: userId });
      if (!user) {
         return res.status(404).json({
            success: false,
            message: "User not found"
         });
      }

      if (user.address) {
         return res.status(400).json({
            success: false,
            message: "User already has an address. Use update address instead."
         });
      }

      const sanitizedData = {
         userId: user._id,
         addressLine1: addressLine1.trim(),
         addressLine2: addressLine2 ? addressLine2.trim() : null,
         city: city.trim(),
         state: state.trim(),
         country: country.trim(),
         postalCode: postalCode.trim()
      };

      const newAddress = await Address.create(sanitizedData);

      user.address = newAddress._id;
      await user.save();

      return res.status(201).json({
         success: true,
         message: "Address added successfully",
         address: newAddress
      });
   } catch (error) {
      console.error("Error adding address:", error);
      return res.status(500).json({
         success: false,
         message: "Failed to add address",
         error: "Internal server error"
      });
   }
};

// update address
export const updateAddress = async (req, res) => {
   try {
      const userId = req.userId;
      let user = await User.findOne({ clerkId: userId });

      if (!user) {
         return res.status(404).json({
            success: false,
            message: "User not found"
         });
      }

      if (!user.address) {
         return res.status(400).json({
            success: false,
            message: "No address found. Please add an address first."
         });
      }

      const { addressLine1, addressLine2, city, state, country, postalCode } = req.body;

      if (!addressLine1 && !addressLine2 && !city && !state && !country && !postalCode) {
         return res.status(400).json({
            success: false,
            message: "At least one field is required for update"
         });
      }

      const existingAddress = await Address.findById(user.address);
      if (!existingAddress) {
         return res.status(404).json({
            success: false,
            message: "Address not found in database"
         });
      }

      if (addressLine1 && addressLine1.trim().length < 3) {
         return res.status(400).json({
            success: false,
            message: "Address line 1 must be at least 3 characters"
         });
      }

      if (city && city.trim().length < 2) {
         return res.status(400).json({
            success: false,
            message: "City must be at least 2 characters"
         });
      }

      if (state && state.trim().length < 2) {
         return res.status(400).json({
            success: false,
            message: "State must be at least 2 characters"
         });
      }

      if (postalCode) {
         const postalCodeRegex = /^[a-zA-Z0-9\s-]{3,10}$/;
         if (!postalCodeRegex.test(postalCode.trim())) {
            return res.status(400).json({
               success: false,
               message: "Invalid postal code format"
            });
         }
      }

      const updateData = {};
      if (addressLine1) updateData.addressLine1 = addressLine1.trim();
      if (addressLine2 !== undefined) updateData.addressLine2 = addressLine2 ? addressLine2.trim() : null;
      if (city) updateData.city = city.trim();
      if (state) updateData.state = state.trim();
      if (country) updateData.country = country.trim();
      if (postalCode) updateData.postalCode = postalCode.trim();

      const updatedAddress = await Address.findByIdAndUpdate(
         user.address,
         updateData,
         { new: true }
      );

      if (!updatedAddress) {
         return res.status(400).json({
            success: false,
            message: "Failed to update address"
         });
      }

      return res.status(200).json({
         success: true,
         message: "Address updated successfully",
         address: updatedAddress
      });

   } catch (error) {
      console.error("Error updating address:", error);
      return res.status(500).json({
         success: false,
         message: "Failed to update address",
         error: "Internal server error"
      });
   }
}

// extream search
export const extreamSearch = async (req, res) => {
   try {
      const { searchTerm } = req.query;

      if (!searchTerm) {
         return res.status(400).json({
            success: false,
            message: "Search term is required"
         });
      }

      // Create the search pattern
      const searchPattern = new RegExp(searchTerm, 'i');

      // Search in Products (highest priority)
      const products = await Product.find({
         $or: [
            { title: searchPattern },
            { subTitle: searchPattern },
            { description: searchPattern },
            { tags: searchPattern },
            { technologyStack: searchPattern },
            { slug: searchPattern }
         ]
      }).limit(10)

      // Search in Collections (second priority)
      const collections = await Collection.find({
         $or: [
            { name: searchPattern },
            { subtitle: searchPattern },
            { slug: searchPattern }
         ]
      }).limit(5)

      // Search in Offers (lowest priority)
      const offers = await Offer.find({
         $or: [
            { offerName: searchPattern },
            { offerCode: searchPattern }
         ]
      }).limit(5)

      // Calculate total count of results
      const totalCount = products.length + collections.length + offers.length;

      return res.status(200).json({
         success: true,
         message: "Search completed successfully",
         data: {
            totalCount,
            products,
            collections,
            offers
         }
      });

   } catch (error) {
      console.error("Error during extreme search:", error);
      return res.status(500).json({
         success: false,
         message: "Internal server error",
         error: error.message
      });
   }
};

// get cart products with offer validation
export const getCartProducts = async (req, res) => { 
   try {
      const userId = req.userId;
      
      const user = await User.findOne({ clerkId: userId });
      if (!user) {
         return res.status(404).json({
            success: false,
            message: "User not found"
         });
      }

      if (!user.cart || user.cart.length === 0) {
         return res.status(200).json({
            success: true,
            message: "Cart is empty",
            cartData: {
               items: [],
               totalItems: 0,
               cartTotal: 0,
               totalProducts: 0
            }
         });
      }

      const cartItems = await User.aggregate([
         { $match: { _id: user._id } },
         { $unwind: "$cart" },
         {
            $lookup: {
               from: "products",
               localField: "cart.productId",
               foreignField: "_id",
               as: "productDetails"
            }
         },
         { $unwind: "$productDetails" },
         {
            $lookup: {
               from: "offers",
               localField: "productDetails.offer",
               foreignField: "_id",
               as: "offerDetails"
            }
         },
         {
            $addFields: {
               offerDetails: { $arrayElemAt: ["$offerDetails", 0] },
               quantity: "$cart.quantity"
            }
         },
         {
            $addFields: {
               hasValidOffer: {
                  $cond: {
                     if: {
                        $and: [
                           { $ne: ["$offerDetails", null] },
                           { $eq: ["$offerDetails.offerStatus", true] },
                           { $lte: ["$offerDetails.startDate", new Date()] },
                           { $gte: ["$offerDetails.endDate", new Date()] }
                        ]
                     },
                     then: true,
                     else: false
                  }
               }
            }
         },
         {
            $addFields: {
               finalPrice: {
                  $cond: {
                     if: "$hasValidOffer",
                     then: {
                        $round: [
                           {
                              $subtract: [
                                 "$productDetails.price",
                                 {
                                    $multiply: [
                                       "$productDetails.price",
                                       { $divide: ["$offerDetails.discountValue", 100] }
                                    ]
                                 }
                              ]
                           },
                           0
                        ]
                     },
                     else: "$productDetails.price"
                  }
               }
            }
         },
         {
            $project: {
               _id: "$productDetails._id",
               slug: "$productDetails.slug",
               title: "$productDetails.title",
               size: "$productDetails.size",
               subTitle: { 
                  $cond: { 
                     if: { $ne: ["$productDetails.subTitle", null] }, 
                     then: "$productDetails.subTitle", 
                     else: "$productDetails.description" 
                  } 
               },
               price: "$finalPrice",
               originalPrice: "$productDetails.price",
               quantity: 1,
               selectedSize: "$cart.size",
               subTotal: { $multiply: ["$finalPrice", "$quantity"] },
               images: { $slice: ["$productDetails.images", 0, 1] },
               isNewArrival: "$productDetails.isNewArrival",
               isUnderHotDeals: "$productDetails.isUnderHotDeals",
               hasDiscount: "$hasValidOffer",
               offer: {
                  $cond: {
                     if: "$hasValidOffer",
                     then: {
                        discountValue: "$offerDetails.discountValue",
                        active: true
                     },
                     else: null
                  }
               }
            }
         }
      ]);

      const cartTotal = cartItems.reduce((sum, item) => sum + item.subTotal, 0);
      const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

      return res.status(200).json({
         success: true,
         message: "Cart products retrieved successfully",
         cartData: {
            items: cartItems,
            totalItems,
            cartTotal,
            totalProducts: cartItems.length
         }
      });

   } catch (error) {
      console.error("Error retrieving cart products:", error);
      return res.status(500).json({
         success: false,
         message: "Internal server error",
         error: error.message
      });
   }
}