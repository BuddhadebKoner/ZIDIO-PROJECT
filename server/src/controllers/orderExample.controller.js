import { startSession } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { User } from "../models/user.model.js";
import Stripe from "stripe";
import { Product } from "../models/product.model.js";
import { Inventory } from "../models/inventory.model.js";
import { Order } from "../models/order.model.js";
import { Payment } from "../models/payment.model.js";

const getStripe = () => {
   return new Stripe(process.env.STRIPE_SECRET_KEY);
};

const LIMIT_AFTER_ADDING_DELIVERY_CHARGE = 1000;
const MAXIMUM_ORDER_AMOUNT_LIMIT = 100000;

// place order for ONLINE payment
export const placeOrderOnlinePayment = async (req, res) => {
   const session = await startSession();
   try {
      session.startTransaction();
      const userId = req.userId;
      const isUserExist = await validateAuth(userId, session);
      if (!isUserExist) {
         await session.abortTransaction();
         return res.status(401).json({
            success: false,
            message: "Unauthorized",
         });
      }

      const trackId = uuidv4();

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

      if (orderType !== "ONLINE") {
         await session.abortTransaction();
         return res.status(400).json({
            success: false,
            message: "Order type is not ONLINE",
         });
      }

      if (isUserExist.address.toString() !== deliveryAddress) {
         await session.abortTransaction();
         return res.status(400).json({
            success: false,
            message: "Delivery address is not same as user address, Unauthorized action",
         });
      }

      // check order calculations
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
            details: orderValidation.details
         });
      }

      // Create order in database first
      const newOrder = new Order({
         user: isUserExist._id,
         trackId,
         purchaseProducts,
         deliveryAddress: isUserExist.address,
         payableAmount,
         totalDiscount,
         orderStatus: 'Processing',
         orderProcessingTime: new Date(),
         orderType: 'ONLINE',
         paymentStatus: 'unpaid',
         payInCashAmount,
         payInOnlineAmount,
         deliveryCharge,
      });

      // Save the order to get the orderId
      const savedOrder = await newOrder.save({ session });

      if (!savedOrder) {
         await session.abortTransaction();
         return res.status(500).json({
            success: false,
            message: "Error creating order",
         });
      }

      // save orderId in user order
      const updatedUser = await User.findByIdAndUpdate(
         { _id: isUserExist._id },
         { $push: { orders: savedOrder._id } },
         { new: true, session }
      );
      if (!updatedUser) {
         await session.abortTransaction();
         return res.status(500).json({
            success: false,
            message: "Error updating user with orderId",
         });
      }

      // Create a checkout session with valid orderId
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
            message: "Error creating checkout session",
         });
      }

      // Update order with stripe session information
      savedOrder.sessionId = stripeSession.id;
      savedOrder.paymentUrl = stripeSession.url;
      await savedOrder.save({ session });

      // Commit the transaction
      await session.commitTransaction();

      // Return success response with payment URL
      return res.status(200).json({
         success: true,
         message: "Order created successfully",
         data: {
            orderId: savedOrder._id,
            trackId,
            paymentUrl: stripeSession.url,
            sessionId: stripeSession.id
         }
      });

   } catch (error) {
      await session.abortTransaction();
      return res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message,
      });
   } finally {
      session.endSession();
   }
};

