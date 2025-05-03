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