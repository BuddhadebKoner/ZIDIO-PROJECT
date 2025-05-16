import { Collection } from "../models/collection.model.js";
import { Product } from "../models/product.model.js";
import { Offer } from "../models/offer.model.js";
import { sanitizedCollection, sanitizedOffer, sanitizedProduct } from "../utils/checkValidation.js";
import { HomeContent } from "../models/homecontent.model.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";
import { Inventory } from "../models/inventory.model.js";
import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";
import { Review } from "../models/review.model.js";
import { Payment } from "../models/payment.model.js";

export const addProduct = async (req, res) => {
   try {
      const userId = req.userId;
      if (!userId) {
         return res.status(401).json({
            success: false,
            message: "Unauthorized: Authentication required"
         });
      }

      const product = req.body;

      if (!product) {
         return res.status(400).json({
            success: false,
            message: "Product data is required"
         });
      }

      const sanitizedResult = sanitizedProduct(product);

      if (!sanitizedResult.valid) {
         return res.status(400).json({
            success: false,
            message: "Product validation failed",
            fieldErrors: sanitizedResult.errors,
            exception: sanitizedResult.exception
         });
      }

      const sanitizedProductData = sanitizedResult.data;

      const existingProduct = await Product.findOne({ slug: sanitizedProductData.slug });
      if (existingProduct) {
         return res.status(400).json({
            success: false,
            message: "A product with this slug already exists",
            fieldErrors: { slug: "This slug is already in use" }
         });
      }

      const newProduct = new Product(sanitizedProductData);
      const savedProduct = await newProduct.save();

      const defaultSize = ["S", "M", "L", "XL", "XXL"];

      // make a copy of the product in inventory
      const newInventory = await Inventory.create({
         productId: savedProduct._id,
         stocks: defaultSize.map(size => ({
            size: size,
            quantity: 0
         })),
         totalQuantity: 0
      });

      if (!newInventory) {
         return res.status(400).json({
            success: false,
            message: "Failed to save product inventory",
         });
      }

      // update product with inventory id
      const updatedProduct = await Product.findByIdAndUpdate(
         savedProduct._id,
         { inventory: newInventory._id },
         { new: true }
      );

      if (!updatedProduct) {
         // Clean up the created inventory if product update fails
         await Inventory.findByIdAndDelete(newInventory._id);
         return res.status(400).json({
            success: false,
            message: "Failed to update product with inventory ID",
         });
      }

      return res.status(201).json({
         success: true,
         message: "Product added successfully",
         product: savedProduct
      });
   } catch (error) {
      console.error("Error adding product:", error);

      if (error.name === 'ValidationError') {
         const validationErrors = {};

         for (const field in error.errors) {
            validationErrors[field] = error.errors[field].message;
         }

         return res.status(400).json({
            success: false,
            message: "Validation error",
            fieldErrors: validationErrors
         });
      }

      return res.status(500).json({
         success: false,
         message: "Failed to add product",
         error: "Server error"
      });
   }
};

export const addCollection = async (req, res) => {
   try {
      const userId = req.userId;
      if (!userId) {
         return res.status(401).json({
            success: false,
            message: "Unauthorized: Authentication required"
         });
      }

      const collection = req.body;
      if (!collection) {
         return res.status(400).json({
            success: false,
            message: "Collection data is required"
         });
      }

      const sanitizedResult = sanitizedCollection(collection);

      if (!sanitizedResult.valid) {
         return res.status(400).json({
            success: false,
            message: "Product validation failed",
            fieldErrors: sanitizedResult.errors,
            exception: sanitizedResult.exception
         });
      }

      const sanitizedCollectionData = sanitizedResult.data;

      const existingCollection = await Collection.findOne({ slug: sanitizedCollectionData.slug });
      if (existingCollection) {
         return res.status(400).json({
            success: false,
            message: "A collection with this slug already exists",
         });
      }

      const newCollection = new Collection(sanitizedCollectionData);
      const savedCollection = await newCollection.save();

      if (!savedCollection) {
         return res.status(400).json({
            success: false,
            message: "Failed to save collection",
         });
      }

      // save sollection id to products collections[]
      const updatedProduct = await Product.updateMany(
         { _id: { $in: sanitizedCollectionData.products } },
         { $addToSet: { collections: savedCollection._id } }
      );
      if (!updatedProduct) {
         return res.status(400).json({
            success: false,
            message: "Failed to update products with collection ID",
         });
      }
      return res.status(201).json({
         success: true,
         message: "Collection added successfully",
         collection: savedCollection
      });
   } catch (error) {
      return res.status(500).json({
         success: false,
         message: "Failed to add product",
         error: "Server error"
      });
   }
};

