import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
   userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
   },
   addressLine1: {
      type: String,
      required: true,
   },
   addressLine2: {
      type: String,
      default: null,
   },
   city: {
      type: String,
      required: true,
   },
   state: {
      type: String,
      required: true,
   },
   country: {
      type: String,
      required: true,
   },
   postalCode: {
      type: String,
      required: true,
   },
}, { timestamps: true });

export const Address = mongoose.model("Address", addressSchema);