// place order for cash on delivery
export const placeOrderCashOnDelivery = async (req, res) => {
   try {
      const userId = req.userId;
      if (!userId) {
         return res.status(401).json({
            success: false,
            message: "Unauthorized",
         });
      }
      const isUserExist = await User.findOne({ clerkId: userId });
      if (!isUserExist) {
         return res.status(401).json({
            success: false,
            message: "Unauthorized",
         });
      }
      const trackId = uuidv4();

      if (!trackId) {
         return res.status(400).json({
            success: false,
            message: "Track ID generation failed",
         });
      }

      if (isUserExist.address.toString() !== req.body.deliveryAddress) {
         return res.status(400).json({
            success: false,
            message: "Delivery address is not same as user address, Unauthorized action",
         });
      }

      // extracting the order details from the request body
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

      // console.log(req.body);

      if (orderType !== "COD") {
         return res.status(400).json({
            success: false,
            message: "Order type is not COD",
         });
      }
      // check order calculations
      const orderValidation = await checkOrderCalculations(
         purchaseProducts,
         cartTotal,
         payInCashAmount,
         payInOnlineAmount,
         deliveryCharge,
         totalDiscount,
         orderType,
      );

      if (!orderValidation.success) {
         return res.status(orderValidation.statusCode).json({
            success: false,
            message: orderValidation.message,
            details: orderValidation.details
         });
      }

      // Create order in database first
      const newOrder = new Order({
         user: isUserExist._id,
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
         payInOnlineAmount,
         deliveryCharge,
      });
      // Save the order to get the orderId
      const savedOrder = await newOrder.save();

      if (!savedOrder) {
         return res.status(500).json({
            success: false,
            message: "Error creating order",
         });
      }
      // save orderId in user order
      const updatedUser = await User.findByIdAndUpdate(
         { _id: isUserExist._id },
         { $push: { orders: savedOrder._id } },
         { new: true }
      );

      if (!updatedUser) {
         return res.status(500).json({
            success: false,
            message: "Error updating user with orderId",
         });
      }

      // Update inventory (reduce stock)
      const bulkOps = purchaseProducts.map(product => ({
         updateOne: {
            filter: {
               productId: product.productId,
               "stocks.size": product.selectedSize
            },
            update: {
               $inc: {
                  "stocks.$.quantity": -product.quantity
               }
            }
         }
      }));
      const inventoryUpdateResult = await Inventory.bulkWrite(bulkOps);
      if (inventoryUpdateResult.modifiedCount !== purchaseProducts.length) {
         return res.status(500).json({
            success: false,
            message: "Error updating inventory",
         });
      }

      // Return success response
      return res.status(200).json({
         success: true,
         message: "Order created successfully",
         data: {
            orderId: savedOrder._id,
            trackId,
            paymentUrl: null,
            sessionId: null
         }
      });
   } catch (error) {
      return res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message,
      });
   }
};

// place order for cash on delivery + ONLINE payment

export const placeOrderCashAndOnlineMixed = async (req, res) => { }

// helping functions
const validateAuth = async (userId, session) => {
   if (!userId) {
      return {
         isValid: false,
         statusCode: 401,
         message: "Unauthorized"
      };
   }

   const isUserExist = await User.findOne({ clerkId: userId });
   if (!isUserExist) {
      return {
         isValid: false,
         statusCode: 404,
         message: "User not found"
      };
   }

   // check stripe account is exist or not
   const customers = await getStripe().customers.list({
      email: isUserExist.email,
      limit: 1,
   });
   if (!customers.data.length) {
      //   create stripe customer
      const newCustomer = await getStripe().customers.create({
         email: isUserExist.email,
         name: isUserExist.fullName,
         metadata: {
            userId: isUserExist._id.toString(),
         },
      });

      if (!newCustomer) {
         await session.abortTransaction();
         return null;
      }

      // update user with stripe customer id
      const updatedUser = await User.findByIdAndUpdate(
         { _id: isUserExist._id },
         { stripeCustomerId: newCustomer.id },
         { new: true, session }
      );

      if (!updatedUser) {
         await session.abortTransaction();
         return null;
      }
   } else {
      // check if stripe customer id is exist or not
      if (isUserExist.stripeCustomerId !== customers.data[0].id) {
         // update user with stripe customer id
         const updatedUser = await User.findByIdAndUpdate(
            { _id: isUserExist._id },
            { stripeCustomerId: customers.data[0].id },
            { new: true, session }
         );

         if (!updatedUser) {
            await session.abortTransaction();
            return null;
         }
      }
   }

   return isUserExist
};


