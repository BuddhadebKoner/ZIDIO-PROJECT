import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";
import Stripe from "stripe";
import { v4 as uuidv4 } from "uuid";

const stripe = Stripe('sk_test_51RKVjH4SoabpG0PT2BhYNnaJPfo4XG2wcyqMMtH8EVHQnccgjSrMPNYiWkgGG5yNR4ZwaMNJRwkMyWsmcEI9Ky4L00yfG69KEA');

export const placeOrder = async (req, res) => {
   try {
      const userId = req.userId;
      if (!userId) {
         return res.status(401).json({
            success: false,
            message: "Unauthorized"
         });
      }

      // check if user exists
      const isUserExist = await User.findOne({ clerkId: userId });
      if (!isUserExist) {
         return res.status(404).json({
            success: false,
            message: "User not found"
         });
      }

      const { user, deliveryAddress, payableAmount, totalDiscount, orderType, payInCashAmount, payInOnlineAmount, purchaseProducts } = req.body;

      const trackId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const newOrder = await Order.create({
         user,
         trackId,
         purchaseProducts,
         deliveryAddress,
         payableAmount,
         totalDiscount,
         orderType,
         payInCashAmount,
         payInOnlineAmount,
      });
      if (!newOrder) {
         return res.status(500).json({
            success: false,
            message: "Failed to place order"
         });
      }

      // Only create payment session if there's an online component to the payment
      if (orderType === 'Online' || orderType === 'COD+Online') {
         const line_items = purchaseProducts.map((item) => ({
            price_data: {
               currency: 'inr',
               product_data: {
                  name: item.title,
                  images: [item.imagesUrl],
                  description: item.subTitle,
               },
               unit_amount: Math.round((item.payableAmount / item.quantity) * 100)
            },
            quantity: item.quantity,
         }));

         const session = await stripe.checkout.sessions.create({
            line_items: line_items,
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${process.env.CLIENT_URL}/verify?success=false&orderId=${newOrder._id}`,
         });


         // save payment id to order
         await Order.findByIdAndUpdate(newOrder._id, {
            $set: {
               paymentId: session.id,
            }
         }, { new: true });

         // save order id to user
         await User.findByIdAndUpdate(isUserExist._id, {
            $push: {
               orders: newOrder._id,
            }
         }, { new: true });

         return res.status(200).json({
            success: true,
            message: "Order placed successfully",
            orderId: newOrder._id,
            sessionData: {
               url: session.url,
            },
         });
      } else if (orderType === 'COD') {
         // For COD orders, no payment session needed
         return res.status(200).json({
            success: true,
            message: "Order placed successfully",
            orderId: newOrder._id,
         });
      }
   } catch (error) {
      return res.status(500).json({
         success: false,
         message: "Internal server error",
         error: error.message
      });
   }
};

export const verifyOrder = async (req, res) => {
   try {
      const { orderId, paymentSuccess } = req.body;
      const userId = req.userId;

      if (!userId) {
         return res.status(401).json({
            success: false,
            message: "Unauthorized"
         });
      }

      // Check if user exists
      const user = await User.findOne({ clerkId: userId });
      if (!user) {
         return res.status(404).json({
            success: false,
            message: "User not found"
         });
      }

      // Find the order
      const order = await Order.findById(orderId);
      if (!order) {
         return res.status(404).json({
            success: false,
            message: "Order not found"
         });
      }

      // Verify that the order belongs to the requesting user
      if (order.user.toString() !== user._id.toString()) {
         return res.status(403).json({
            success: false,
            message: "You are not authorized to modify this order"
         });
      }

      if (paymentSuccess) {
         // Payment succeeded - update order status and clear cart
         const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            {
               $set: {
                  paymentStatus: 'Success'
               }
            },
            { new: true }
         );

         // Clear user's cart
         await User.findByIdAndUpdate(
            user._id,
            {
               $set: { cart: [] }
            },
            { new: true }
         );

         return res.status(200).json({
            success: true,
            message: "Payment verified successfully and cart cleared",
            order: updatedOrder
         });
      } else {
         // Payment failed - update order status or delete order based on requirement
         // Option 1: Update status to failed
         const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            {
               $set: {
                  paymentStatus: 'Failed',
                  orderStatus: 'Cancelled'
               }
            },
            { new: true }
         );

         // Option 2: Delete the order (uncomment if you prefer this approach)
         // await Order.findByIdAndDelete(orderId);

         return res.status(200).json({
            success: true,
            message: "Payment verification failed, order has been cancelled",
            order: updatedOrder
         });
      }
   } catch (error) {
      return res.status(500).json({
         success: false,
         message: "Internal server error",
         error: error.message
      });
   }
};