export const addOffer = async (req, res) => {
   try {
      const userId = req.userId;
      if (!userId) {
         return res.status(401).json({
            success: false,
            message: "Unauthorized: Authentication required"
         });
      }

      const offer = req.body;
      if (!offer) {
         return res.status(400).json({
            success: false,
            message: "Offer data is required"
         });
      }

      const sanitizedResult = sanitizedOffer(offer);
      if (!sanitizedResult.valid) {
         return res.status(400).json({
            success: false,
            message: "Offer validation failed",
            fieldErrors: sanitizedResult.errors,
            exception: sanitizedResult.exception
         });
      }

      const sanitizedOfferData = sanitizedResult.data;

      const existingOffer = await Offer.findOne({ offerCode: sanitizedOfferData.offerCode });
      if (existingOffer) {
         return res.status(400).json({
            success: false,
            message: "An offer with this code already exists",
            fieldErrors: { offerCode: "This offer code is already in use" }
         });
      }

      if (!sanitizedOfferData.products || !Array.isArray(sanitizedOfferData.products) || sanitizedOfferData.products.length === 0) {
         return res.status(400).json({
            success: false,
            message: "Products array is required and cannot be empty",
            fieldErrors: { products: "At least one product must be selected for the offer" }
         });
      }

      const products = await Product.find({ _id: { $in: sanitizedOfferData.products } });
      if (products.length !== sanitizedOfferData.products.length) {
         return res.status(400).json({
            success: false,
            message: "One or more product IDs are invalid",
            fieldErrors: { products: "Some product IDs do not exist in the database" }
         });
      }

      const productsWithOffers = products.filter(product => product.offer !== null);
      if (productsWithOffers.length > 0) {
         return res.status(400).json({
            success: false,
            message: "Some products already have offers assigned",
            fieldErrors: {
               products: "The following products already have offers: " +
                  productsWithOffers.map(p => p.title).join(', ')
            }
         });
      }

      const newOffer = new Offer(sanitizedOfferData);
      const savedOffer = await newOffer.save();

      await Product.updateMany(
         { _id: { $in: sanitizedOfferData.products } },
         { $set: { offer: savedOffer._id } }
      );

      return res.status(201).json({
         success: true,
         message: "Offer added successfully and assigned to products",
         offer: savedOffer
      });
   } catch (error) {
      console.error("Error adding offer:", error);

      if (error.name === 'ValidationError') {
         const validationErrors = {};

         for (const field in error.errors) {
            validationErrors[field] = error.errors[field].message;
         }

         return res.status(400).json({
            success: false,
            message: "Validation error",
            fieldErrors: validationErrors
         });
      }

      return res.status(500).json({
         success: false,
         message: "Failed to add offer",
         error: "Server error"
      });
   }
};

export const updateProduct = async (req, res) => {
   try {
      const userId = req.userId;
      if (!userId) {
         return res.status(401).json({
            success: false,
            message: "Unauthorized: Authentication required"
         });
      }

      const { slug } = req.params;
      if (!slug) {
         return res.status(400).json({
            success: false,
            message: "Product slug is required"
         });
      }

      const updateData = req.body;

      if (!updateData || Object.keys(updateData).length === 0) {
         return res.status(400).json({
            success: false,
            message: "Update data is required"
         });
      }

      const existingProduct = await Product.findOne({ slug });
      if (!existingProduct) {
         return res.status(404).json({
            success: false,
            message: "Product not found"
         });
      }

      const errors = {};

      if (updateData.title !== undefined) {
         if (typeof updateData.title !== 'string' || !updateData.title.trim()) {
            errors.title = "Title must be a non-empty string";
         }
      }

      if (updateData.price !== undefined) {
         const parsedPrice = Number(updateData.price);
         if (isNaN(parsedPrice) || parsedPrice < 0) {
            errors.price = "Price must be a positive number";
         } else {
            updateData.price = parsedPrice;
         }
      }

      if (updateData.size !== undefined) {
         if (!Array.isArray(updateData.size)) {
            errors.size = "Size must be an array";
         } else {
            const validSizes = ['S', 'M', 'L', 'XL', 'XXL'];
            const validSizeValues = updateData.size.filter(size => validSizes.includes(size));

            if (updateData.size.length > 0 && validSizeValues.length === 0) {
               errors.size = "Size must contain at least one valid value: S, M, L, XL, XXL";
            }
         }
      }

      if (Object.keys(errors).length > 0) {
         return res.status(400).json({
            success: false,
            message: "Validation failed",
            fieldErrors: errors
         });
      }

      if (updateData.collections && updateData.collections.length > 0) {
         const collectionsExist = await Collection.find({
            _id: { $in: updateData.collections }
         });

         if (collectionsExist.length !== updateData.collections.length) {
            return res.status(400).json({
               success: false,
               message: "Validation failed",
               fieldErrors: { collections: "One or more collection IDs are invalid" }
            });
         }
      }

      const updatedProduct = await Product.findByIdAndUpdate(
         existingProduct._id,
         { $set: updateData },
         { new: true, runValidators: true }
      );

      if (updateData.collections) {
         await Collection.updateMany(
            { _id: { $nin: updateData.collections }, products: existingProduct._id },
            { $pull: { products: existingProduct._id } }
         );

         await Collection.updateMany(
            { _id: { $in: updateData.collections } },
            { $addToSet: { products: existingProduct._id } }
         );
      }

      return res.status(200).json({
         success: true,
         message: "Product updated successfully",
         product: updatedProduct
      });

   } catch (error) {
      console.error("Error updating product:", error);

      if (error.name === 'ValidationError') {
         const validationErrors = {};
         for (const field in error.errors) {
            validationErrors[field] = error.errors[field].message;
         }

         return res.status(400).json({
            success: false,
            message: "Validation error",
            fieldErrors: validationErrors
         });
      }

      return res.status(500).json({
         success: false,
         message: "Failed to update product",
         error: error.message || "Server error"
      });
   }
};

