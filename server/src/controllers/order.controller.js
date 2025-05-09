import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";
import Stripe from "stripe";
import { v4 as uuidv4 } from "uuid";
import mongoose, { startSession } from "mongoose";


// Constants
const VALID_ORDER_TYPES = ['COD', 'Online', 'COD+Online'];
const ONLINE_PAYMENT_PERCENTAGE = 0.3;
const CASH_PAYMENT_PERCENTAGE = 0.7;


const getStripe = () => {
   return new Stripe(process.env.STRIPE_SECRET_KEY);
};

const validateAuth = (userId) => {
   if (!userId) {
      return {
         isValid: false,
         statusCode: 401,
         message: "Unauthorized"
      };
   }
   return { isValid: true };
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
   if (orderType === 'Online' && payInOnlineAmount !== payableAmount) {
      return {
         isValid: false,
         statusCode: 400,
         message: "Online payment amount should equal total payable amount"
      };
   }

   if (orderType === 'COD' && payInCashAmount !== payableAmount) {
      return {
         isValid: false,
         statusCode: 400,
         message: "Cash payment amount should equal total payable amount"
      };
   }

   if (orderType === 'COD+Online') {
      // Calculate expected amounts with clear rounding to 2 decimal places
      const expectedOnlineAmount = parseFloat((payableAmount * ONLINE_PAYMENT_PERCENTAGE).toFixed(2));
      const expectedCashAmount = parseFloat((payableAmount * CASH_PAYMENT_PERCENTAGE).toFixed(2));

      // Allow for small rounding differences (0.01)
      if (Math.abs(payInOnlineAmount - expectedOnlineAmount) > 0.01 ||
         Math.abs(payInCashAmount - expectedCashAmount) > 0.01) {
         return {
            isValid: false,
            statusCode: 400,
            message: `For COD+Online orders, online payment must be ₹${expectedOnlineAmount.toFixed(2)} (30%) and cash payment must be ₹${expectedCashAmount.toFixed(2)} (70%) of total amount ₹${payableAmount.toFixed(2)} (including delivery charge of ₹${deliveryCharge.toFixed(2)})`
         };
      }
   }

   return { isValid: true };
};


const createOrder = async (orderData, userId, session) => {
   const trackId = uuidv4();

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
      payInOnlineAmount
   } = orderData;

   const lineItems = [];

   if (orderType === 'Online') {
      // For fully online orders, charge the full amount for each product
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

      // Add full delivery charge
      if (deliveryCharge > 0) {
         lineItems.push({
            price_data: {
               currency: 'inr',
               product_data: {
                  name: 'Delivery Charge',
                  description: 'Shipping and handling',
               },
               unit_amount: Math.round(deliveryCharge * 100),
            },
            quantity: 1,
         });
      }
   } else if (orderType === 'COD+Online') {
      // For COD+Online, add a single line item for the 30% advance payment
      lineItems.push({
         price_data: {
            currency: 'inr',
            product_data: {
               name: 'Advance Payment (30%)',
               description: `30% advance payment for your order. Remaining 70% (₹${payInCashAmount.toFixed(2)}) to be paid on delivery.`,
               metadata: {
                  orderType: 'COD+Online',
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
         // Add receipt email with custom description for COD+Online orders
         ...(orderType === 'COD+Online' && {
            payment_intent_data: {
               description: `30% advance payment. Remaining ₹${payInCashAmount.toFixed(2)} due on delivery.`
            }
         }),
         metadata: {
            orderId: orderId.toString(),
            trackId,
            orderType,
            totalAmount: payableAmount.toString(),
            userEmail: user.email || '',
            userName: user.fullName || '',
            // Add these fields for COD+Online orders
            ...(orderType === 'COD+Online' && {
               paymentSplit: '30/70',
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
         shipping_address_collection: {
            allowed_countries: ['IN'],
         },
         shipping_options: [
            {
               shipping_rate_data: {
                  type: 'fixed_amount',
                  fixed_amount: {
                     amount: Math.round(deliveryCharge * 100),
                     currency: 'inr',
                  },
                  display_name: 'Standard shipping',
                  delivery_estimate: {
                     minimum: {
                        unit: 'business_day',
                        value: 3,
                     },
                     maximum: {
                        unit: 'business_day',
                        value: 5,
                     },
                  },
               },
            },
         ],
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


const updateOrderWithPayment = async (orderId, paymentId, session) => {
   try {
      const updatedOrder = await Order.findByIdAndUpdate(
         orderId,
         { $set: { paymentId } },
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
      if (req.body.orderType === 'Online' || req.body.orderType === 'COD+Online') {
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
      if (!order.paymentId) {
         return handleErrorResponse(res, 400, "This order is not paid online");
      }

      // Retrieve payment session from Stripe
      const stripe = getStripe();
      let session;

      try {
         session = await stripe.checkout.sessions.retrieve(order.paymentId);
         if (!session) {
            return handleErrorResponse(res, 400, "Payment session not found");
         }
      } catch (stripeError) {
         return handleErrorResponse(res, 500, "Failed to retrieve payment information", stripeError);
      }

      // Check payment status and update order accordingly
      if (session.payment_status === 'paid') {
         // Update order status to success
         await Order.findByIdAndUpdate(orderId, {
            paymentStatus: 'Success'
         }, { new: true });

         return res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            paymentStatus: 'Success',
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
            paymentStatus: 'Pending',
            session
         });
      } else {
         // Update order status to failed
         await Order.findByIdAndUpdate(orderId, {
            paymentStatus: 'Failed'
         }, { new: true });

         return res.status(200).json({
            success: false,
            message: "Payment failed",
            paymentStatus: 'Failed',
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
      const orders = await Order.find({ user: isUserExist._id })
         .sort({ createdAt: -1 })
         .skip(skip)
         .limit(limit);

      // Get total count for pagination
      const totalOrders = await Order.countDocuments({ user: isUserExist._id });

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

      // Find the order by trackId
      const order = await Order.findOne({ trackId, user: isUserExist._id });

      if (!order) {
         return res.status(404).json({
            success: false,
            message: "Order not found"
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