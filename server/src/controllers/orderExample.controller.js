import { startSession } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import Stripe from "stripe";
import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import { Inventory } from "../models/inventory.model.js";
import { Order } from "../models/order.model.js";
import { Payment } from "../models/payment.model.js";
import { Address } from "../models/address.model.js";

const getStripe = () => {
   return new Stripe(process.env.STRIPE_SECRET_KEY);
};

// place order for ONLINE payment - Simplified
export const placeOrderOnlinePayment = async (req, res) => {
   const session = await startSession();
   try {
      session.startTransaction();
      const userId = req.userId;
      
      // Basic user validation
      const isUserExist = await User.findOne({ clerkId: userId });
      if (!isUserExist) {
         await session.abortTransaction();
         return res.status(401).json({
            success: false,
            message: "Authentication failed. Please login again.",
            errorCode: "AUTH_FAILED"
         });
      }

      const trackId = uuidv4();

      // Extract order data
      const {
         purchaseProducts,
         deliveryAddress,
         payableAmount,
         totalDiscount,
         orderType,
         payInCashAmount,
         payInOnlineAmount,
         deliveryCharge,
         cartTotal,
      } = req.body;

      // Basic validations only
      if (!purchaseProducts || !Array.isArray(purchaseProducts) || purchaseProducts.length === 0) {
         await session.abortTransaction();
         return res.status(400).json({
            success: false,
            message: "No products found in your cart."
         });
      }

      if (orderType !== "ONLINE") {
         await session.abortTransaction();
         return res.status(400).json({
            success: false,
            message: "Invalid payment method selected."
         });
      }

      // Ensure user has Stripe customer ID
      await ensureStripeCustomer(isUserExist, session);

      // Create order in database
      const newOrder = new Order({
         user: isUserExist._id,
         orderOwner: isUserExist.fullName,
         trackId,
         purchaseProducts,
         deliveryAddress: isUserExist.address,
         payableAmount,
         totalDiscount,
         orderStatus: 'Processing',
         orderProcessingTime: new Date(),
         orderType: 'ONLINE',
         paymentStatus: 'unpaid',
         payInCashAmount: 0,
         payInOnlineAmount,
         deliveryCharge,
      });

      const savedOrder = await newOrder.save({ session });

      // Update user's order list
      await User.findByIdAndUpdate(
         { _id: isUserExist._id },
         { $push: { orders: savedOrder._id } },
         { new: true, session }
      );

      // Create Stripe checkout session
      const stripeSession = await createStripeCheckoutSession({
         orderType,
         purchaseProducts,
         deliveryCharge,
         stripeCustomerId: isUserExist.stripeCustomerId,
         trackId,
         payInOnlineAmount,
         userEmail: isUserExist.email,
         userName: isUserExist.fullName,
         orderId: savedOrder._id.toString()
      });

      if (!stripeSession || !stripeSession.url) {
         await session.abortTransaction();
         return res.status(500).json({
            success: false,
            message: "Failed to create payment session. Please try again.",
            errorCode: "STRIPE_SESSION_FAILED"
         });
      }

      // Update order with Stripe session information
      savedOrder.sessionId = stripeSession.id;
      savedOrder.paymentUrl = stripeSession.url;
      await savedOrder.save({ session });

      // Commit transaction
      await session.commitTransaction();

      return res.status(200).json({
         success: true,
         message: "Order created successfully! Redirecting to payment...",
         data: {
            orderId: savedOrder._id,
            trackId,
            paymentUrl: stripeSession.url,
            sessionId: stripeSession.id,
            expiresAt: new Date(Date.now() + 30 * 60 * 1000),
            orderType: 'ONLINE',
            totalAmount: payInOnlineAmount
         }
      });

   } catch (error) {
      await session.abortTransaction();
      console.error("Online order creation error:", error);
      return res.status(500).json({
         success: false,
         message: 'Something went wrong while processing your order. Please try again.',
         errorCode: "INTERNAL_SERVER_ERROR",
         error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
   } finally {
      session.endSession();
   }
};

// place order for cash on delivery - Simplified
export const placeOrderCashOnDelivery = async (req, res) => {
   const session = await startSession();
   try {
      session.startTransaction();
      const userId = req.userId;
      
      // Basic user validation
      const isUserExist = await User.findOne({ clerkId: userId });
      if (!isUserExist) {
         await session.abortTransaction();
         return res.status(401).json({
            success: false,
            message: "Authentication failed. Please login again.",
            errorCode: "AUTH_FAILED"
         });
      }

      const trackId = uuidv4();

      // Extract order data
      const {
         purchaseProducts,
         deliveryAddress,
         payableAmount,
         totalDiscount,
         orderType,
         payInCashAmount,
         payInOnlineAmount,
         deliveryCharge,
         cartTotal,
      } = req.body;

      // Basic validations only
      if (!purchaseProducts || !Array.isArray(purchaseProducts) || purchaseProducts.length === 0) {
         await session.abortTransaction();
         return res.status(400).json({
            success: false,
            message: "No products found in your cart."
         });
      }

      if (orderType !== "COD") {
         await session.abortTransaction();
         return res.status(400).json({
            success: false,
            message: "Invalid payment method selected."
         });
      }

      // Create order in database
      const newOrder = new Order({
         user: isUserExist._id,
         orderOwner: isUserExist.fullName,
         trackId,
         purchaseProducts,
         deliveryAddress: isUserExist.address,
         payableAmount,
         totalDiscount,
         orderStatus: 'Processing',
         orderProcessingTime: new Date(),
         orderType: 'COD',
         paymentStatus: 'unpaid',
         payInCashAmount,
         payInOnlineAmount: 0,
         deliveryCharge,
      });

      const savedOrder = await newOrder.save({ session });

      // Update user's order list
      await User.findByIdAndUpdate(
         { _id: isUserExist._id },
         { $push: { orders: savedOrder._id } },
         { new: true, session }
      );

      // Update inventory (reduce stock)
      if (purchaseProducts.length > 0) {
         const bulkOps = purchaseProducts.map(product => ({
            updateOne: {
               filter: {
                  productId: product.productId,
                  "stocks.size": product.selectedSize
               },
               update: {
                  $inc: {
                     "stocks.$.quantity": -product.quantity,
                     totalQuantity: -product.quantity
                  }
               }
            }
         }));

         await Inventory.bulkWrite(bulkOps, { session });
      }

      // Clear user cart
      await User.findByIdAndUpdate(
         { _id: isUserExist._id },
         { $set: { cart: [] } },
         { new: true, session }
      );

      // Commit transaction
      await session.commitTransaction();

      return res.status(200).json({
         success: true,
         message: "Order placed successfully! You will pay cash on delivery.",
         data: {
            orderId: savedOrder._id,
            trackId,
            paymentUrl: null,
            sessionId: null,
            orderType: 'COD',
            totalAmount: payInCashAmount,
            estimatedDelivery: "3-5 business days"
         }
      });

   } catch (error) {
      await session.abortTransaction();
      console.error("COD order creation error:", error);
      return res.status(500).json({
         success: false,
         message: 'Something went wrong while processing your order. Please try again.',
         errorCode: "INTERNAL_SERVER_ERROR",
         error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
   } finally {
      session.endSession();
   }
};

// place order for cash on delivery + ONLINE payment - Simplified
export const placeOrderCashAndOnlineMixed = async (req, res) => {
   const session = await startSession();
   try {
      session.startTransaction();
      const userId = req.userId;
      
      // Basic user validation
      const isUserExist = await User.findOne({ clerkId: userId });
      if (!isUserExist) {
         await session.abortTransaction();
         return res.status(401).json({
            success: false,
            message: "Authentication failed. Please login again.",
            errorCode: "AUTH_FAILED"
         });
      }

      const trackId = uuidv4();

      // Extract order data
      const {
         purchaseProducts,
         deliveryAddress,
         payableAmount,
         totalDiscount,
         orderType,
         payInCashAmount,
         payInOnlineAmount,
         deliveryCharge,
         cartTotal,
      } = req.body;

      // Basic validations only
      if (!purchaseProducts || !Array.isArray(purchaseProducts) || purchaseProducts.length === 0) {
         await session.abortTransaction();
         return res.status(400).json({
            success: false,
            message: "No products found in your cart."
         });
      }

      if (orderType !== "COD+ONLINE") {
         await session.abortTransaction();
         return res.status(400).json({
            success: false,
            message: "Invalid payment method selected."
         });
      }

      // Ensure user has Stripe customer ID
      await ensureStripeCustomer(isUserExist, session);

      // Create order in database
      const newOrder = new Order({
         user: isUserExist._id,
         orderOwner: isUserExist.fullName,
         trackId,
         purchaseProducts,
         deliveryAddress: isUserExist.address,
         payableAmount,
         totalDiscount,
         orderStatus: 'Processing',
         orderProcessingTime: new Date(),
         orderType: 'COD+ONLINE',
         paymentStatus: 'unpaid',
         payInCashAmount,
         payInOnlineAmount,
         deliveryCharge,
      });

      const savedOrder = await newOrder.save({ session });

      // Update user's order list
      await User.findByIdAndUpdate(
         { _id: isUserExist._id },
         { $push: { orders: savedOrder._id } },
         { new: true, session }
      );

      // Create Stripe checkout session for the online payment portion
      const stripeSession = await createStripeCheckoutSession({
         orderType,
         purchaseProducts,
         stripeCustomerId: isUserExist.stripeCustomerId,
         trackId,
         payInOnlineAmount,
         userEmail: isUserExist.email,
         userName: isUserExist.fullName,
         orderId: savedOrder._id.toString(),
         payInCashAmount
      });

      if (!stripeSession || !stripeSession.url) {
         await session.abortTransaction();
         return res.status(500).json({
            success: false,
            message: "Failed to create payment session. Please try again.",
            errorCode: "STRIPE_SESSION_FAILED"
         });
      }

      // Update order with Stripe session information
      savedOrder.sessionId = stripeSession.id;
      savedOrder.paymentUrl = stripeSession.url;
      await savedOrder.save({ session });

      // Commit transaction (inventory will be updated after payment verification)
      await session.commitTransaction();

      // Calculate payment breakdown for response
      const onlinePercentage = Math.round((payInOnlineAmount / payableAmount) * 100);
      const codPercentage = Math.round((payInCashAmount / payableAmount) * 100);

      return res.status(200).json({
         success: true,
         message: `Order created! Pay ₹${payInOnlineAmount} now, ₹${payInCashAmount} on delivery.`,
         data: {
            orderId: savedOrder._id,
            trackId,
            paymentUrl: stripeSession.url,
            sessionId: stripeSession.id,
            expiresAt: new Date(Date.now() + 30 * 60 * 1000),
            orderType: 'COD+ONLINE',
            totalAmount: payableAmount,
            onlineAmount: payInOnlineAmount,
            codAmount: payInCashAmount,
            paymentBreakdown: {
               online: `${onlinePercentage}%`,
               cod: `${codPercentage}%`
            }
         }
      });

   } catch (error) {
      await session.abortTransaction();
      console.error("Mixed payment order creation error:", error);
      return res.status(500).json({
         success: false,
         message: 'Something went wrong while processing your order. Please try again.',
         errorCode: "INTERNAL_SERVER_ERROR",
         error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
   } finally {
      session.endSession();
   }
};

// Helper function to ensure user has Stripe customer ID
const ensureStripeCustomer = async (user, session) => {
   if (user.stripeCustomerId) {
      return user.stripeCustomerId;
   }

   const stripe = getStripe();
   const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
   });

   let customerId;
   if (!customers.data.length) {
      // Create new Stripe customer
      const newCustomer = await stripe.customers.create({
         email: user.email,
         name: user.fullName,
         metadata: {
            userId: user._id.toString(),
         },
      });
      customerId = newCustomer.id;
   } else {
      customerId = customers.data[0].id;
   }

   // Update user with stripe customer id
   await User.findByIdAndUpdate(
      { _id: user._id },
      { stripeCustomerId: customerId },
      { new: true, session }
   );

   user.stripeCustomerId = customerId;
   return customerId;
};

// Simplified Stripe checkout session creation
const createStripeCheckoutSession = async (data) => {
   const {
      orderType,
      purchaseProducts,
      deliveryCharge,
      stripeCustomerId,
      trackId,
      payInOnlineAmount,
      userEmail,
      userName,
      orderId,
      payInCashAmount
   } = data;

   try {
      const stripe = getStripe();

      if (orderType === "ONLINE") {
         const lineItems = [];

         // Add line items for each product
         purchaseProducts.forEach(item => {
            lineItems.push({
               price_data: {
                  currency: "inr",
                  product_data: {
                     name: item.title,
                     images: item.imagesUrl ? [item.imagesUrl] : [],
                     description: `${item.subTitle || ''} - Size: ${item.selectedSize}`,
                     metadata: {
                        productId: item.productId,
                        slug: item.slug || '',
                        size: item.selectedSize
                     }
                  },
                  unit_amount: Math.round((item.payableAmount / item.quantity) * 100)
               },
               quantity: item.quantity,
            });
         });

         // Add delivery charge if applicable
         if (deliveryCharge > 0) {
            lineItems.push({
               price_data: {
                  currency: "inr",
                  product_data: {
                     name: "Delivery Charge",
                     description: "Delivery charge for your order",
                  },
                  unit_amount: Math.round(deliveryCharge * 100)
               },
               quantity: 1,
            });
         }

         const stripeSession = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${process.env.CLIENT_URL}/verify?success=true&orderId=${orderId}`,
            cancel_url: `${process.env.CLIENT_URL}/verify?success=false&orderId=${orderId}`,
            metadata: {
               orderId: orderId,
               trackId: trackId,
               totalAmount: payInOnlineAmount.toString(),
               userEmail: userEmail,
               userName: userName,
               orderType: orderType
            },
            expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes
            billing_address_collection: 'auto',
            payment_intent_data: {
               description: `Order #${trackId} - Full payment`
            }
         });

         return stripeSession;

      } else if (orderType === "COD+ONLINE") {
         // Create a single line item for the online payment portion
         const lineItems = [{
            price_data: {
               currency: "inr",
               product_data: {
                  name: "Partial Online Payment",
                  description: `Online payment for Order #${trackId}. Remaining ₹${payInCashAmount} to be paid on delivery.`,
                  metadata: {
                     orderId: orderId,
                     trackId: trackId,
                     paymentType: "partial"
                  }
               },
               unit_amount: Math.round(payInOnlineAmount * 100)
            },
            quantity: 1,
         }];

         const totalAmount = payInOnlineAmount + payInCashAmount;
         const onlinePercentage = Math.round((payInOnlineAmount / totalAmount) * 100);

         const stripeSession = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${process.env.CLIENT_URL}/verify?success=true&orderId=${orderId}`,
            cancel_url: `${process.env.CLIENT_URL}/verify?success=false&orderId=${orderId}`,
            metadata: {
               orderId: orderId,
               trackId: trackId,
               totalAmount: payInOnlineAmount.toString(),
               userEmail: userEmail,
               userName: userName,
               orderType: orderType,
               cashAmount: payInCashAmount.toString(),
               totalOrderAmount: totalAmount.toString()
            },
            expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes
            billing_address_collection: 'auto',
            payment_intent_data: {
               description: `Order #${trackId} - Partial payment (${onlinePercentage}%)`
            }
         });

         return stripeSession;
      }

      return null;
   } catch (error) {
      console.error("Stripe session creation error:", error);
      return null;
   }
};

