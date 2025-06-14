import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";
import { Address } from "../models/address.model.js";
import Stripe from "stripe";
import { v4 as uuidv4 } from "uuid";
import mongoose, { startSession } from "mongoose";
import { Payment } from "../models/payment.model.js";
import { Inventory } from "../models/inventory.model.js";
import { Product } from "../models/product.model.js";

// Constants
const VALID_ORDER_TYPES = ['COD', 'ONLINE', 'COD+ONLINE'];
const FREE_DELIVERY_THRESHOLD = 1000;
const DELIVERY_CHARGE_AMOUNT = 49;
const MAXIMUM_ORDER_AMOUNT_LIMIT = 100000;
const MINIMUM_PARTIAL_PAYMENT = 100;
const MINIMUM_ORDER_AMOUNT = 10;
const PRICE_TOLERANCE = 0.01; 
const MAX_QUANTITY_PER_ITEM = 10;


const getStripe = () => {
   return new Stripe(process.env.STRIPE_SECRET_KEY);
};

// Enhanced validation function for user authentication and Stripe customer setup
const validateAuth = async (userId, session) => {
   if (!userId) {
      return null;
   }
   
   const user = await User.findOne({ clerkId: userId })
      .populate("address")
      .session(session || null);
   
   return user;
};

const getAndVerifyUser = async (userId, session = null) => {
   const user = await User.findOne({ clerkId: userId })
      .populate("address")
      .session(session || null);

   if (!user) {
      return {
         user: null,
         error: {
            statusCode: 404,
            message: "User not found"
         }
      };
   }

   return { user, error: null };
};

const validateOrderData = (orderData) => {
   const {
      user,
      deliveryAddress,
      payableAmount,
      orderType,
      purchaseProducts,
      deliveryCharge
   } = orderData;

   // Check required fields
   if (!user || !deliveryAddress || !payableAmount || !orderType || !purchaseProducts || deliveryCharge === undefined) {
      return {
         isValid: false,
         statusCode: 400,
         message: "Missing required fields"
      };
   }

   // Check if order type is valid
   if (!VALID_ORDER_TYPES.includes(orderType)) {
      return {
         isValid: false,
         statusCode: 400,
         message: "Invalid order type"
      };
   }

   // Check if purchase products is empty
   if (!purchaseProducts || purchaseProducts.length === 0) {
      return {
         isValid: false,
         statusCode: 400,
         message: "No products found in the order"
      };
   }

   return { isValid: true };
};

const validateDeliveryAddress = async (addressId, userId, session = null) => {
   const userAddress = await mongoose.model("Address").findOne({
      _id: addressId,
      userId: userId
   }).session(session || null);

   if (!userAddress) {
      return {
         isValid: false,
         statusCode: 404,
         message: "Address not found or does not belong to user"
      };
   }

   return { isValid: true };
};

const validatePaymentAmounts = (orderData) => {
   const {
      purchaseProducts,
      cartTotal,
      deliveryCharge,
      payableAmount,
      orderType,
      payInCashAmount,
      payInOnlineAmount
   } = orderData;

   // Validate cart total matches sum of product prices
   const calculatedTotal = purchaseProducts.reduce((total, item) => total + item.payableAmount, 0);
   if (Math.abs(calculatedTotal - cartTotal) > 1) { // Allow for small rounding differences
      return {
         isValid: false,
         statusCode: 400,
         message: "Cart total doesn't match the sum of product prices"
      };
   }

   // Validate final amount includes delivery charge
   if (Math.abs((cartTotal + deliveryCharge) - payableAmount) > 1) {
      return {
         isValid: false,
         statusCode: 400,
         message: "Payable amount should equal cart total plus delivery charge"
      };
   }

   // Validate payment type and amounts
   if (orderType === 'ONLINE' && payInOnlineAmount !== payableAmount) {
      return {
         isValid: false,
         statusCode: 400,
         message: "ONLINE payment amount should equal total payable amount"
      };
   }

   if (orderType === 'COD' && payInCashAmount !== payableAmount) {
      return {
         isValid: false,
         statusCode: 400,
         message: "Cash payment amount should equal total payable amount"
      };
   }

   if (orderType === 'COD+ONLINE') {
      // Check that both payment methods have values greater than 0
      if (payInOnlineAmount <= 0 || payInCashAmount <= 0) {
         return {
            isValid: false,
            statusCode: 400,
            message: "For COD+ONLINE orders, both ONLINE and cash payment amounts must be greater than 0"
         };
      }

      // Validate sum equals total (allowing for small rounding differences)
      if (Math.abs(payInOnlineAmount + payInCashAmount - payableAmount) > 1) {
         return {
            isValid: false,
            statusCode: 400,
            message: `Total payable amount (₹${payableAmount}) should equal the sum of ONLINE (₹${payInOnlineAmount}) and cash (₹${payInCashAmount}) amounts`
         };
      }
   }

   return { isValid: true };
};


