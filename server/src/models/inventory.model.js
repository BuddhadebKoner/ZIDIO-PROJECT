import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
   productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Product",
   },
   stocks: [
      {
         size: {
            type: String,
            enum: ["S", "M", "L", "XL", "XXL"],
            required: true,
         },
         quantity: {
            type: Number,
            required: true,
            default: 0,
         },
      },
   ],
   totalQuantity: {
      type: Number,
      required: true,
      default: 0,
   },
}, { timestamps: true });

export const Inventory = mongoose.model("Inventory", inventorySchema);