// check order calculations
const checkOrderCalculations = async (purchaseProducts, cartTotal, payInCashAmount, payInOnlineAmount, deliveryCharge, totalDiscount, orderType, session) => {
   const createResponse = (success, statusCode, message, details = null) => {
      return { success, statusCode, message, details };
   };

   // Threshold for acceptable price difference (in whole numbers)
   const PRICE_DIFFERENCE_THRESHOLD = 1;

   // Handle ONLINE payment order type
   if (orderType === "ONLINE") {
      if (payInCashAmount > 0) {
         return createResponse(false, 400, "Pay in cash amount should be 0 for ONLINE orders");
      }
      if (deliveryCharge === 0) {
         let totalAmount = purchaseProducts.reduce((sum, product) => sum + product.payableAmount, 0);
         if (totalAmount !== cartTotal || totalAmount !== payInOnlineAmount) {
            return createResponse(false, 400, "Total amount mismatch between cart, purchase products, and payment amount");
         }
         if (totalAmount > MAXIMUM_ORDER_AMOUNT_LIMIT) {
            return createResponse(false, 400, `Order total exceeds maximum limit of ₹${MAXIMUM_ORDER_AMOUNT_LIMIT}`);
         }
      }
      try {
         const bulkOps = purchaseProducts.map(product => ({
            productId: product.productId,
            selectedSize: product.selectedSize,
            requestedQuantity: product.quantity
         }));
         const inventoryResults = await Inventory.find({
            productId: { $in: bulkOps.map(item => item.productId) }
         }).session(session);
         for (const product of bulkOps) {
            const inventoryItem = inventoryResults.find(item =>
               item.productId.toString() === product.productId.toString()
            );
            if (!inventoryItem) {
               return createResponse(false, 400, `Product ID ${product.productId} not found in inventory`);
            }
            const sizeStock = inventoryItem.stocks.find(stock =>
               stock.size === product.selectedSize
            );
            if (!sizeStock) {
               return createResponse(false, 400, `Size ${product.selectedSize} not available for product ${product.productId}`);
            }
            if (sizeStock.quantity < product.requestedQuantity) {
               return createResponse(
                  false, 400,
                  `Insufficient stock for product ${product.productId} in size ${product.selectedSize}`,
                  { available: sizeStock.quantity, requested: product.requestedQuantity }
               );
            }
         }

         // STEP 2: Price validation - verify prices match database values
         const products = await Product.find({
            _id: { $in: purchaseProducts.map(item => item.productId) }
         })
            .populate('offer')
            .session(session);

         let calculatedTotal = 0;
         const priceMismatchItems = [];

         for (const purchasedItem of purchaseProducts) {
            const product = products.find(p => p._id.toString() === purchasedItem.productId.toString());
            if (!product) {
               return createResponse(false, 400, `Product ID ${purchasedItem.productId} not found in database`);
            }

            // Detailed offer inspection
            let priceAfterDiscount = product.price;
            if (product.offer) {
               const offer = product.offer;

               const now = new Date();
               const isDateValid = now >= new Date(offer.startDate) && now <= new Date(offer.endDate);

               // Check if this product is in the offer's product list (if applicable)
               const isProductInOffer = Array.isArray(offer.products) &&
                  offer.products.some(p => p.toString() === product._id.toString());

               if (offer.offerStatus && isDateValid && (offer.products.length === 0 || isProductInOffer)) {
                  priceAfterDiscount = product.price - (product.price * offer.discountValue) / 100;
               } else {
                  return createResponse(
                     false, 400,
                     `Offer is not valid for product ${product.title}`,
                     { offerStatus: offer.offerStatus, isDateValid, isProductInOffer }
                  );
               }
            } else {
               // if not not have offer then check without offer
               if (product.price !== purchasedItem.payableAmount) {
                  return createResponse(
                     false, 400,
                     `Price mismatch for product ${product.title}`,
                     { expected: product.price, received: purchasedItem.payableAmount }
                  );
               }
            }

            const expectedItemTotal = priceAfterDiscount * purchasedItem.quantity;
            calculatedTotal += expectedItemTotal;

            // Check for price mismatch with a tolerance for floating point precision
            // Only consider it a mismatch if the difference is greater than our threshold
            const priceDifference = Math.abs(Math.floor(expectedItemTotal) - Math.floor(purchasedItem.payableAmount));

            if (priceDifference > PRICE_DIFFERENCE_THRESHOLD) {
               priceMismatchItems.push({
                  productId: purchasedItem.productId,
                  title: product.title,
                  expectedPrice: expectedItemTotal,
                  clientPrice: purchasedItem.payableAmount,
                  difference: expectedItemTotal - purchasedItem.payableAmount,
                  basePrice: product.price,
                  priceAfterDiscount: priceAfterDiscount,
                  quantity: purchasedItem.quantity,
                  hasOffer: !!product.offer
               });

               return createResponse(
                  false, 400,
                  `Price mismatch for product ${product.title}`,
                  { expected: expectedItemTotal, received: purchasedItem.payableAmount }
               );
            }
         }

         if (deliveryCharge > 0) {
            calculatedTotal += deliveryCharge;
         }

         if (priceMismatchItems.length > 0) {
            return createResponse(
               false, 400,
               "Price calculation mismatch detected",
               { mismatchItems: priceMismatchItems }
            );
         }

         // Check total with tolerance for floating point precision
         if (Math.abs(Math.floor(calculatedTotal) - Math.floor(payInOnlineAmount)) > PRICE_DIFFERENCE_THRESHOLD) {
            return createResponse(
               false, 400,
               `Total amount mismatch between calculated value and payment amount`,
               { expected: calculatedTotal, received: payInOnlineAmount }
            );
         }

         return createResponse(true, 200, "Order calculations validated successfully");
      } catch (error) {
         return createResponse(false, 500, "Error during order validation", { error: error.message });
      }
   }
   else if (orderType === "COD") {
      if (payInOnlineAmount > 0) {
         return createResponse(false, 400, "Pay in online amount should be 0 for COD orders");
      }
      if (payInCashAmount <= 0) {
         return createResponse(false, 400, "Pay in cash amount should be greater than 0 for COD orders");
      }
      if (payInCashAmount > MAXIMUM_ORDER_AMOUNT_LIMIT) {
         return createResponse(false, 400, `Order total exceeds maximum limit of ₹${MAXIMUM_ORDER_AMOUNT_LIMIT}`);
      }
      if (cartTotal !== payInCashAmount) {
         return createResponse(false, 400, "Cart total should be equal to pay in cash amount for COD orders");
      }
      if (cartTotal > LIMIT_AFTER_ADDING_DELIVERY_CHARGE) {
         if (deliveryCharge > 0) {
            return createResponse(false, 400, "Delivery charge should be 0 for under ₹1000 orders");
         }
      }

      try {
         const bulkOps = purchaseProducts.map(product => ({
            productId: product.productId,
            selectedSize: product.selectedSize,
            requestedQuantity: product.quantity
         }));
         const inventoryResults = await Inventory.find({
            productId: { $in: bulkOps.map(item => item.productId) }
         }).session(session);
         for (const product of bulkOps) {
            const inventoryItem = inventoryResults.find(item =>
               item.productId.toString() === product.productId.toString()
            );
            if (!inventoryItem) {
               return createResponse(false, 400, `Product ID ${product.productId} not found in inventory`);
            }
            const sizeStock = inventoryItem.stocks.find(stock =>
               stock.size === product.selectedSize
            );
            if (!sizeStock) {
               return createResponse(false, 400, `Size ${product.selectedSize} not available for product ${product.productId}`);
            }
            if (sizeStock.quantity < product.requestedQuantity) {
               return createResponse(
                  false, 400,
                  `Insufficient stock for product ${product.productId} in size ${product.selectedSize}`,
                  { available: sizeStock.quantity, requested: product.requestedQuantity }
               );
            }
         }

         // STEP 2: Price validation - verify prices match database values
         const products = await Product.find({
            _id: { $in: purchaseProducts.map(item => item.productId) }
         })
            .populate('offer')
            .session(session);
         let calculatedTotal = 0;
         const priceMismatchItems = [];
         for (const purchasedItem of purchaseProducts) {
            const product = products.find(p => p._id.toString() === purchasedItem.productId.toString());
            if (!product) {
               return createResponse(false, 400, `Product ID ${purchasedItem.productId} not found in database`);
            }

            // Detailed offer inspection
            let priceAfterDiscount = product.price;
            if (product.offer) {
               const offer = product.offer;

               const now = new Date();
               const isDateValid = now >= new Date(offer.startDate) && now <= new Date(offer.endDate);

               // Check if this product is in the offer's product list (if applicable)
               const isProductInOffer = Array.isArray(offer.products) &&
                  offer.products.some(p => p.toString() === product._id.toString());

               if (offer.offerStatus && isDateValid && (offer.products.length === 0 || isProductInOffer)) {
                  priceAfterDiscount = product.price - (product.price * offer.discountValue) / 100;
               } else {
                  return createResponse(
                     false, 400,
                     `Offer is not valid for product ${product.title}`,
                     { offerStatus: offer.offerStatus, isDateValid, isProductInOffer }
                  );
               }
            } else {
               // if not not have offer then check without offer
               if (product.price !== purchasedItem.payableAmount) {
                  return createResponse(
                     false, 400,
                     `Price mismatch for product ${product.title}`,
                     { expected: product.price, received: purchasedItem.payableAmount }
                  );
               }
            }

            const expectedItemTotal = priceAfterDiscount * purchasedItem.quantity;
            calculatedTotal += expectedItemTotal;

            // Check for price mismatch with a tolerance for floating point precision
            // Only consider it a mismatch if the difference is greater than our threshold
            const priceDifference = Math.abs(Math.floor(expectedItemTotal) - Math.floor(purchasedItem.payableAmount));

            if (priceDifference > PRICE_DIFFERENCE_THRESHOLD) {
               priceMismatchItems.push({
                  productId: purchasedItem.productId,
                  title: product.title,
                  expectedPrice: expectedItemTotal,
                  clientPrice: purchasedItem.payableAmount,
                  difference: expectedItemTotal - purchasedItem.payableAmount,
                  basePrice: product.price,
                  priceAfterDiscount: priceAfterDiscount,
                  quantity: purchasedItem.quantity,
                  hasOffer: !!product.offer
               });

               return createResponse(
                  false, 400,
                  `Price mismatch for product ${product.title}`,
                  { expected: expectedItemTotal, received: purchasedItem.payableAmount }
               );
            }
         }

         if (deliveryCharge > 0) {
            calculatedTotal += deliveryCharge;
         }

         // Check total with tolerance for floating point precision
         if (Math.abs(Math.floor(calculatedTotal) - Math.floor(payInCashAmount)) > PRICE_DIFFERENCE_THRESHOLD) {
            return createResponse(
               false, 400,
               `Total amount mismatch between calculated value and payment amount`,
               { expected: calculatedTotal, received: payInCashAmount }
            );
         }

         if (priceMismatchItems.length > 0) {
            return createResponse(
               false, 400,
               "Price calculation mismatch detected",
               { mismatchItems: priceMismatchItems }
            );
         }

         return createResponse(true, 200, "Order calculations validated successfully");
      } catch (error) {
         return createResponse(false, 500, "Error during order validation", { error: error.message });
      }
   }
   else if (orderType === "COD+ONLINE") {
      // COD+ONLINE logic implementation would go here
      return createResponse(false, 501, "Combined payment method not implemented yet");
   }
   else {
      return createResponse(false, 400, `Invalid order type: ${orderType}`);
   }
};

