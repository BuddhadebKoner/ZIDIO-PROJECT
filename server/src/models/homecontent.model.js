import mongoose from "mongoose"

const homeContentSchema = new mongoose.Schema({
   heroBannerImages: [{
      imageUrl: {
         type: String,
         required: true,
      },
      imageId: {
         type: String,
         required: true,
      },
      path: {
         type: String,
         required: true,
      },
   }],
   exclusiveProducts: [
      {
         productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
         },
      },
   ],
   newArrivals: [
      {
         productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
         },
      },
   ],
   collections: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Collection",
      },
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
   alltimeBestSellers: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
   },
   womenFeatured: [
      {
         productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
         },
      },
   ],
});

export const HomeContent = mongoose.model("HomeContent", homeContentSchema);