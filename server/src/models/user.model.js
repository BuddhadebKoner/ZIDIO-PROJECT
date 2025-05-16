import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
   clerkId: {
      type: String,
      required: true,
      unique: true,
   },
   fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
   },
   email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
   },
   phone: {
      type: String,
      trim: true,
   },
   role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
   },
   avatar: {
      type: String,
      required: true,
   },
   address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Address',
      default: null,
   },
   stripeCustomerId: {
      type: String,
   },
   orders: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Order',
      },
   ],
   cart: [
      {
         productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
         },
         quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1
         },
         size: {
            type: String,
            enum: ['S', 'M', 'L', 'XL', 'XXL'],
            required: true,
         },
      }
   ],
   wishlist: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Product',
      },
   ],
   notifications: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Notification',
      },
   ],

}, { timestamps: true });

export const User = mongoose.model('User', userSchema);