export const updateCollection = async (req, res) => {
   try {
      const userId = req.userId;
      if (!userId) {
         return res.status(401).json({
            success: false,
            message: "Unauthorized: Authentication required"
         });
      }

      const { slug } = req.params;
      if (!slug) {
         return res.status(400).json({
            success: false,
            message: "Collection slug is required"
         });
      }

      const updateData = req.body;

      if (!updateData || Object.keys(updateData).length === 0) {
         return res.status(400).json({
            success: false,
            message: "Update data is required"
         });
      }

      const existingCollection = await Collection.findOne({ slug });
      if (!existingCollection) {
         return res.status(404).json({
            success: false,
            message: "Collection not found"
         });
      }

      const errors = {};

      // Validate fields as before...
      if (updateData.name !== undefined) {
         if (typeof updateData.name !== 'string' || !updateData.name.trim()) {
            errors.name = "Name must be a non-empty string";
         }
      }

      // Rest of your validation checks...

      if (Object.keys(errors).length > 0) {
         return res.status(400).json({
            success: false,
            message: "Validation failed",
            fieldErrors: errors
         });
      }

      // Handle products relationship updates
      if (updateData.products) {
         // Make sure we're working with strings for comparison
         const existingProductIds = existingCollection.products.map(id => id.toString());

         // Check if products is actually an array of strings
         if (!Array.isArray(updateData.products) ||
            updateData.products.some(id => typeof id !== 'string')) {
            return res.status(400).json({
               success: false,
               message: "Products must be an array of string IDs",
            });
         }

         const productsToRemove = existingProductIds.filter(
            productId => !updateData.products.includes(productId)
         );

         const productsToAdd = updateData.products.filter(
            productId => !existingProductIds.includes(productId)
         );

         try {
            if (productsToRemove.length > 0) {
               await Product.updateMany(
                  { _id: { $in: productsToRemove } },
                  { $pull: { collections: existingCollection._id } }
               );
            }

            if (productsToAdd.length > 0) {
               await Product.updateMany(
                  { _id: { $in: productsToAdd } },
                  { $addToSet: { collections: existingCollection._id } }
               );
            }
         } catch (productUpdateError) {
            console.error("Error updating product-collection relationships:", productUpdateError);
            return res.status(500).json({
               success: false,
               message: "Failed to update product-collection relationships",
               error: productUpdateError.message
            });
         }
      }

      // Clone updateData to avoid modifying the original when updating
      const cleanedUpdateData = { ...updateData };

      // We need to rename 'products' to match the schema field if it's included
      if (cleanedUpdateData.productIds) {
         cleanedUpdateData.products = cleanedUpdateData.productIds;
         delete cleanedUpdateData.productIds; // Remove the incorrect field
      }

      // Convert potential numbers back to strings for safety
      if (cleanedUpdateData.products) {
         cleanedUpdateData.products = cleanedUpdateData.products.map(id => id.toString());
      }

      try {
         const updatedCollection = await Collection.findByIdAndUpdate(
            existingCollection._id,
            { $set: cleanedUpdateData },
            { new: true, runValidators: true }
         );

         return res.status(200).json({
            success: true,
            message: "Collection updated successfully",
            collection: updatedCollection
         });
      } catch (updateError) {
         console.error("Error updating collection document:", updateError);
         return res.status(500).json({
            success: false,
            message: "Failed to update collection document",
            error: updateError.message
         });
      }
   } catch (error) {
      console.error("Error updating collection:", error);

      if (error.name === 'ValidationError') {
         const validationErrors = {};
         for (const field in error.errors) {
            validationErrors[field] = error.errors[field].message;
         }
         return res.status(400).json({
            success: false,
            message: "Validation error",
            fieldErrors: validationErrors
         });
      }

      return res.status(500).json({
         success: false,
         message: "Failed to update collection",
         error: error.message || "Server error"
      });
   }
};