// Simplified payment verification - Basic validations only
export const verifyPayment = async (req, res) => {
   try {
      const { orderId } = req.body;
      const userId = req.userId;

      // Basic validations
      if (!orderId) {
         return res.status(400).json({
            success: false,
            message: "Order ID is required."
         });
      }

      if (!userId) {
         return res.status(401).json({
            success: false,
            message: "Authentication required."
         });
      }

      // Find user
      const user = await User.findOne({ clerkId: userId });
      if (!user) {
         return res.status(401).json({
            success: false,
            message: "User not found."
         });
      }

      // Find order
      const order = await Order.findById(orderId);
      if (!order) {
         return res.status(404).json({
            success: false,
            message: "Order not found."
         });
      }

      // Check if payment is already processed
      if (order.paymentStatus === 'paid') {
         return res.status(400).json({
            success: false,
            message: "Payment already verified."
         });
      }

      // Main task: Check Stripe payment status and update to paid
      const stripe = getStripe();
      const stripeSession = await stripe.checkout.sessions.retrieve(order.sessionId);

      if (stripeSession.payment_status === 'paid') {
         // Update order payment status from unpaid to paid
         await Order.findByIdAndUpdate(orderId, { paymentStatus: 'paid' });

         // Get basic payment details
         const paymentIntent = await stripe.paymentIntents.retrieve(stripeSession.payment_intent);
         
         // Save payment record
         const paymentData = {
            orderId: order._id,
            paymentStatus: paymentIntent.status,
            transactionId: paymentIntent.id,
            amount: paymentIntent.amount_received / 100,
            paymentDate: new Date(),
            stripeSeasionId: stripeSession.id
         };

         const paymentSave = await Payment.create(paymentData);

         // Update inventory
         if (order.purchaseProducts.length > 0) {
            const bulkOps = order.purchaseProducts.map(item => ({
               updateOne: {
                  filter: {
                     productId: item.productId,
                     "stocks.size": item.selectedSize
                  },
                  update: {
                     $inc: {
                        "stocks.$.quantity": -item.quantity,
                        totalQuantity: -item.quantity
                     }
                  }
               }
            }));

            await Inventory.bulkWrite(bulkOps);
         }

         // Clear user cart
         await User.findByIdAndUpdate(user._id, { $set: { cart: [] } });

         return res.status(200).json({
            success: true,
            message: "Payment verified successfully!",
            data: {
               orderId: order._id,
               trackId: order.trackId,
               paymentStatus: 'paid',
               transactionId: paymentIntent.id,
               amount: paymentIntent.amount_received / 100
            }
         });
      } else {
         return res.status(400).json({
            success: false,
            message: "Payment not completed."
         });
      }

   } catch (error) {
      console.error("Payment verification error:", error);
      return res.status(500).json({
         success: false,
         message: 'Payment verification failed.',
         error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
   }
};