const createOrder = async (orderData, userId, session) => {
   const trackId = uuidv4();

   console.log(orderData);

   try {
      const newOrder = await Order.create([{
         user: userId,
         trackId,
         purchaseProducts: orderData.purchaseProducts,
         deliveryAddress: orderData.deliveryAddress,
         payableAmount: orderData.payableAmount,
         totalDiscount: orderData.totalDiscount,
         orderType: orderData.orderType,
         payInCashAmount: orderData.payInCashAmount,
         payInOnlineAmount: orderData.payInOnlineAmount,
         deliveryCharge: orderData.deliveryCharge,
         cartTotal: orderData.cartTotal
      }], { session });

      if (!newOrder || newOrder.length === 0) {
         return {
            order: null,
            error: {
               statusCode: 500,
               message: "Failed to create order"
            }
         };
      }

      return { order: newOrder[0], trackId, error: null };
   } catch (err) {
      return {
         order: null,
         error: {
            statusCode: 500,
            message: "Order creation failed",
            details: err.message
         }
      };
   }
};

const updateUserWithOrder = async (userId, orderId, session) => {
   try {
      const updatedUser = await User.findByIdAndUpdate(
         userId,
         { $push: { orders: orderId } },
         { session, new: true }
      );

      if (!updatedUser) {
         return {
            success: false,
            error: {
               statusCode: 500,
               message: "Failed to update user with order"
            }
         };
      }

      return { success: true, error: null };
   } catch (err) {
      return {
         success: false,
         error: {
            statusCode: 500,
            message: "User update failed",
            details: err.message
         }
      };
   }
};

const ensureStripeCustomer = async (user, stripe, session) => {
   try {
      let stripeCustomerId = user.stripeCustomerId;

      if (!stripeCustomerId) {
         // Create a new customer in Stripe
         const customer = await stripe.customers.create({
            email: user.email,
            name: user.fullName || '',
            metadata: {
               userId: user._id.toString()
            }
         });

         stripeCustomerId = customer.id;

         // Save the Stripe customer ID to the user record
         await User.findByIdAndUpdate(
            user._id,
            { stripeCustomerId },
            { session }
         );
      }

      return { stripeCustomerId, error: null };
   } catch (err) {
      return {
         stripeCustomerId: null,
         error: {
            statusCode: 500,
            message: "Failed to create Stripe customer",
            details: err.message
         }
      };
   }
};