export const updateOffer = async (req, res) => {
   try {
      const userId = req.userId;
      if (!userId) {
         return res.status(401).json({
            success: false,
            message: "Unauthorized: Authentication required"
         });
      }

      const { slug } = req.params;
      if (!slug) {
         return res.status(400).json({
            success: false,
            message: "Offer code is required"
         });
      }

      const updateData = req.body;
      if (!updateData || Object.keys(updateData).length === 0) {
         return res.status(400).json({
            success: false,
            message: "Update data is required"
         });
      }

      const existingOffer = await Offer.findOne({ offerCode: slug });
      if (!existingOffer) {
         return res.status(404).json({
            success: false,
            message: "Offer not found"
         });
      }

      const errors = {};

      if (updateData.offerName !== undefined) {
         if (typeof updateData.offerName !== 'string' || !updateData.offerName.trim()) {
            errors.offerName = "Offer name is required";
         } else if (updateData.offerName.trim().length < 3) {
            errors.offerName = "Offer name must be at least 3 characters";
         } else if (updateData.offerName.trim().length > 50) {
            errors.offerName = "Offer name cannot exceed 50 characters";
         }
      }

      if (updateData.discountValue !== undefined) {
         const parsedDiscount = Number(updateData.discountValue);
         if (isNaN(parsedDiscount) || parsedDiscount <= 0) {
            errors.discountValue = "Discount must be a positive number";
         } else if (parsedDiscount > 100) {
            errors.discountValue = "Discount cannot exceed 100%";
         } else {
            updateData.discountValue = parsedDiscount;
         }
      }

      if (updateData.startDate !== undefined && updateData.endDate !== undefined) {
         const startDate = new Date(updateData.startDate);
         const endDate = new Date(updateData.endDate);

         if (isNaN(startDate.getTime())) {
            errors.startDate = "Invalid start date format";
         }

         if (isNaN(endDate.getTime())) {
            errors.endDate = "Invalid end date format";
         }

         if (!errors.startDate && !errors.endDate && startDate >= endDate) {
            errors.endDate = "End date must be after start date";
         }
      } else if (updateData.startDate !== undefined) {
         const startDate = new Date(updateData.startDate);
         const existingEndDate = new Date(existingOffer.endDate);

         if (isNaN(startDate.getTime())) {
            errors.startDate = "Invalid start date format";
         } else if (startDate >= existingEndDate) {
            errors.startDate = "Start date must be before the existing end date";
         }
      } else if (updateData.endDate !== undefined) {
         const endDate = new Date(updateData.endDate);
         const existingStartDate = new Date(existingOffer.startDate);

         if (isNaN(endDate.getTime())) {
            errors.endDate = "Invalid end date format";
         } else if (existingStartDate >= endDate) {
            errors.endDate = "End date must be after the existing start date";
         }
      }

      if (updateData.products !== undefined) {
         if (!Array.isArray(updateData.products) || updateData.products.length === 0) {
            errors.products = "At least one product must be selected for the offer";
         } else {
            // Validate that all product IDs exist
            const products = await Product.find({ _id: { $in: updateData.products } });
            if (products.length !== updateData.products.length) {
               errors.products = "One or more product IDs are invalid";
            } else {
               // Find products with different offers - but don't block the update
               const productsWithDifferentOffers = await Product.find({
                  _id: { $in: updateData.products },
                  offer: { $ne: null, $ne: existingOffer._id }
               });

               // Instead of error, just prepare a notification about which offers will be replaced
               if (productsWithDifferentOffers.length > 0) {
                  // This will be used later in the response message
                  updateData._productsWithReplacedOffers = productsWithDifferentOffers.map(p => p.title);
               }
            }
         }
      }

      if (Object.keys(errors).length > 0) {
         return res.status(400).json({
            success: false,
            message: "Validation failed",
            fieldErrors: errors
         });
      }

      if (updateData.products) {
         const existingProductIds = existingOffer.products.map(id => id.toString());

         const productsToRemove = existingProductIds.filter(
            productId => !updateData.products.includes(productId)
         );

         const productsToAdd = updateData.products.filter(
            productId => !existingProductIds.includes(productId)
         );

         if (productsToRemove.length > 0) {
            await Product.updateMany(
               { _id: { $in: productsToRemove } },
               { $set: { offer: null } }
            );
         }

         if (productsToAdd.length > 0) {
            const productsWithExistingOffers = await Product.find({
               _id: { $in: productsToAdd },
               offer: { $ne: null, $ne: existingOffer._id }
            });

            const replacedOfferIds = [...new Set(productsWithExistingOffers.map(p => p.offer))];

            await Product.updateMany(
               { _id: { $in: productsToAdd } },
               { $set: { offer: existingOffer._id } }
            );

            if (replacedOfferIds.length > 0) {
               await Offer.updateMany(
                  { _id: { $in: replacedOfferIds } },
                  { $pull: { products: { $in: productsToAdd } } }
               );
            }
         }

         if (updateData._productsWithReplacedOffers) {
            delete updateData._productsWithReplacedOffers;
         }
      }

      const updatedOffer = await Offer.findByIdAndUpdate(
         existingOffer._id,
         { $set: updateData },
         { new: true, runValidators: true }
      );

      // Improved response with information about replaced offers if any
      let message = "Offer updated successfully";
      if (updateData._productsWithReplacedOffers && updateData._productsWithReplacedOffers.length > 0) {
         message += `. The following products had their previous offers replaced: ${updateData._productsWithReplacedOffers.join(', ')}`;
      }

      return res.status(200).json({
         success: true,
         message: message,
         offer: updatedOffer
      });

   } catch (error) {
      console.error("Error updating offer:", error);

      if (error.name === 'ValidationError') {
         const validationErrors = {};
         for (const field in error.errors) {
            validationErrors[field] = error.errors[field].message;
         }

         return res.status(400).json({
            success: false,
            message: "Validation error",
            fieldErrors: validationErrors
         });
      }

      return res.status(500).json({
         success: false,
         message: "Failed to update offer",
         error: error.message || "Server error"
      });
   }
};

