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
   shippingAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
   },
   products: [
      {
         productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
         },
         quantity: {
            type: Number,
            required: true,
            min: 1
         },
         title: {
            type: String,
            required: true
         },
         subTitle: {
            type: String,
            required: true
         },
         price: {
            type: Number,
            required: true
         },
         size: {
            type: String,
            required: true,
            enum: ['S', 'M', 'L', 'XL', 'XXL'],
         },
         offerApplied: {
            type: Boolean,
            default: false
         },
         offerDetails: {
            offerName: {
               type: String
            },
            offerCode: {
               type: String
            },
            discountValue: {
               type: Number,
               default: 0
            }
         },
         imageUrl: {
            type: String,
            required: true
         }
      }
   ],
   totalAmount: {
      type: Number,
      required: true
   },
   orderStatus: {
      type: String,
      enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Processing'
   },
   paymentStatus: {
      type: Boolean,
      default: false
   },
   paymentMethod: {
      type: String,
      required: true
   }
}, { timestamps: true });

export const Order = mongoose.model("Order", orderSchema);