const prepareStripeLineItems = (orderData) => {
   const {
      orderType,
      purchaseProducts,
      deliveryCharge,
      payInCashAmount,
      payInOnlineAmount,
      payableAmount
   } = orderData;

   const lineItems = [];

   if (orderType === 'ONLINE') {
      // For fully ONLINE orders, charge the full amount for each product
      purchaseProducts.forEach(item => {
         lineItems.push({
            price_data: {
               currency: 'inr',
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

      // Add delivery charge
      if (deliveryCharge > 0) {
         lineItems.push({
            price_data: {
               currency: 'inr',
               product_data: {
                  name: 'Delivery Charge',
                  description: 'Delivery fee',
               },
               unit_amount: Math.round(deliveryCharge * 100),
            },
            quantity: 1,
         });
      }
   } else if (orderType === 'COD+ONLINE') {
      // For COD+ONLINE, add a single line item for the partial ONLINE payment
      const onlinePercentage = Math.round((payInOnlineAmount / payableAmount) * 100);

      lineItems.push({
         price_data: {
            currency: 'inr',
            product_data: {
               name: 'Partial ONLINE Payment',
               description: `${onlinePercentage}% ONLINE payment for your order. Remaining ₹${payInCashAmount.toFixed(2)} to be paid on delivery.`,
               metadata: {
                  orderType: 'COD+ONLINE',
                  cashAmount: payInCashAmount.toString(),
                  onlineAmount: payInOnlineAmount.toString()
               }
            },
            unit_amount: Math.round(payInOnlineAmount * 100),
         },
         quantity: 1,
      });
   }

   return lineItems;
};

const createStripeCheckoutSession = async ({
   stripe,
   lineItems,
   stripeCustomerId,
   orderType,
   payableAmount,
   payInCashAmount,
   payInOnlineAmount,
   deliveryCharge,
   orderId,
   trackId,
   user
}) => {
   try {
      const stripeSession = await stripe.checkout.sessions.create({
         customer: stripeCustomerId,
         line_items: lineItems,
         mode: 'payment',
         payment_method_types: ['card'],
         success_url: `${process.env.CLIENT_URL}/verify?success=true&orderId=${orderId}`,
         cancel_url: `${process.env.CLIENT_URL}/verify?success=false&orderId=${orderId}`,
         ...(orderType === 'COD+ONLINE' && {
            payment_intent_data: {
               description: `Partial ONLINE payment. Remaining ₹${payInCashAmount.toFixed(2)} due on delivery.`
            }
         }),
         metadata: {
            orderId: orderId.toString(),
            trackId,
            orderType,
            totalAmount: payableAmount.toString(),
            userEmail: user.email || '',
            userName: user.fullName || '',
            ...(orderType === 'COD+ONLINE' && {
               paymentSplit: `${Math.round((payInOnlineAmount / payableAmount) * 100)}/${Math.round((payInCashAmount / payableAmount) * 100)}`,
               onlineAmount: payInOnlineAmount.toString(),
               cashAmount: payInCashAmount.toString()
            })
         },
         // Enable payment method reuse
         payment_method_options: {
            card: {
               setup_future_usage: 'on_session'
            }
         },
         billing_address_collection: 'required',
      });

      return { session: stripeSession, error: null };
   } catch (err) {
      return {
         session: null,
         error: {
            statusCode: 500,
            message: "Failed to create payment session",
            details: err.message
         }
      };
   }
};

const updateOrderWithPayment = async (orderId, seasionId, session) => {
   try {
      const updatedOrder = await Order.findByIdAndUpdate(
         orderId,
         { $set: { seasionId } },
         { session, new: true }
      );

      if (!updatedOrder) {
         return {
            success: false,
            error: {
               statusCode: 500,
               message: "Failed to update order with payment ID"
            }
         };
      }

      return { success: true, error: null };
   } catch (err) {
      return {
         success: false,
         error: {
            statusCode: 500,
            message: "Order update failed",
            details: err.message
         }
      };
   }
};

const verifyOrderOwnership = (order, userId) => {
   if (order.user.toString() !== userId.toString()) {
      return {
         isValid: false,
         statusCode: 403,
         message: "Context mismatch. This order does not belong to you."
      };
   }
   return { isValid: true };
};

const getOrderByOrderID = async (orderId) => {
   try {
      const order = await Order.findById(orderId);

      if (!order) {
         return {
            order: null,
            error: {
               statusCode: 404,
               message: "Order not found"
            }
         };
      }

      return { order, error: null };
   } catch (err) {
      return {
         order: null,
         error: {
            statusCode: 500,
            message: "Error retrieving order",
            details: err.message
         }
      };
   }
};

const handleErrorResponse = (res, statusCode, message, error = null) => {
   return res.status(statusCode).json({
      success: false,
      message,
      ...(error && { error: error.message || error })
   });
};

export const placeOrder = async (req, res) => {
   const session = await startSession();

   try {
      // Start transaction
      session.startTransaction();

      const userId = req.userId;

      // Validate authentication
      const authValidation = validateAuth(userId);
      if (!authValidation.isValid) {
         return handleErrorResponse(res, authValidation.statusCode, authValidation.message);
      }

      // Get and verify user
      const { user, error: userError } = await getAndVerifyUser(userId, session);
      if (userError) {
         return handleErrorResponse(res, userError.statusCode, userError.message);
      }

      // Validate request body
      const validation = validateOrderData(req.body);
      if (!validation.isValid) {
         return handleErrorResponse(res, validation.statusCode, validation.message);
      }

      // Check user matches the order user
      if (req.body.user !== user._id.toString()) {
         return handleErrorResponse(res, 403, "Context mismatch. This order does not belong to you.");
      }

      // Validate delivery address
      const addressValidation = await validateDeliveryAddress(req.body.deliveryAddress, user._id, session);
      if (!addressValidation.isValid) {
         return handleErrorResponse(res, addressValidation.statusCode, addressValidation.message);
      }

      // Validate payment amounts
      const paymentValidation = validatePaymentAmounts(req.body);
      if (!paymentValidation.isValid) {
         return handleErrorResponse(res, paymentValidation.statusCode, paymentValidation.message);
      }

      // Create order
      const { order, trackId, error: orderError } = await createOrder(req.body, user._id, session);
      if (orderError) {
         return handleErrorResponse(res, orderError.statusCode, orderError.message, orderError.details);
      }

      // Handle different order types
      if (req.body.orderType === 'ONLINE' || req.body.orderType === 'COD+ONLINE') {
         const stripe = getStripe();

         // Ensure user has a Stripe customer ID
         const { stripeCustomerId, error: stripeError } = await ensureStripeCustomer(user, stripe, session);
         if (stripeError) {
            return handleErrorResponse(res, stripeError.statusCode, stripeError.message, stripeError.details);
         }

         // Prepare line items for Stripe checkout
         const lineItems = prepareStripeLineItems(req.body);

         // Create Stripe checkout session
         const { session: stripeSession, error: sessionError } = await createStripeCheckoutSession({
            stripe,
            lineItems,
            stripeCustomerId,
            orderType: req.body.orderType,
            payableAmount: req.body.payableAmount,
            payInCashAmount: req.body.payInCashAmount,
            payInOnlineAmount: req.body.payInOnlineAmount,
            deliveryCharge: req.body.deliveryCharge,
            orderId: order._id,
            trackId,
            user
         });

         if (sessionError) {
            return handleErrorResponse(res, sessionError.statusCode, sessionError.message, sessionError.details);
         }

         // Update order with payment ID
         const { success: paymentUpdateSuccess, error: paymentUpdateError } =
            await updateOrderWithPayment(order._id, stripeSession.id, session);

         if (!paymentUpdateSuccess) {
            return handleErrorResponse(
               res,
               paymentUpdateError.statusCode,
               paymentUpdateError.message,
               paymentUpdateError.details
            );
         }

         // Update user with order reference
         const { success: userUpdateSuccess, error: userUpdateError } =
            await updateUserWithOrder(user._id, order._id, session);

         if (!userUpdateSuccess) {
            return handleErrorResponse(
               res,
               userUpdateError.statusCode,
               userUpdateError.message,
               userUpdateError.details
            );
         }

         console.log("Stripe session created:", stripeSession);

         // Commit transaction
         await session.commitTransaction();

         return res.status(200).json({
            success: true,
            message: "Order placed successfully",
            orderId: order._id,
            trackId,
            sessionData: {
               url: stripeSession.url,
               id: stripeSession.id
            },
         });
      } else if (req.body.orderType === 'COD') {
         // Update user with order reference
         const { success: userUpdateSuccess, error: userUpdateError } =
            await updateUserWithOrder(user._id, order._id, session);

         if (!userUpdateSuccess) {
            return handleErrorResponse(
               res,
               userUpdateError.statusCode,
               userUpdateError.message,
               userUpdateError.details
            );
         }

         // Commit transaction
         await session.commitTransaction();

         return res.status(200).json({
            success: true,
            message: "Order placed successfully",
            orderId: order._id,
            trackId
         });
      }
   } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();

      console.error("Order placement error:", error);
      return handleErrorResponse(res, 500, "Internal server error", error);
   } finally {
      // Always end the session
      session.endSession();
   }
};


export const verifyPayment = async (req, res) => {
   try {
      const { orderId } = req.body;
      const userId = req.userId;

      // Validate authentication
      const authValidation = validateAuth(userId);
      if (!authValidation.isValid) {
         return handleErrorResponse(res, authValidation.statusCode, authValidation.message);
      }

      // Validate order ID
      if (!orderId) {
         return handleErrorResponse(res, 400, "Order ID is required");
      }

      // Get and verify user
      const { user, error: userError } = await getAndVerifyUser(userId);
      if (userError) {
         return handleErrorResponse(res, userError.statusCode, userError.message);
      }

      // Get order by ID
      const { order, error: orderError } = await getOrderByOrderID(orderId);

      if (orderError) {
         return handleErrorResponse(res, orderError.statusCode, orderError.message);
      }

      // Verify order ownership
      const ownershipValidation = verifyOrderOwnership(order, user._id);
      if (!ownershipValidation.isValid) {
         return handleErrorResponse(res, ownershipValidation.statusCode, ownershipValidation.message);
      }

      // Check if order has payment ID
      if (!order.sessionId) {
         return handleErrorResponse(res, 400, "This order is not paid ONLINE");
      }

      // Retrieve payment session from Stripe
      const stripe = getStripe();
      let session;

      try {
         session = await stripe.checkout.sessions.retrieve(order.sessionId);
         if (!session) {
            return handleErrorResponse(res, 404, "Payment session not found");
         }
      } catch (stripeError) {
         return handleErrorResponse(res, 500, "Failed to retrieve payment information", stripeError);
      }

      // Check payment status and update order accordingly
      if (session.payment_status === 'paid') {
         // Update order status to success
         await Order.findByIdAndUpdate(orderId, {
            paymentStatus: 'paid'
         }, { new: true });

         // fetch payment details from stripe
         const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);

         // console.log("Payment Intent:", paymentIntent);

         // Create payment record
         const paymentData = {
            orderId: order._id,
            paymentStatus: paymentIntent.status,
            paymentMethod: session.payment_method_types[0],
            transactionId: paymentIntent.id,
            stripeUserId: paymentIntent.customer,
            paymentDate: new Date(),
            paymentTime: new Date().toLocaleTimeString(),
            stripeSeasionId: session.id,
            amount: paymentIntent.amount_received / 100,
         };

         const paymentSave = await Payment.create(paymentData);
         if (!paymentSave) {
            return handleErrorResponse(res, 500, "Failed to save payment information");
         }

         // Prepare the bulk operations for inventory updates
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

         // Execute the bulk operation to update inventory
         if (bulkOps.length > 0) {
            try {
               const inventoryResult = await Inventory.bulkWrite(bulkOps);

               if (!inventoryResult || inventoryResult.modifiedCount === 0) {
                  console.error("Inventory update failed:", inventoryResult);
               }
            } catch (inventoryError) {
               console.error("Error updating inventory:", inventoryError);
            }
         }

         // Update order with payment details
         await Order.findByIdAndUpdate(orderId, {
            $push: { paymentData: paymentSave._id }
         }, { new: true });

         return res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            paymentStatus: 'paid',
            order: {
               id: order._id,
               trackId: order.trackId,
               status: order.orderStatus,
               amount: order.payableAmount
            }
         });
      } else if (session.payment_status === 'unpaid') {
         return res.status(200).json({
            success: true,
            message: "Payment is pending",
            paymentStatus: 'unpaid',
            session
         });
      } else {
         // Update order status to failed
         await Order.findByIdAndUpdate(orderId, {
            paymentStatus: 'unpaid'
         }, { new: true });

         return res.status(200).json({
            success: false,
            message: "Payment failed",
            paymentStatus: 'unpaid',
            session
         });
      }
   } catch (error) {
      return handleErrorResponse(res, 500, "Internal server error", error);
   }
};


export const getOrders = async (req, res) => {
   try {
      const userId = req.userId;
      if (!userId) {
         return res.status(401).json({
            success: false,
            message: "Unauthorized"
         });
      }

      // is user exist
      const isUserExist = await User.findOne({ clerkId: userId });
      if (!isUserExist) {
         return res.status(404).json({
            success: false,
            message: "User not found"
         });
      }

      let { page, limit } = req.query;
      page = parseInt(page) || 1;
      limit = parseInt(limit) || 5;

      if (page < 1 || limit < 1) {
         return res.status(400).json({
            success: false,
            message: "Invalid pagination parameters.",
         });
      }
      const skip = (page - 1) * limit;

      // Query orders directly using user's ID
      // Add condition to exclude unpaid ONLINE orders
      const orders = await Order.find({
         user: isUserExist._id,
         $nor: [{ orderType: 'ONLINE', paymentStatus: 'unpaid' }]
      })
         .populate("paymentData")
         .sort({ createdAt: -1 })
         .skip(skip)
         .limit(limit);

      // Get total count for pagination (excluding unpaid ONLINE orders)
      const totalOrders = await Order.countDocuments({
         user: isUserExist._id,
         $nor: [{ orderType: 'ONLINE', paymentStatus: 'unpaid' }]
      });

      return res.status(200).json({
         success: true,
         orders,
         totalOrders,
         currentPage: page,
         totalPages: Math.ceil(totalOrders / limit)
      });

   } catch (error) {
      return res.status(500).json({
         success: false,
         message: "Internal server error",
         error: error.message
      });
   }
}

export const getOrderById = async (req, res) => {
   try {
      const userId = req.userId;
      if (!userId) {
         return res.status(401).json({
            success: false,
            message: "Unauthorized"
         });
      }

      // is user exist
      const isUserExist = await User.findOne({ clerkId: userId });
      if (!isUserExist) {
         return res.status(404).json({
            success: false,
            message: "User not found"
         });
      }

      const { trackId } = req.params;

      // Find the order by trackId with security check for unpaid ONLINE orders
      // populate deliveryAddress
      const order = await Order.findOne({
         trackId,
         $nor: [{ orderType: 'ONLINE', paymentStatus: 'unpaid' }]
      }).populate("deliveryAddress paymentData")

      // console.log("Order:", order);

      if (!order) {
         return res.status(404).json({
            success: false,
            message: "Order not found or access restricted"
         });
      }

      return res.status(200).json({
         success: true,
         message: "Order fetched successfully",
         order
      });
   } catch (error) {
      return res.status(500).json({
         success: false,
         message: "Internal server error",
         error: error.message
      });
   }
}