// createStripeCheckoutSession
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
      orderId
   } = data;

   console.log(data);

   if (orderType === "ONLINE") {
      const lineItems = [];

      // line items
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

      // delivery charge
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

      try {
         // create checkout session
         const stripeSession = await getStripe().checkout.sessions.create({
            customer: stripeCustomerId,
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${process.env.CLIENT_URL}/verify?success=true&orderId=${orderId}`,
            cancel_url: `${process.env.CLIENT_URL}/verify?success=false&orderId=${orderId}`,
            metadata: {
               orderId: orderId,
               trackId: trackId,
               totalAmount: payInOnlineAmount,
               userEmail: userEmail,
               userName: userName,
            }
         });

         return stripeSession;
      } catch (error) {
         console.error("Stripe session creation error:", error);
         return null;
      }
   }

   return null;
};

// verify payment
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
            message: "Order ID is required"
         });
      }

      // Authenticate user
      const isUserExist = await User.findOne({ clerkId: userId });
      if (!isUserExist) {
         await mongoSession.abortTransaction();
         return res.status(401).json({
            success: false,
            message: "Unauthorized access"
         });
      }

      // Find order and verify ownership
      const order = await Order.findById(orderId).session(mongoSession);
      if (!order) {
         await mongoSession.abortTransaction();
         return res.status(404).json({
            success: false,
            message: "Order not found"
         });
      }

      // Verify order ownership
      if (order.user.toString() !== isUserExist._id.toString()) {
         await mongoSession.abortTransaction();
         return res.status(403).json({
            success: false,
            message: "You are not authorized to verify this payment"
         });
      }

      // Check if payment is already processed
      if (order.paymentStatus === 'paid') {
         await mongoSession.abortTransaction();
         return res.status(400).json({
            success: false,
            message: "Payment already verified and processed"
         });
      }

      // Check if order has a sessionId
      if (!order.sessionId) {
         await mongoSession.abortTransaction();
         return res.status(400).json({
            success: false,
            message: "Invalid order: No payment session found"
         });
      }

      // Validate order type
      if (order.orderType !== 'ONLINE' && order.orderType !== 'COD+ONLINE') {
         await mongoSession.abortTransaction();
         return res.status(400).json({
            success: false,
            message: "Invalid order type for online payment verification"
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
            message: "Error retrieving session from Stripe",
            error: error.message
         });
      }

      // Validate session existence
      if (!stripeSession) {
         await mongoSession.abortTransaction();
         return res.status(404).json({
            success: false,
            message: "Stripe session not found"
         });
      }

      // Check payment status
      if (stripeSession.payment_status !== 'paid') {
         await mongoSession.abortTransaction();
         return res.status(400).json({
            success: false,
            message: `Payment is not completed. Current status: ${stripeSession.payment_status}`
         });
      }

      // Verify payment amount
      const paymentIntent = await stripe.paymentIntents.retrieve(stripeSession.payment_intent);
      const paidAmount = paymentIntent.amount_received / 100;

      // Allow for small discrepancies (e.g., due to currency conversion)
      const AMOUNT_TOLERANCE = 1;
      if (Math.abs(paidAmount - order.payInOnlineAmount) > AMOUNT_TOLERANCE) {
         await mongoSession.abortTransaction();
         return res.status(400).json({
            success: false,
            message: "Payment amount mismatch",
            details: {
               expected: order.payInOnlineAmount,
               received: paidAmount
            }
         });
      }

      // Verify payment timing
      const paymentTime = new Date(paymentIntent.created * 1000);
      const orderTime = order.createdAt;
      const MAX_PAYMENT_DELAY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

      if (paymentTime < orderTime) {
         await mongoSession.abortTransaction();
         return res.status(400).json({
            success: false,
            message: "Payment was made before order creation"
         });
      }

      if (paymentTime - orderTime > MAX_PAYMENT_DELAY) {
         await mongoSession.abortTransaction();
         return res.status(400).json({
            success: false,
            message: "Payment verification timeout exceeded"
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
            message: "Error updating order payment status"
         });
      }

      // Record payment details
      const paymentData = {
         orderId: order._id,
         paymentStatus: paymentIntent.status,
         paymentMethod: stripeSession.payment_method_types[0],
         transactionId: paymentIntent.id,
         stripeUserId: paymentIntent.customer,
         receiptUrl: stripeSession.receipt_url,
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
            message: "Failed to save payment information"
         });
      }
      // fetch recetp url by payment id
      const rectprUrl = await stripe.charges.list({
         payment_intent: paymentIntent.id
      });

      if (rectprUrl && rectprUrl.data.length > 0) {
         const receiptUrl = rectprUrl.data[0].receipt_url;
         if (receiptUrl) {
            paymentSave[0].receiptUrl = receiptUrl;
            await paymentSave[0].save({ session: mongoSession });
         }
      }
      // Update order with payment details
      await Order.findByIdAndUpdate(
         order._id,
         { $push: { paymentData: paymentSave[0]._id } },
         { new: true, session: mongoSession }
      );


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
               await mongoSession.abortTransaction();
               return res.status(500).json({
                  success: false,
                  message: "Failed to update inventory"
               });
            }
         } catch (inventoryError) {
            await mongoSession.abortTransaction();
            return res.status(500).json({
               success: false,
               message: "Error updating inventory",
               error: inventoryError.message
            });
         }
      }

      // Link payment to order
      await Order.findByIdAndUpdate(
         orderId,
         { $push: { paymentData: paymentSave[0]._id } },
         { new: true, session: mongoSession }
      );

      // clean user cart
      const updatedUser = await User.findByIdAndUpdate(
         { _id: isUserExist._id },
         { $set: { cart: [] } },
         { new: true, session: mongoSession }
      );
      if (!updatedUser) {
         await mongoSession.abortTransaction();
         return res.status(500).json({
            success: false,
            message: "Error updating user cart",
         });
      }

      // Commit transaction
      await mongoSession.commitTransaction();

      return res.status(200).json({
         success: true,
         message: "Payment verified successfully",
         data: {
            orderId: order._id,
            paymentStatus: updateOrder.paymentStatus,
            paymentData: paymentSave[0]
         }
      });

   } catch (error) {
      await mongoSession.abortTransaction();
      return res.status(500).json({
         success: false,
         message: 'Internal server error during payment verification',
         error: error.message
      });
   } finally {
      mongoSession.endSession();
   }
};