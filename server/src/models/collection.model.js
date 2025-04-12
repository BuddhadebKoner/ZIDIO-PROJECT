import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema({
   slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
   },
   name: {
      type: String,
      required: true,
      trim: true,
   },
   subtitle: {
      type: String,
      required: true,
      trim: true,
   },
   bannerImageUrl: {
      type: String,
      required: true,
   },
   bannerImageId: {
      type: String,
      required: true,
   },
   isFeatured: {
      type: Boolean,
      default: false,
   },
   products: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Product",
      },
   ],
});

export const Collection = mongoose.model("Collection", collectionSchema);