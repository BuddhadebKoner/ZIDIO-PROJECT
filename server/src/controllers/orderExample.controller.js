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

const FREE_DELIVERY_THRESHOLD = 1000;
const DELIVERY_CHARGE_AMOUNT = 49;
const MAXIMUM_ORDER_AMOUNT_LIMIT = 100000;
const MINIMUM_PARTIAL_PAYMENT = 100;
const MINIMUM_ORDER_AMOUNT = 10;
const PRICE_TOLERANCE = 0.01; 
const MAX_QUANTITY_PER_ITEM = 10; 

// place order for ONLINE payment - Enhanced with better security and validation
export const placeOrderOnlinePayment = async (req, res) => {
   const session = await startSession();
   try {
      session.startTransaction();
      const userId = req.userId;
      
      // Validate user authentication
      const isUserExist = await validateAuth(userId, session);
      if (!isUserExist) {
         await session.abortTransaction();
         return res.status(401).json({
            success: false,
            message: "Authentication failed. Please login again.",
            errorCode: "AUTH_FAILED"
         });
      }

      const trackId = uuidv4();
      if (!trackId) {
         await session.abortTransaction();
         return res.status(500).json({
            success: false,
            message: "Failed to generate order tracking ID. Please try again.",
            errorCode: "TRACK_ID_GENERATION_FAILED"
         });
      }

      // Extract and validate order data
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

      // Validate order type
      if (orderType !== "ONLINE") {
         await session.abortTransaction();
         return res.status(400).json({
            success: false,
            message: "Invalid payment method selected. Please select online payment.",
            errorCode: "INVALID_ORDER_TYPE"
         });
      }

      // Validate delivery address ownership
      if (!deliveryAddress || isUserExist.address.toString() !== deliveryAddress) {
         await session.abortTransaction();
         return res.status(400).json({
            success: false,
            message: "Invalid delivery address. Please update your address and try again.",
            errorCode: "INVALID_DELIVERY_ADDRESS"
         });
      }

      // Comprehensive order validation
      const orderValidation = await checkOrderCalculations(
         purchaseProducts,
         cartTotal,
         payInCashAmount,
         payInOnlineAmount,
         deliveryCharge,
         totalDiscount,
         orderType,
         session
      );

      if (!orderValidation.success) {
         await session.abortTransaction();
         return res.status(orderValidation.statusCode).json({
            success: false,
            message: orderValidation.message,
            details: orderValidation.details,
            errorCode: "ORDER_VALIDATION_FAILED"
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
         orderType: 'ONLINE',
         paymentStatus: 'unpaid',
         payInCashAmount: 0,
         payInOnlineAmount,
         deliveryCharge,
      });

      const savedOrder = await newOrder.save({ session });
      if (!savedOrder) {
         await session.abortTransaction();
         return res.status(500).json({
            success: false,
            message: "Failed to create your order. Please try again.",
            errorCode: "ORDER_CREATION_FAILED"
         });
      }

      // Update user's order list
      const updatedUser = await User.findByIdAndUpdate(
         { _id: isUserExist._id },
         { $push: { orders: savedOrder._id } },
         { new: true, session }
      );
      
      if (!updatedUser) {
         await session.abortTransaction();
         return res.status(500).json({
            success: false,
            message: "Failed to link order to your account. Please try again.",
            errorCode: "USER_ORDER_LINK_FAILED"
         });
      }

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
            message: "Failed to initialize payment gateway. Please try again.",
            errorCode: "PAYMENT_GATEWAY_FAILED"
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
            expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
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

// place order for cash on delivery - Enhanced with better security and validation
export const placeOrderCashOnDelivery = async (req, res) => {
   const session = await startSession();
   try {
      session.startTransaction();
      const userId = req.userId;
      
      // Validate user authentication
      const isUserExist = await validateAuth(userId, session);
      if (!isUserExist) {
         await session.abortTransaction();
         return res.status(401).json({
            success: false,
            message: "Authentication failed. Please login again.",
            errorCode: "AUTH_FAILED"
         });
      }

      const trackId = uuidv4();
      if (!trackId) {
         await session.abortTransaction();
         return res.status(500).json({
            success: false,
            message: "Failed to generate order tracking ID. Please try again.",
            errorCode: "TRACK_ID_GENERATION_FAILED"
         });
      }

      // Extract and validate order data
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

      // Validate order type
      if (orderType !== "COD") {
         await session.abortTransaction();
         return res.status(400).json({
            success: false,
            message: "Invalid payment method selected. Please select cash on delivery.",
            errorCode: "INVALID_ORDER_TYPE"
         });
      }

      // Validate delivery address ownership
      if (!deliveryAddress || isUserExist.address.toString() !== deliveryAddress) {
         await session.abortTransaction();
         return res.status(400).json({
            success: false,
            message: "Invalid delivery address. Please update your address and try again.",
            errorCode: "INVALID_DELIVERY_ADDRESS"
         });
      }

      // Comprehensive order validation
      const orderValidation = await checkOrderCalculations(
         purchaseProducts,
         cartTotal,
         payInCashAmount,
         payInOnlineAmount,
         deliveryCharge,
         totalDiscount,
         orderType,
         session
      );

      if (!orderValidation.success) {
         await session.abortTransaction();
         return res.status(orderValidation.statusCode).json({
            success: false,
            message: orderValidation.message,
            details: orderValidation.details,
            errorCode: "ORDER_VALIDATION_FAILED"
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
      if (!savedOrder) {
         await session.abortTransaction();
         return res.status(500).json({
            success: false,
            message: "Failed to create your order. Please try again.",
            errorCode: "ORDER_CREATION_FAILED"
         });
      }

      // Update user's order list
      const updatedUser = await User.findByIdAndUpdate(
         { _id: isUserExist._id },
         { $push: { orders: savedOrder._id } },
         { new: true, session }
      );

      if (!updatedUser) {
         await session.abortTransaction();
         return res.status(500).json({
            success: false,
            message: "Failed to link order to your account. Please try again.",
            errorCode: "USER_ORDER_LINK_FAILED"
         });
      }

      // Update inventory (reduce stock) - Only after successful order creation
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

      if (bulkOps.length > 0) {
         try {
            const inventoryUpdateResult = await Inventory.bulkWrite(bulkOps, { session });
            if (inventoryUpdateResult.modifiedCount !== purchaseProducts.length) {
               await session.abortTransaction();
               return res.status(500).json({
                  success: false,
                  message: "Some items are no longer available. Please refresh and try again.",
                  errorCode: "INVENTORY_UPDATE_FAILED"
               });
            }
         } catch (inventoryError) {
            await session.abortTransaction();
            return res.status(500).json({
               success: false,
               message: "Failed to update product availability. Please try again.",
               errorCode: "INVENTORY_ERROR"
            });
         }
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

// place order for cash on delivery + ONLINE payment - Enhanced with better security and validation
export const placeOrderCashAndOnlineMixed = async (req, res) => {
   const session = await startSession();
   try {
      session.startTransaction();
      const userId = req.userId;
      
      // Validate user authentication
      const isUserExist = await validateAuth(userId, session);
      if (!isUserExist) {
         await session.abortTransaction();
         return res.status(401).json({
            success: false,
            message: "Authentication failed. Please login again.",
            errorCode: "AUTH_FAILED"
         });
      }

      const trackId = uuidv4();
      if (!trackId) {
         await session.abortTransaction();
         return res.status(500).json({
            success: false,
            message: "Failed to generate order tracking ID. Please try again.",
            errorCode: "TRACK_ID_GENERATION_FAILED"
         });
      }

      // Extract and validate order data
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

      // Validate order type
      if (orderType !== "COD+ONLINE") {
         await session.abortTransaction();
         return res.status(400).json({
            success: false,
            message: "Invalid payment method selected. Please select mixed payment.",
            errorCode: "INVALID_ORDER_TYPE"
         });
      }

      // Validate delivery address ownership
      if (!deliveryAddress || isUserExist.address.toString() !== deliveryAddress) {
         await session.abortTransaction();
         return res.status(400).json({
            success: false,
            message: "Invalid delivery address. Please update your address and try again.",
            errorCode: "INVALID_DELIVERY_ADDRESS"
         });
      }

      // Comprehensive order validation
      const orderValidation = await checkOrderCalculations(
         purchaseProducts,
         cartTotal,
         payInCashAmount,
         payInOnlineAmount,
         deliveryCharge,
         totalDiscount,
         orderType,
         session
      );

      if (!orderValidation.success) {
         await session.abortTransaction();
         return res.status(orderValidation.statusCode).json({
            success: false,
            message: orderValidation.message,
            details: orderValidation.details,
            errorCode: "ORDER_VALIDATION_FAILED"
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
         orderType: 'COD+ONLINE',
         paymentStatus: 'unpaid',
         payInCashAmount,
         payInOnlineAmount,
         deliveryCharge,
      });

      const savedOrder = await newOrder.save({ session });
      if (!savedOrder) {
         await session.abortTransaction();
         return res.status(500).json({
            success: false,
            message: "Failed to create your order. Please try again.",
            errorCode: "ORDER_CREATION_FAILED"
         });
      }

      // Update user's order list
      const updatedUser = await User.findByIdAndUpdate(
         { _id: isUserExist._id },
         { $push: { orders: savedOrder._id } },
         { new: true, session }
      );

      if (!updatedUser) {
         await session.abortTransaction();
         return res.status(500).json({
            success: false,
            message: "Failed to link order to your account. Please try again.",
            errorCode: "USER_ORDER_LINK_FAILED"
         });
      }

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
            message: "Failed to initialize payment gateway. Please try again.",
            errorCode: "PAYMENT_GATEWAY_FAILED"
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
            expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
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

// Enhanced validation function for user authentication and Stripe customer setup
const validateAuth = async (userId, session) => {
   if (!userId) {
      return null;
   }

   const isUserExist = await User.findOne({ clerkId: userId });
   if (!isUserExist) {
      return null;
   }

   // Ensure user has Stripe customer ID
   const customers = await getStripe().customers.list({
      email: isUserExist.email,
      limit: 1,
   });

   if (!customers.data.length) {
      // Create new Stripe customer
      const newCustomer = await getStripe().customers.create({
         email: isUserExist.email,
         name: isUserExist.fullName,
         metadata: {
            userId: isUserExist._id.toString(),
         },
      });

      if (!newCustomer) {
         return null;
      }

      // Update user with stripe customer id
      const updatedUser = await User.findByIdAndUpdate(
         { _id: isUserExist._id },
         { stripeCustomerId: newCustomer.id },
         { new: true, session }
      );

      if (!updatedUser) {
         return null;
      }
   } else {
      // Update user with existing Stripe customer ID if different
      if (isUserExist.stripeCustomerId !== customers.data[0].id) {
         const updatedUser = await User.findByIdAndUpdate(
            { _id: isUserExist._id },
            { stripeCustomerId: customers.data[0].id },
            { new: true, session }
         );

         if (!updatedUser) {
            return null;
         }
      }
   }

   return isUserExist;
};

// Enhanced validation and security fixes for order calculations
const checkOrderCalculations = async (purchaseProducts, cartTotal, payInCashAmount, payInOnlineAmount, deliveryCharge, totalDiscount, orderType, session) => {
   const createResponse = (success, statusCode, message, details = null) => {
      return { success, statusCode, message, details };
   };

   // Input validation
   if (!Array.isArray(purchaseProducts) || purchaseProducts.length === 0) {
      return createResponse(false, 400, "No products found in your cart. Please add some products.");
   }

   if (typeof cartTotal !== 'number' || cartTotal <= 0) {
      return createResponse(false, 400, "Invalid cart total amount. Please refresh and try again.");
   }

   if (cartTotal < MINIMUM_ORDER_AMOUNT) {
      return createResponse(false, 400, `Minimum order amount is ₹${MINIMUM_ORDER_AMOUNT}.`);
   }

   if (typeof deliveryCharge !== 'number' || deliveryCharge < 0) {
      return createResponse(false, 400, "Invalid delivery charge amount.");
   }

   if (typeof totalDiscount !== 'number' || totalDiscount < 0) {
      return createResponse(false, 400, "Invalid discount amount.");
   }

   // Validate order types and payment amounts
   if (!['ONLINE', 'COD', 'COD+ONLINE'].includes(orderType)) {
      return createResponse(false, 400, "Invalid payment method selected.");
   }

   // Calculate expected delivery charge
   const expectedDeliveryCharge = cartTotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE_AMOUNT;
   if (Math.abs(deliveryCharge - expectedDeliveryCharge) > PRICE_TOLERANCE) {
      return createResponse(false, 400, 
         `Delivery charge calculation error. Expected: ₹${expectedDeliveryCharge}, Received: ₹${deliveryCharge}`
      );
   }

   // Calculate expected payable amount
   const expectedPayableAmount = cartTotal + deliveryCharge;

   try {
      // Validate inventory and calculate expected totals
      const inventoryValidation = await validateInventoryAvailability(purchaseProducts, session);
      if (!inventoryValidation.success) {
         return inventoryValidation;
      }

      const priceValidation = await validateProductPricesAndCalculateTotal(purchaseProducts, session);
      if (!priceValidation.success) {
         return priceValidation;
      }

      const { calculatedCartTotal, calculatedTotalDiscount } = priceValidation.data;

      // Validate cart total matches calculated values
      if (Math.abs(cartTotal - calculatedCartTotal) > PRICE_TOLERANCE) {
         return createResponse(false, 400, 
            `Cart total mismatch. Please refresh your cart and try again.`,
            { expectedCartTotal: calculatedCartTotal, receivedCartTotal: cartTotal }
         );
      }

      // Validate discount amount
      if (Math.abs(totalDiscount - calculatedTotalDiscount) > PRICE_TOLERANCE) {
         return createResponse(false, 400, 
            `Discount calculation error. Please refresh your cart and try again.`,
            { expectedDiscount: calculatedTotalDiscount, receivedDiscount: totalDiscount }
         );
      }

      // Order type specific validations
      const paymentValidation = validatePaymentAmountsByOrderType(
         orderType, 
         expectedPayableAmount, 
         payInCashAmount, 
         payInOnlineAmount
      );
      
      if (!paymentValidation.success) {
         return paymentValidation;
      }

      return createResponse(true, 200, "Order calculations validated successfully", {
         cartTotal: calculatedCartTotal,
         deliveryCharge: expectedDeliveryCharge,
         payableAmount: expectedPayableAmount,
         totalDiscount: calculatedTotalDiscount
      });

   } catch (error) {
      console.error("Order validation error:", error);
      return createResponse(false, 500, "Error validating your order. Please try again.", { error: error.message });
   }
};

// Validate inventory availability for all products
const validateInventoryAvailability = async (purchaseProducts, session) => {
   const createResponse = (success, statusCode, message, details = null) => {
      return { success, statusCode, message, details };
   };

   try {
      const productIds = purchaseProducts.map(item => item.productId);
      const inventoryResults = await Inventory.find({
         productId: { $in: productIds }
      }).session(session);

      for (const purchasedItem of purchaseProducts) {
         // Validate required fields
         if (!purchasedItem.productId || !purchasedItem.selectedSize || !purchasedItem.quantity) {
            return createResponse(false, 400, "Missing product information. Please refresh and try again.");
         }

         if (purchasedItem.quantity <= 0 || !Number.isInteger(purchasedItem.quantity)) {
            return createResponse(false, 400, `Invalid quantity for product. Please check your cart.`);
         }

         if (purchasedItem.quantity > MAX_QUANTITY_PER_ITEM) {
            return createResponse(false, 400, `Maximum ${MAX_QUANTITY_PER_ITEM} items allowed per product.`);
         }

         const inventoryItem = inventoryResults.find(item =>
            item.productId.toString() === purchasedItem.productId.toString()
         );

         if (!inventoryItem) {
            return createResponse(false, 400, `Product no longer available in our inventory.`);
         }

         const sizeStock = inventoryItem.stocks.find(stock =>
            stock.size === purchasedItem.selectedSize
         );

         if (!sizeStock) {
            return createResponse(false, 400, 
               `Size ${purchasedItem.selectedSize} is no longer available.`
            );
         }

         if (sizeStock.quantity < purchasedItem.quantity) {
            return createResponse(false, 400,
               `Only ${sizeStock.quantity} items available in size ${purchasedItem.selectedSize}. Please reduce quantity.`,
               { 
                  available: sizeStock.quantity, 
                  requested: purchasedItem.quantity,
                  productId: purchasedItem.productId,
                  size: purchasedItem.selectedSize
               }
            );
         }
      }

      return createResponse(true, 200, "Inventory validation successful");
   } catch (error) {
      return createResponse(false, 500, "Error checking product availability. Please try again.", { error: error.message });
   }
};

// Validate product prices and calculate expected totals
const validateProductPricesAndCalculateTotal = async (purchaseProducts, session) => {
   const createResponse = (success, statusCode, message, details = null) => {
      return { success, statusCode, message, details };
   };

   try {
      const productIds = purchaseProducts.map(item => item.productId);
      const products = await Product.find({
         _id: { $in: productIds }
      }).populate('offer').session(session);

      let calculatedCartTotal = 0;
      let calculatedTotalDiscount = 0;

      for (const purchasedItem of purchaseProducts) {
         const product = products.find(p => p._id.toString() === purchasedItem.productId.toString());
         
         if (!product) {
            return createResponse(false, 400, `Product no longer available in our catalog.`);
         }

         // Calculate expected price after discount
         let finalPrice = product.price;
         let discountAmount = 0;

         if (product.offer) {
            const offer = product.offer;
            const now = new Date();
            const isDateValid = now >= new Date(offer.startDate) && now <= new Date(offer.endDate);
            
            // Check if product is in offer's product list (if offer has specific products)
            const isProductInOffer = !offer.products || offer.products.length === 0 || 
               offer.products.some(p => p.toString() === product._id.toString());

            if (offer.offerStatus && isDateValid && isProductInOffer) {
               discountAmount = (product.price * offer.discountValue) / 100;
               finalPrice = product.price - discountAmount;
            }
         }

         // Validate item price
         const expectedItemTotal = Math.round((finalPrice * purchasedItem.quantity) * 100) / 100;
         const expectedItemDiscount = Math.round((discountAmount * purchasedItem.quantity) * 100) / 100;

         if (Math.abs(purchasedItem.payableAmount - expectedItemTotal) > PRICE_TOLERANCE) {
            return createResponse(false, 400,
               `Price has changed for ${product.title}. Please refresh your cart.`,
               {
                  expected: expectedItemTotal,
                  received: purchasedItem.payableAmount,
                  productTitle: product.title,
                  expectedPrice: finalPrice,
                  quantity: purchasedItem.quantity
               }
            );
         }

         calculatedCartTotal += expectedItemTotal;
         calculatedTotalDiscount += expectedItemDiscount;
      }

      return createResponse(true, 200, "Price validation successful", {
         calculatedCartTotal: Math.round(calculatedCartTotal * 100) / 100,
         calculatedTotalDiscount: Math.round(calculatedTotalDiscount * 100) / 100
      });

   } catch (error) {
      return createResponse(false, 500, "Error validating product prices. Please try again.", { error: error.message });
   }
};

// Validate payment amounts based on order type
const validatePaymentAmountsByOrderType = (orderType, expectedPayableAmount, payInCashAmount, payInOnlineAmount) => {
   const createResponse = (success, statusCode, message, details = null) => {
      return { success, statusCode, message, details };
   };

   // Validate payment amounts are numbers
   if (typeof payInCashAmount !== 'number' || typeof payInOnlineAmount !== 'number') {
      return createResponse(false, 400, "Invalid payment amounts. Please try again.");
   }

   // Check maximum order limit
   if (expectedPayableAmount > MAXIMUM_ORDER_AMOUNT_LIMIT) {
      return createResponse(false, 400, 
         `Order total exceeds maximum limit of ₹${MAXIMUM_ORDER_AMOUNT_LIMIT}. Please reduce your order.`
      );
   }

   switch (orderType) {
      case 'ONLINE':
         if (payInCashAmount !== 0) {
            return createResponse(false, 400, "Invalid payment configuration for online payment.");
         }
         if (Math.abs(payInOnlineAmount - expectedPayableAmount) > PRICE_TOLERANCE) {
            return createResponse(false, 400, 
               `Payment amount mismatch. Expected: ₹${expectedPayableAmount}, Please refresh and try again.`
            );
         }
         break;

      case 'COD':
         if (payInOnlineAmount !== 0) {
            return createResponse(false, 400, "Invalid payment configuration for cash on delivery.");
         }
         if (Math.abs(payInCashAmount - expectedPayableAmount) > PRICE_TOLERANCE) {
            return createResponse(false, 400, 
               `Payment amount mismatch. Expected: ₹${expectedPayableAmount}, Please refresh and try again.`
            );
         }
         break;

      case 'COD+ONLINE':
         if (payInOnlineAmount <= 0 || payInCashAmount <= 0) {
            return createResponse(false, 400, 
               "Both online and cash payment amounts must be greater than ₹0 for mixed payment."
            );
         }
         
         if (payInOnlineAmount < MINIMUM_PARTIAL_PAYMENT) {
            return createResponse(false, 400, 
               `Minimum online payment amount is ₹${MINIMUM_PARTIAL_PAYMENT}.`
            );
         }

         const totalPaymentAmount = payInCashAmount + payInOnlineAmount;
         if (Math.abs(totalPaymentAmount - expectedPayableAmount) > PRICE_TOLERANCE) {
            return createResponse(false, 400, 
               `Payment amounts don't match total. Please adjust your payment split.`,
               {
                  expected: expectedPayableAmount,
                  received: totalPaymentAmount,
                  onlineAmount: payInOnlineAmount,
                  cashAmount: payInCashAmount
               }
            );
         }
         break;

      default:
         return createResponse(false, 400, `Invalid payment method selected.`);
   }

   return createResponse(true, 200, "Payment amounts validation successful");
};

// Enhanced Stripe checkout session creation
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
                     images: [item.imagesUrl],
                     description: `${item.subTitle} - Size: ${item.selectedSize}`,
                     metadata: {
                        productId: item.productId,
                        slug: item.slug,
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

// Enhanced payment verification with better security
export const verifyPayment = async (req, res) => {
   const mongoSession = await startSession();
   try {
      mongoSession.startTransaction();
      const { orderId } = req.body;
      const userId = req.userId;

      // Validate request
      if (!orderId) {
         await mongoSession.abortTransaction();
         return res.status(400).json({
            success: false,
            message: "Order ID is required for payment verification.",
            errorCode: "MISSING_ORDER_ID"
         });
      }

      // Authenticate user
      const isUserExist = await User.findOne({ clerkId: userId });
      if (!isUserExist) {
         await mongoSession.abortTransaction();
         return res.status(401).json({
            success: false,
            message: "Authentication failed. Please login again.",
            errorCode: "AUTH_FAILED"
         });
      }

      // Find order and verify ownership
      const order = await Order.findById(orderId).session(mongoSession);
      if (!order) {
         await mongoSession.abortTransaction();
         return res.status(404).json({
            success: false,
            message: "Order not found.",
            errorCode: "ORDER_NOT_FOUND"
         });
      }

      // Verify order ownership
      if (order.user.toString() !== isUserExist._id.toString()) {
         await mongoSession.abortTransaction();
         return res.status(403).json({
            success: false,
            message: "You are not authorized to verify this payment.",
            errorCode: "UNAUTHORIZED_ORDER_ACCESS"
         });
      }

      // Check if payment is already processed
      if (order.paymentStatus === 'paid') {
         await mongoSession.abortTransaction();
         return res.status(400).json({
            success: false,
            message: "Payment has already been verified and processed.",
            errorCode: "PAYMENT_ALREADY_VERIFIED"
         });
      }

      // Check if order has a sessionId
      if (!order.sessionId) {
         await mongoSession.abortTransaction();
         return res.status(400).json({
            success: false,
            message: "Invalid order: No payment session found.",
            errorCode: "NO_PAYMENT_SESSION"
         });
      }

      // Validate order type
      if (order.orderType !== 'ONLINE' && order.orderType !== 'COD+ONLINE') {
         await mongoSession.abortTransaction();
         return res.status(400).json({
            success: false,
            message: "This order type does not require online payment verification.",
            errorCode: "INVALID_ORDER_TYPE_FOR_VERIFICATION"
         });
      }

      // Verify payment with Stripe
      const stripe = getStripe();
      let stripeSession;
      try {
         stripeSession = await stripe.checkout.sessions.retrieve(order.sessionId);
      } catch (error) {
         await mongoSession.abortTransaction();
         return res.status(500).json({
            success: false,
            message: "Error retrieving payment information. Please try again.",
            errorCode: "STRIPE_SESSION_RETRIEVAL_FAILED",
            error: error.message
         });
      }

      // Validate session existence
      if (!stripeSession) {
         await mongoSession.abortTransaction();
         return res.status(404).json({
            success: false,
            message: "Payment session not found.",
            errorCode: "STRIPE_SESSION_NOT_FOUND"
         });
      }

      // Check payment status
      if (stripeSession.payment_status !== 'paid') {
         await mongoSession.abortTransaction();
         return res.status(400).json({
            success: false,
            message: `Payment is not completed. Status: ${stripeSession.payment_status}`,
            errorCode: "PAYMENT_NOT_COMPLETED"
         });
      }

      // Verify payment amount
      const paymentIntent = await stripe.paymentIntents.retrieve(stripeSession.payment_intent);
      const paidAmount = paymentIntent.amount_received / 100;

      // Allow for small discrepancies due to currency conversion
      const AMOUNT_TOLERANCE = 1;
      if (Math.abs(paidAmount - order.payInOnlineAmount) > AMOUNT_TOLERANCE) {
         await mongoSession.abortTransaction();
         return res.status(400).json({
            success: false,
            message: "Payment amount verification failed.",
            errorCode: "PAYMENT_AMOUNT_MISMATCH",
            details: {
               expected: order.payInOnlineAmount,
               received: paidAmount
            }
         });
      }

      // Verify payment timing
      const paymentTime = new Date(paymentIntent.created * 1000);
      const orderTime = order.createdAt;
      const MAX_PAYMENT_DELAY = 24 * 60 * 60 * 1000; // 24 hours

      if (paymentTime < orderTime) {
         await mongoSession.abortTransaction();
         return res.status(400).json({
            success: false,
            message: "Payment timestamp validation failed.",
            errorCode: "INVALID_PAYMENT_TIMESTAMP"
         });
      }

      if (paymentTime - orderTime > MAX_PAYMENT_DELAY) {
         await mongoSession.abortTransaction();
         return res.status(400).json({
            success: false,
            message: "Payment verification timeout. Please contact support.",
            errorCode: "PAYMENT_VERIFICATION_TIMEOUT"
         });
      }

      // Update order payment status
      const updateOrder = await Order.findByIdAndUpdate(
         order._id,
         { paymentStatus: 'paid' },
         { new: true, session: mongoSession }
      );

      if (!updateOrder) {
         await mongoSession.abortTransaction();
         return res.status(500).json({
            success: false,
            message: "Failed to update order status. Please contact support.",
            errorCode: "ORDER_UPDATE_FAILED"
         });
      }

      // Record payment details
      const paymentData = {
         orderId: order._id,
         paymentStatus: paymentIntent.status,
         paymentMethod: stripeSession.payment_method_types[0],
         transactionId: paymentIntent.id,
         stripeUserId: paymentIntent.customer,
         receiptUrl: null,
         paymentDate: new Date(paymentIntent.created * 1000),
         paymentTime: new Date(paymentIntent.created * 1000).toLocaleTimeString(),
         stripeSeasionId: stripeSession.id,
         amount: paidAmount
      };

      const paymentSave = await Payment.create([paymentData], { session: mongoSession });
      if (!paymentSave || paymentSave.length === 0) {
         await mongoSession.abortTransaction();
         return res.status(500).json({
            success: false,
            message: "Failed to save payment information.",
            errorCode: "PAYMENT_SAVE_FAILED"
         });
      }

      // Get receipt URL
      try {
         const charges = await stripe.charges.list({
            payment_intent: paymentIntent.id
         });

         if (charges && charges.data.length > 0) {
            const receiptUrl = charges.data[0].receipt_url;
            if (receiptUrl) {
               paymentSave[0].receiptUrl = receiptUrl;
               await paymentSave[0].save({ session: mongoSession });
            }
         }
      } catch (receiptError) {
         console.log("Warning: Could not retrieve receipt URL:", receiptError.message);
      }

      // Update inventory (reduce stock)
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

      if (bulkOps.length > 0) {
         try {
            const inventoryResult = await Inventory.bulkWrite(bulkOps, { session: mongoSession });
            if (!inventoryResult || inventoryResult.modifiedCount === 0) {
               console.warn("Warning: Inventory update may have failed partially");
            }
         } catch (inventoryError) {
            console.error("Inventory update error:", inventoryError);
            // Don't fail the entire transaction for inventory issues
         }
      }

      // Link payment to order
      await Order.findByIdAndUpdate(
         orderId,
         { $push: { paymentData: paymentSave[0]._id } },
         { new: true, session: mongoSession }
      );

      // Clear user cart
      await User.findByIdAndUpdate(
         { _id: isUserExist._id },
         { $set: { cart: [] } },
         { new: true, session: mongoSession }
      );

      // Commit transaction
      await mongoSession.commitTransaction();

      return res.status(200).json({
         success: true,
         message: "Payment verified successfully! Your order is now being processed.",
         data: {
            orderId: order._id,
            trackId: order.trackId,
            paymentStatus: updateOrder.paymentStatus,
            transactionId: paymentIntent.id,
            receiptUrl: paymentSave[0].receiptUrl,
            orderType: order.orderType,
            totalPaid: paidAmount,
            remainingAmount: order.orderType === 'COD+ONLINE' ? order.payInCashAmount : 0
         }
      });

   } catch (error) {
      await mongoSession.abortTransaction();
      console.error("Payment verification error:", error);
      return res.status(500).json({
         success: false,
         message: 'Something went wrong during payment verification. Please try again.',
         errorCode: "INTERNAL_SERVER_ERROR",
         error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
   } finally {
      mongoSession.endSession();
   }
};
