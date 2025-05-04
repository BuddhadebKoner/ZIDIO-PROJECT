import { Collection } from "../models/collection.model.js";
import { Product } from "../models/product.model.js";
import { Offer } from "../models/offer.model.js";
import { sanitizedCollection, sanitizedOffer, sanitizedProduct } from "../utils/checkValidation.js";
import { HomeContent } from "../models/homecontent.model.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";
import { Inventory } from "../models/inventory.model.js";

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