import mongoose from "mongoose";

const offerSchema = new mongoose.Schema({
   offerName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
   },
   offerStatus: {
      type: Boolean,
      default: false,
   },
   offerCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
   },
   discountValue: {
      type: Number,
      required: true,
   },
   startDate: {
      type: Date,
      required: true,
   },
   endDate: {
      type: Date,
      required: true,
   },
   products: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Product",
      },
   ],
}, { timestamps: true });

export const Offer = mongoose.model("Offer", offerSchema);