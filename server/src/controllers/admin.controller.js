import { Collection } from "../models/collection.model.js";
import { Product } from "../models/product.model.js";
import { Offer } from "../models/offer.model.js";
import { sanitizedCollection, sanitizedOffer, sanitizedProduct } from "../utils/checkValidation.js";

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
         error: process.env.NODE_ENV === 'development' ? error.message : "Server error"
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

      return res.status(201).json({
         success: true,
         message: "Collection added successfully",
         collection: savedCollection
      });
   } catch (error) {
      return res.status(500).json({
         success: false,
         message: "Failed to add product",
         error: process.env.NODE_ENV === 'development' ? error.message : "Server error"
      });
   }
}

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
         error: process.env.NODE_ENV === 'development' ? error.message : "Server error"
      });
   }
};