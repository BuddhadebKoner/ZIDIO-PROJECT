import mongoose from 'mongoose';

const HomeContentSchema = new mongoose.Schema({
   heroBannerImages: [
      {
         imageUrl: {
            type: String, required: true
         },
         imageId: {
            type: String, required: true
         },
         path: {
            type: String, default: '/'
         }
      }
   ],
   exclusiveProducts: [
      {
         productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
         }
      }
   ],
   newArrivals: [
      {
         productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
         }
      }
   ],
   collections: [
      {
         collectionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Collection'
         },
         imageDetails: {
            imageUrl: {
               type: String
            },
            imageId: {
               type: String
            }
         }
      }
   ],
   offerFeatured: [
      {
         imageUrl: {
            type: String, required: true
         },
         imageId: {
            type: String, required: true
         },
         offer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Offer'
         }
      }
   ],
   alltimeBestSellers: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
   },
   womenFeatured: [
      {
         productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
         }
      }
   ],
}, { timestamps: true });

export const HomeContent = mongoose.model('HomeContent', HomeContentSchema);