import mongoose from "mongoose";

const paymentData = new mongoose.Schema({
   orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
   },
   paymentStatus: {
      type: String,
      required: true,
   },
   paymentMethod: {
      type: String,
   },
   transactionId: {
      type: String,
      unque: true,
   },
   stripeUserId: {
      type: String,
   },
   receiptUrl: {
      type: String,
      unque: true,
   },
   paymentDate: {
      type: Date,
      default: Date.now,
   },
   paymentTime: {
      type: String,
      default: new Date().toLocaleTimeString(),
   },
   stripeSeasionId: {
      type: String,
   },
   paymentType: {
      type: String,
      enum: ["CASH", "ONLINE"],
      default: "ONLINE",
   },
   amount: {
      type: Number,
      required: true,
   }
})

export const Payment = mongoose.model("Payment", paymentData);