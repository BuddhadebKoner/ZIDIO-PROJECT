import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
   slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
   },
   title: {
      type: String,
      required: true,
      trim: true,
   },
   subTitle: {
      type: String,
      required: true,
      trim: true,
   },
   description: {
      type: String,
      required: true,
      trim: true,
   },
   price: {
      type: Number,
      required: true,
      min: 0,
   },
   images: [
      {
         imageUrl: {
            type: String,
            required: true,
         },
         imageId: {
            type: String,
            required: true,
         },
      }
   ],
   bannerImageUrl: {
      type: String,
      default: null,
      required: true,
   },
   bannerImageId: {
      type: String,
      default: null,
      required: true,
   },
   size: {
      type: String,
      required: true,
      enum: ['S', 'M', 'L', 'XL', 'XXL'],
   },
   tags: {
      type: [String],
      required: true,
   },
   technologyStack: {
      type: [String],
      required: true,
   },
   // featured
   isExcusiveProducts: {
      type: Boolean,
      default: false,
   },
   isNewArrival: {
      type: Boolean,
      default: false,
   },
   isUnderHotDeals: {
      type: Boolean,
      default: false,
   },
   isBestSeller: {
      type: Boolean,
      default: false,
   },
   isWomenFeatured: {
      type: Boolean,
      default: false,
   },
   isMenFeatured: {
      type: Boolean,
      default: false,
   },
   isFeaturedToBanner: {
      type: Boolean,
      default: false,
   },
   isTrendingNow: {
      type: Boolean,
      default: false,
   },
   // category structure
   categories: [
      {
         main: {
            type: String,
            required: true,
         },
         sub: {
            type: String,
            required: true
         },
         path: {
            type: String,
            required: true
         }
      }
   ],
   // collections structure
   collections: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Collection',
         required: true,
      }
   ],
   // offer structure
   offer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offer',
      default: null,
   },
}, { timestamps: true });

export const Product = mongoose.model('Product', productSchema);