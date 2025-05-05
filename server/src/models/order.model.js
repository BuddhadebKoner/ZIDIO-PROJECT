import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
   user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
   },
   trackId: {
      type: String,
      required: true,
   },
   purchaseProducts: [
      {
         productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
         },
         title: {
            type: String,
            required: true,
         },
         subTitle: {
            type: String,
            required: true,
         },
         slug: {
            type: String,
            required: true,
         },
         imagesUrl: {
            type: String,
            required: true,
         },
         selectedSize: {
            type: String,
            enum: ["S", "M", "L", "XL", "XXL"],
            required: true,
         },
         quantity: {
            type: Number,
            required: true,
            default: 1,
         },
         originalPrice: {
            type: Number,
            required: true,
         },
         isOfferApplied: {
            type: Boolean,
            default: false,
         },
         discountAmount: {
            type: Number,
            default: 0,
         }
      }
   ],
   deliveryAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
   },
   payableAmount: {
      type: Number,
      required: true
   },
   totalDiscount: {
      type: Number,
      default: 0
   },
   orderStatus: {
      type: String,
      enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'],
      required: true,
      default: 'Processing'
   },
   orderType: {
      type: String,
      enum: ['COD', 'Online', 'COD+Online'],
      required: true
   },
   paymentStatus: {
      type: String,
      enum: ['Pending', 'Success', 'Failed'],
      required: true,
      default: 'Pending'
   },
   payInCashAmount: {
      type: Number,
      required: true,
      default: 0
   },
   payInOnlineAmount: {
      type: Number,
      required: true,
      default: 0
   },
}, { timestamps: true });

export const Order = mongoose.model("Order", orderSchema);