export const getHomeContent = async (req, res) => {
   try {
      // Find home content without populating relationships
      let homeContent = await HomeContent.findOne();

      if (!homeContent) {
         homeContent = await HomeContent.create({
            heroBannerImages: [],
            exclusiveProducts: [],
            newArrivals: [],
            collections: [],
            offerFeatured: [],
            alltimeBestSellers: null,
            womenFeatured: []
         });
      }

      // Transform the response to include only IDs
      const responseData = {
         heroBannerImages: homeContent.heroBannerImages || [],
         exclusiveProducts: homeContent.exclusiveProducts?.map(item => item.productId) || [],
         newArrivals: homeContent.newArrivals?.map(item => item.productId) || [],
         collections: homeContent.collections || [],
         offerFeatured: homeContent.offerFeatured || [],
         alltimeBestSellers: homeContent.alltimeBestSellers || null,
         womenFeatured: homeContent.womenFeatured?.map(item => item.productId) || [],
         _id: homeContent._id,
         createdAt: homeContent.createdAt,
         updatedAt: homeContent.updatedAt
      };

      return res.status(200).json({
         success: true,
         message: "Home content fetched successfully",
         homeContent: responseData
      });
   } catch (error) {
      console.error("Error fetching home content:", error);
      return res.status(500).json({
         success: false,
         message: "Failed to fetch home content",
         error: error.message || "Server error"
      });
   }
};

// Update entire home content
export const updateHomeContent = async (req, res) => {
   try {
      const {
         heroBannerImages,
         exclusiveProducts,
         newArrivals,
         collections,
         offerFeatured,
         alltimeBestSellers,
         womenFeatured
      } = req.body;

      let homeContent = await HomeContent.findOne();

      if (!homeContent) {
         homeContent = new HomeContent({});
      }

      // Only update fields that are provided
      if (heroBannerImages) homeContent.heroBannerImages = heroBannerImages;
      if (exclusiveProducts) homeContent.exclusiveProducts = exclusiveProducts;
      if (newArrivals) homeContent.newArrivals = newArrivals;
      if (collections) homeContent.collections = collections;

      if (offerFeatured) homeContent.offerFeatured = offerFeatured;
      if (alltimeBestSellers) homeContent.alltimeBestSellers = alltimeBestSellers;
      if (womenFeatured) homeContent.womenFeatured = womenFeatured;

      homeContent.lastUpdated = new Date();
      await homeContent.save();

      return res.status(200).json({
         success: true,
         message: "Home content updated successfully",
         homeContent
      });
   } catch (error) {
      console.error("Error updating home content:", error);
      return res.status(500).json({
         success: false,
         message: "Failed to update home content",
         error: error.message || "Server error"
      });
   }
};

// remove image from cloudinary by public_id
export const removeSingleImage = async (req, res) => {
   try {
      const { imageId } = req.params;
      await deleteFromCloudinary(res.imageId);

   } catch (error) {
      console.error("Error removing image:", error);
      return res.status(500).json({
         success: false,
         message: "Failed to remove image",
         error: error.message || "Server error"
      });
   }
};

// get all inventory
export const getInventorys = async (req, res) => {
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

      const inventory = await Inventory.find()
         .populate({ path: "productId", select: "title slug" })
         .skip(skip)
         .limit(limit)
         .sort({ createdAt: -1 })

      if (!inventory || inventory.length === 0) {
         return res.status(404).json({
            success: false,
            message: "No inventory found",
         });
      }

      const totalInventory = await Inventory.countDocuments();
      if (!totalInventory) {
         return res.status(404).json({
            success: false,
            message: "No inventory found",
         });
      }

      return res.status(200).json({
         success: true,
         message: "Inventory fetched successfully",
         inventory,
         totalPages: Math.ceil(totalInventory / limit),
         currentPage: page,
         totalItems: totalInventory
      });

   } catch (error) {
      console.error("Error fetching inventory:", error);
      return res.status(500).json({
         success: false,
         message: "Failed to fetch inventory",
         error: error.message || "Server error"
      });
   }
};

