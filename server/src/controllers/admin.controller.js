import { Collection } from "../models/collection.model.js";
import { Product } from "../models/product.model.js";
import { sanitizedCollection, sanitizedProduct } from "../utils/checkValidation.js";

export const addProduct = async (req, res) => {
   try {
      const userId = req.userId;
      if (!userId) {
         return res.status(401).json({
            success: false,
            message: "Unauthorized: Authentication required"
         });
      }

      // Get product data from the request body
      const product = req.body;

      if (!product) {
         return res.status(400).json({
            success: false,
            message: "Product data is required"
         });
      }

      // Validate and sanitize the product data
      const sanitizedResult = sanitizedProduct(product);

      if (!sanitizedResult.valid) {
         // Return field-specific validation errors for better UX
         return res.status(400).json({
            success: false,
            message: "Product validation failed",
            fieldErrors: sanitizedResult.errors,
            exception: sanitizedResult.exception
         });
      }

      // Extract the sanitized product data
      const sanitizedProductData = sanitizedResult.data;

      // Check if product with this slug already exists
      const existingProduct = await Product.findOne({ slug: sanitizedProductData.slug });
      if (existingProduct) {
         return res.status(400).json({
            success: false,
            message: "A product with this slug already exists",
            fieldErrors: { slug: "This slug is already in use" }
         });
      }

      // Create a new product document
      const newProduct = new Product(sanitizedProductData);

      // Save the product to the database
      const savedProduct = await newProduct.save();

      return res.status(201).json({
         success: true,
         message: "Product added successfully",
         product: savedProduct
      });
   } catch (error) {
      console.error("Error adding product:", error);

      // Handle Mongoose validation errors specially
      if (error.name === 'ValidationError') {
         const validationErrors = {};

         // Extract field-specific error messages
         for (const field in error.errors) {
            validationErrors[field] = error.errors[field].message;
         }

         return res.status(400).json({
            success: false,
            message: "Validation error",
            fieldErrors: validationErrors
         });
      }

      // Handle other errors
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

      // Get collection data from the request body
      const collection = req.body;
      if (!collection) {
         return res.status(400).json({
            success: false,
            message: "Collection data is required"
         });
      }

      const sanitizedResult = sanitizedCollection(collection);

      if (!sanitizedResult.valid) {
         // Return field-specific validation errors for better UX
         return res.status(400).json({
            success: false,
            message: "Product validation failed",
            fieldErrors: sanitizedResult.errors,
            exception: sanitizedResult.exception
         });
      }

      // extract the sanitized collection data
      const sanitizedCollectionData = sanitizedResult.data;

      // Check if collection with this slug already exists
      const existingCollection = await Collection.findOne({ slug: sanitizedCollectionData.slug });
      if (existingCollection) {
         return res.status(400).json({
            success: false,
            message: "A collection with this slug already exists",
         });
      }

      // Create a new collection document
      const newCollection = new Collection(sanitizedCollectionData);
      // Save the collection to the database
      const savedCollection = await newCollection.save();

      if(!savedCollection) {
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