// get inventory by slug
export const getInventoryBySlug = async (req, res) => {
   try {
      const { slug } = req.params;
      if (!slug) {
         return res.status(400).json({
            success: false,
            message: "Product slug is required"
         });
      }

      const inventory = await Inventory.findById(slug)
         .populate({ path: "productId", select: "title slug" });

      if (!inventory) {
         return res.status(404).json({
            success: false,
            message: "Inventory not found"
         });
      }

      return res.status(200).json({
         success: true,
         message: "Inventory fetched successfully",
         inventory
      });

   } catch (error) {
      return res.status(500).json({
         success: false,
         message: "Internal server error",
      });
   }
};

// update inventory by slug
export const updateInventory = async (req, res) => {
   try {
      const userId = req.userId;
      if (!userId) {
         return res.status(401).json({
            success: false,
            message: "Unauthorized: Authentication required"
         });
      }

      const { slug } = req.params;
      if (!slug) {
         return res.status(400).json({
            success: false,
            message: "Product slug is required"
         });
      }

      const { stocks } = req.body;
      if (!stocks || !Array.isArray(stocks) || stocks.length === 0) {
         return res.status(400).json({
            success: false,
            message: "Stocks data is required and must be a non-empty array"
         });
      }

      const validSizes = ["S", "M", "L", "XL", "XXL"];
      const errors = [];

      for (const item of stocks) {
         if (!item.size || !validSizes.includes(item.size)) {
            errors.push(`Invalid size: ${item.size}. Must be one of: S, M, L, XL, XXL`);
         }

         if (item.quantity === undefined || isNaN(parseInt(item.quantity)) || parseInt(item.quantity) < 0) {
            errors.push(`Invalid quantity for size ${item.size}: ${item.quantity}. Must be a non-negative number`);
         }
      }

      if (errors.length > 0) {
         return res.status(400).json({
            success: false,
            message: "Validation errors",
            errors
         });
      }

      const inventory = await Inventory.findById(slug)
      if (!inventory) {
         return res.status(404).json({
            success: false,
            message: "Inventory not found for this product"
         });
      }

      for (const newStock of stocks) {
         const stockIndex = inventory.stocks.findIndex(s => s.size === newStock.size);

         if (stockIndex >= 0) {
            inventory.stocks[stockIndex].quantity = parseInt(newStock.quantity);
         } else {
            // Add new size if it doesn't exist
            inventory.stocks.push({
               size: newStock.size,
               quantity: parseInt(newStock.quantity)
            });
         }
      }

      inventory.totalQuantity = inventory.stocks.reduce((total, stock) => total + stock.quantity, 0);

      await inventory.save();

      return res.status(200).json({
         success: true,
         message: "Inventory updated successfully",
         inventory
      });
   } catch (error) {
      console.error("Error updating inventory:", error);
      return res.status(500).json({
         success: false,
         message: "Failed to update inventory",
         error: error.message || "Internal server error"
      });
   }
}

// fetch orders with complex query
export const getOrders = async (req, res) => {
   try {
      const {
         page = 1,
         limit = 10,
         sort = "-createdAt",
         status,
         paymentStatus,
         orderType,
         startDate,
         endDate,
         minAmount,
         maxAmount,
         search,
         trackId,
         userId
      } = req.query;

      // console.log("Query parameters:", req.query);

      // Build filter object
      const filter = {};

      // Filter by order status
      if (status && ["Processing", "Shipped", "Delivered", "Cancelled", "Returned"].includes(status)) {
         filter.orderStatus = status;
      }

      // Filter by payment status
      if (paymentStatus && ["paid", "unpaid"].includes(paymentStatus)) {
         filter.paymentStatus = paymentStatus;
      }

      // Filter by order type
      if (orderType && ["COD", "ONLINE", "COD+ONLINE"].includes(orderType)) {
         filter.orderType = orderType;
      }

      // Filter by date range
      if (startDate || endDate) {
         filter.createdAt = {};

         if (startDate) {
            filter.createdAt.$gte = new Date(startDate);
         }

         if (endDate) {
            // Set time to end of day for the end date
            const endOfDay = new Date(endDate);
            endOfDay.setHours(23, 59, 59, 999);
            filter.createdAt.$lte = endOfDay;
         }
      }

      // Filter by price range
      if (minAmount || maxAmount) {
         filter.payableAmount = {};

         if (minAmount) {
            filter.payableAmount.$gte = Number(minAmount);
         }

         if (maxAmount) {
            filter.payableAmount.$lte = Number(maxAmount);
         }
      }

      // Filter by track ID
      if (trackId) {
         filter.trackId = { $regex: trackId, $options: "i" };
      }

      // Filter by user ID
      if (userId && mongoose.Types.ObjectId.isValid(userId)) {
         filter.user = new mongoose.Types.ObjectId(userId);
      }

      // Search functionality (search in product titles, user details via address)
      if (search) {
         const searchRegex = { $regex: search, $options: "i" };

         filter.$or = [
            { "purchaseProducts.title": searchRegex },
            { trackId: searchRegex }
         ];
      }

      // Calculate pagination
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      // Execute query with pagination and populate necessary fields
      const orders = await Order.find(filter)
         .populate({
            path: "user",
            select: "name email phoneNumber"
         })
         .populate({
            path: "deliveryAddress",
            select: "name address city state zipCode phoneNumber"
         })
         .populate({
            path: "paymentData",
            select: "paymentStatus paymentMethod transactionId receiptUrl paymentDate amount"
         })
         .sort(sort)
         .skip(skip)
         .limit(limitNum)
         .lean();

      // Get total count for pagination info
      const totalOrders = await Order.countDocuments(filter);
      const totalPages = Math.ceil(totalOrders / limitNum);

      // Format response
      return res.status(200).json({
         success: true,
         message: "Orders fetched successfully",
         currentPage: pageNum,
         totalPages,
         totalOrders,
         limit: limitNum,
         orders
      });
   } catch (error) {
      console.error("Error fetching orders:", error);
      return res.status(500).json({
         success: false,
         message: "Failed to fetch orders",
         error: error.message || "Internal server error"
      });
   }
};

// update order status
export const updateOrder = async (req, res) => {
   try {
      const userId = req.userId;
      if (!userId) {
         return res.status(401).json({
            success: false,
            message: "Unauthorized: Authentication required"
         });
      }

      // check user is exist or not
      const isUserExist = await User.findOne({ clerkId: userId });
      if (!isUserExist) {
         return res.status(404).json({
            success: false,
            message: "User not found"
         });
      }

      const { id } = req.params;
      if (!id) {
         return res.status(400).json({
            success: false,
            message: "Order ID is required"
         });
      }

      // check order is exist or not 
      const order = await Order.findById(id);
      if (!order) {
         return res.status(404).json({
            success: false,
            message: "Order not found"
         });
      }

      const {
         markAsShipped,
         markAsDelivered,
         markAsCancelled,
         markAsReturned,
      } = req.body;

      // Ensure only one action is requested
      const requestedActions = [markAsShipped, markAsDelivered, markAsCancelled, markAsReturned]
         .filter(action => action === true).length;

      if (requestedActions === 0) {
         return res.status(400).json({
            success: false,
            message: "At least one action is required"
         });
      }

      if (requestedActions > 1) {
         return res.status(400).json({
            success: false,
            message: "Only one action can be performed at a time"
         });
      }

      // Update based on requested action
      const updateData = {};
      let actionMessage = "";

      if (markAsShipped) {
         // Can only mark as shipped if currently in processing
         if (order.orderStatus !== "Processing") {
            return res.status(400).json({
               success: false,
               message: `Cannot mark as shipped. Current status is: ${order.orderStatus}`
            });
         }

         updateData.orderStatus = "Shipped";
         updateData.orderShippedTime = new Date();
         actionMessage = "Order marked as shipped successfully";
      }
      else if (markAsDelivered) {
         // Can only mark as delivered if currently shipped
         if (order.orderStatus !== "Shipped") {
            return res.status(400).json({
               success: false,
               message: `Cannot mark as delivered. Current status is: ${order.orderStatus}`
            });
         }

         updateData.orderStatus = "Delivered";
         updateData.orderDeliveredTime = new Date();
         actionMessage = "Order marked as delivered successfully";
      }
      else if (markAsCancelled) {
         // Can't cancel if already delivered or returned
         if (["Delivered", "Returned"].includes(order.orderStatus)) {
            return res.status(400).json({
               success: false,
               message: `Cannot cancel order. Current status is: ${order.orderStatus}`
            });
         }

         updateData.orderStatus = "Cancelled";
         updateData.orderCancelledTime = new Date();
         actionMessage = "Order cancelled successfully";
      }
      else if (markAsReturned) {
         if (order.orderStatus !== "Delivered") {
            return res.status(400).json({
               success: false,
               message: `Cannot mark as returned. Current status is: ${order.orderStatus}`
            });
         }

         updateData.orderStatus = "Returned";
         updateData.orderReturnedTime = new Date();
         actionMessage = "Order marked as returned successfully";
      }

      const updatedOrder = await Order.findByIdAndUpdate(
         order._id,
         { $set: updateData },
         { new: true }
      )

      if (!updatedOrder) {
         return res.status(404).json({
            success: false,
            message: "Failed to update order"
         });
      }

      return res.status(200).json({
         success: true,
         message: actionMessage,
         order: updatedOrder
      });

   } catch (error) {
      return res.status(500).json({
         success: false,
         message: "Failed to update order",
         error: error.message || "Internal server error"
      });
   }
};

// get all reviews by pagination
export const getReviews = async (req, res) => {
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

      const reviews = await Review.find()
         .populate({ path: "userId", select: "fullName" })
         .populate({ path: "productId", select: "title slug" })
         .skip(skip)
         .limit(limit)
         .sort({ createdAt: -1 })

      if (!reviews || reviews.length === 0) {
         return res.status(404).json({
            success: false,
            message: "No reviews found",
         });
      }

      const totalReviews = await Review.countDocuments();
      if (!totalReviews) {
         return res.status(404).json({
            success: false,
            message: "No reviews found",
         });
      }

      return res.status(200).json({
         success: true,
         message: "Reviews fetched successfully",
         reviews,
         totalPages: Math.ceil(totalReviews / limit),
         currentPage: page,
         totalItems: totalReviews
      });

   } catch (error) {
      console.error("Error fetching reviews:", error);
      return res.status(500).json({
         success: false,
         message: "Failed to fetch reviews",
         error: error.message || "Server error"
      });
   }
}

/// get all customers
export const getCustomers = async (req, res) => {
   try {
      const {
         page = 1,
         limit = 10,
         search,
         sort = "-createdAt"
      } = req.query;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      if (pageNum < 1 || limitNum < 1) {
         return res.status(400).json({
            success: false,
            message: "Invalid pagination parameters.",
         });
      }

      const skip = (pageNum - 1) * limitNum;

      // Build filter object
      const filter = { role: "user" };

      // Add search functionality
      if (search) {
         const searchRegex = { $regex: search, $options: "i" };
         filter.$or = [
            { fullName: searchRegex },
            { email: searchRegex },
            { phone: searchRegex }
         ];
      }

      // Execute query with optimizations
      const customers = await User.find(filter)
         .select("clerkId fullName email phone avatar createdAt")
         .skip(skip)
         .limit(limitNum)
         .sort(sort)
         .lean();

      if (!customers || customers.length === 0) {
         return res.status(200).json({
            success: true,
            message: "No customers found",
            customers: [],
            totalPages: 0,
            currentPage: pageNum,
            totalItems: 0
         });
      }

      const totalCustomers = await User.countDocuments(filter);

      return res.status(200).json({
         success: true,
         message: "Customers fetched successfully",
         customers,
         totalPages: Math.ceil(totalCustomers / limitNum),
         currentPage: pageNum,
         totalItems: totalCustomers
      });
   } catch (error) {
      console.error("Error fetching customers:", error);
      return res.status(500).json({
         success: false,
         message: "Failed to fetch customers",
         error: error.message || "Server error"
      });
   }
}

// dashbord stats
export const getDashboardStats = async (req, res) => {
   try {
      const userId = req.userId;
      if (!userId) {
         return res.status(401).json({
            success: false,
            message: "Unauthorized: Authentication required"
         });
      }

      // Calculate date for 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // 1. Total revenue in last 30 days - calculated from Payment collection
      const revenueData = await Payment.aggregate([
         {
            $match: {
               paymentDate: { $gte: thirtyDaysAgo },
               paymentStatus: 'succeeded'
            }
         },
         {
            $group: {
               _id: null,
               totalRevenue: { $sum: "$amount" }
            }
         }
      ]);

      const totalRevenue = revenueData[0]?.totalRevenue || 0;

      // 2. Total products delivered in last 30 days
      const deliveredProductsData = await Order.aggregate([
         {
            $match: {
               orderStatus: 'Delivered',
               orderDeliveredTime: { $gte: thirtyDaysAgo }
            }
         },
         {
            $unwind: "$purchaseProducts"
         },
         {
            $group: {
               _id: null,
               totalProductsDelivered: { $sum: "$purchaseProducts.quantity" }
            }
         }
      ]);

      const totalProductsDelivered = deliveredProductsData[0]?.totalProductsDelivered || 0;

      // 3. Total customers
      const totalCustomers = await User.countDocuments({ role: 'user' });

      // 4. Total inventory stocks - get total products in stock
      const inventoryData = await Inventory.aggregate([
         {
            $match: {
               "stocks.quantity": { $gt: 0 }  // Only count items with stock > 0
            }
         },
         {
            $group: {
               _id: null,
               totalStock: { $sum: "$totalQuantity" },
               totalProducts: { $sum: 1 }
            }
         }
      ]);

      const totalInventoryStock = inventoryData[0]?.totalStock || 0;

      return res.status(200).json({
         success: true,
         message: "Dashboard stats fetched successfully",
         stats: {
            revenueInLast30Days: totalRevenue,
            productsDeliveredInLast30Days: totalProductsDelivered,
            totalCustomers: totalCustomers,
            totalInventoryStock: totalInventoryStock,
         }
      });
   } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return res.status(500).json({
         success: false,
         message: "Failed to fetch dashboard stats",
         error: error.message || "Server error"
      });
   }
}