import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";
import Stripe from "stripe";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";

// Initialize stripe only when needed
const getStripe = () => {
   return new Stripe(process.env.STRIPE_SECRET_KEY);
};

export const placeOrder = async (req, res) => {
   const session = await mongoose.startSession();
   
   try {
      // Start transaction
      session.startTransaction();
      
      const userId = req.userId;
      const stripe = getStripe();

      if (!userId) {
         return res.status(401).json({
            success: false,
            message: "Unauthorized"
         });
      }

      // check if user exists
      const isUserExist = await User.findOne({ clerkId: userId })
         .populate("address");
      if (!isUserExist) {
         return res.status(404).json({
            success: false,
            message: "User not found"
         });
      }

      const { 
         user, 
         deliveryAddress, 
         payableAmount, 
         totalDiscount, 
         orderType, 
         payInCashAmount, 
         payInOnlineAmount, 
         purchaseProducts,
         deliveryCharge,
         cartTotal 
      } = req.body;

      // console.log("Order data:", req.body);

      // Validate request body
      if (!user || !deliveryAddress || !payableAmount || !orderType || !purchaseProducts || deliveryCharge === undefined) {
         return res.status(400).json({
            success: false,
            message: "Missing required fields"
         });
      }

      // check user is same as userId
      if (user !== isUserExist._id.toString()) {
         return res.status(403).json({
            success: false,
            message: "Context mismatch. This order does not belong to you."
         });
      }

      // Validate delivery address
      const userAddress = await mongoose.model("Address").findOne({
         _id: deliveryAddress,
         userId: isUserExist._id
      });
      
      if (!userAddress) {
         return res.status(404).json({
            success: false,
            message: "Address not found or does not belong to user"
         });
      }

      // check if purchaseProducts is empty
      if (!purchaseProducts || purchaseProducts.length === 0) {
         return res.status(400).json({
            success: false,
            message: "No products found in the order"
         });
      }

      // Validate payment amounts
      const calculatedTotal = purchaseProducts.reduce((total, item) => total + item.payableAmount, 0);
      if (Math.abs(calculatedTotal - cartTotal) > 1) { // Allow for small rounding differences
         return res.status(400).json({
            success: false,
            message: "Cart total doesn't match the sum of product prices"
         });
      }
      
      // Validate final amount includes delivery charge
      if (Math.abs((cartTotal + deliveryCharge) - payableAmount) > 1) {
         return res.status(400).json({
            success: false,
            message: "Payable amount should equal cart total plus delivery charge"
         });
      }

      // Validate payment type and amounts
      if (orderType === 'Online' && payInOnlineAmount !== payableAmount) {
         return res.status(400).json({
            success: false,
            message: "Online payment amount should equal total payable amount"
         });
      }

      if (orderType === 'COD' && payInCashAmount !== payableAmount) {
         return res.status(400).json({
            success: false,
            message: "Cash payment amount should equal total payable amount"
         });
      }

      // if (orderType === 'COD+Online' && (payInCashAmount + payInOnlineAmount !== payableAmount)) {
      //    return res.status(400).json({
      //       success: false,
      //       message: "Sum of cash and online payment amounts should equal total payable amount"
      //    });
      // }

      if (orderType === 'COD+Online') {
         // Validate the 30/70 split ratio
         // Make it explicit that we're including delivery charge in the calculation
         const totalWithDelivery = payableAmount; // payableAmount already includes delivery charge
         
         // Calculate expected amounts with clear rounding to 2 decimal places
         const expectedOnlineAmount = parseFloat((totalWithDelivery * 0.3).toFixed(2)); // 30% of total
         const expectedCashAmount = parseFloat((totalWithDelivery * 0.7).toFixed(2));  // 70% of total
         
         // Allow for small rounding differences (0.01)
         if (Math.abs(payInOnlineAmount - expectedOnlineAmount) > 0.01 || 
             Math.abs(payInCashAmount - expectedCashAmount) > 0.01) {
            return res.status(400).json({
               success: false,
               message: `For COD+Online orders, online payment must be ₹${expectedOnlineAmount.toFixed(2)} (30%) and cash payment must be ₹${expectedCashAmount.toFixed(2)} (70%) of total amount ₹${totalWithDelivery.toFixed(2)} (including delivery charge of ₹${deliveryCharge.toFixed(2)})`
            });
         }
      }

      // check if orderType is valid
      const validOrderTypes = ['COD', 'Online', 'COD+Online'];
      if (!validOrderTypes.includes(orderType)) {
         return res.status(400).json({
            success: false,
            message: "Invalid order type"
         });
      }

      // create trackId using uuidv4 
      const trackId = uuidv4();

      const newOrder = await Order.create([{
         user: isUserExist._id, 
         trackId,
         purchaseProducts,
         deliveryAddress,
         payableAmount,
         totalDiscount,
         orderType,
         payInCashAmount,
         payInOnlineAmount,
         deliveryCharge,
         cartTotal
      }], { session });
      
      if (!newOrder || newOrder.length === 0) {
         // Properly abort the transaction
         await session.abortTransaction();
         return res.status(500).json({
            success: false,
            message: "Failed to place order"
         });
      }

      const orderDocument = newOrder[0];

      // Only create payment session if there's an online component to the payment
      if (orderType === 'Online' || orderType === 'COD+Online') {
         // First ensure user has a Stripe customer ID
         let stripeCustomerId = isUserExist.stripeCustomerId;
         
         if (!stripeCustomerId) {
            // Create a new customer in Stripe
            const customer = await stripe.customers.create({
               email: isUserExist.email,
               name: isUserExist.fullName || '',
               metadata: {
                  userId: isUserExist._id.toString()
               }
            });
            
            stripeCustomerId = customer.id;
            
            // Save the Stripe customer ID to the user record
            await User.findByIdAndUpdate(
               isUserExist._id,
               { stripeCustomerId: stripeCustomerId },
               { session }
            );
         }

         const line_items = [];

         if (orderType === 'Online') {
            // For fully online orders, charge the full amount for each product
            purchaseProducts.forEach(item => {
               line_items.push({
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
               line_items.push({
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
            line_items.push({
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

         // Create Stripe session with enhanced metadata and customer settings
         const stripeSession = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            line_items: line_items,
            mode: 'payment',
            payment_method_types: ['card'],
            success_url: `${process.env.CLIENT_URL}/verify?success=true&orderId=${orderDocument._id}`,
            cancel_url: `${process.env.CLIENT_URL}/verify?success=false&orderId=${orderDocument._id}`,
            // Add receipt email with custom description for COD+Online orders
            ...(orderType === 'COD+Online' && {
               payment_intent_data: {
                  description: `30% advance payment. Remaining ₹${payInCashAmount.toFixed(2)} due on delivery.`
               }
            }),
            metadata: {
               orderId: orderDocument._id.toString(),
               trackId: trackId,
               orderType: orderType,
               totalAmount: payableAmount.toString(),
               userEmail: isUserExist.email || '',
               userName: isUserExist.fullName || '',
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

         // save payment id to order
         await Order.findByIdAndUpdate(
            orderDocument._id, 
            { $set: { paymentId: stripeSession.id } }, 
            { session, new: true }
         );

         // save order id to user
         await User.findByIdAndUpdate(
            isUserExist._id, 
            { $push: { orders: orderDocument._id } }, 
            { session, new: true }
         );

         // Properly commit the transaction
         await session.commitTransaction();

         return res.status(200).json({
            success: true,
            message: "Order placed successfully",
            orderId: orderDocument._id,
            trackId: trackId,
            sessionData: {
               url: stripeSession.url,
               id: stripeSession.id
            },
         });
      } else if (orderType === 'COD') {
         // update user's order 
         await User.findByIdAndUpdate(
            isUserExist._id, 
            { $push: { orders: orderDocument._id } }, 
            { session, new: true }
         );

         // Properly commit the transaction
         await session.commitTransaction();

         // For COD orders, no payment session needed
         return res.status(200).json({
            success: true,
            message: "Order placed successfully",
            orderId: orderDocument._id,
            trackId: trackId
         });
      }
   } catch (error) {
      // Properly abort the transaction on error
      await session.abortTransaction();
      
      console.error("Order placement error:", error);
      return res.status(500).json({
         success: false,
         message: "Internal server error",
         error: error.message
      });
   } finally {
      // Always end the session
      session.endSession();
   }
};

export const verifyPayment = async (req, res) => {
   try {
      const stripe = getStripe();
      const { orderId, paymentSuccess } = req.body;
      const userId = req.userId;

      if (!userId) {
         return res.status(401).json({
            success: false,
            message: "Unauthorized"
         });
      }

      if (!orderId) {
         return res.status(400).json({
            success: false,
            message: "Order ID is required"
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
      const order = await Order.findById(orderId)
      if (!order) {
         return res.status(404).json({
            success: false,
            message: "Order not found"
         });
      }

      // check this order.user is same as user._id
      if (order.user.toString() !== user._id.toString()) {
         return res.status(403).json({
            success: false,
            message: "Context mismatch. This order does not belong to you."
         });
      }
      
      if (!order.paymentId) {
         return res.status(400).json({
            success: false,
            message: "This order is not paid online"
         });
      }
      
      // Verify the payment status
      const session = await stripe.checkout.sessions.retrieve(order.paymentId);
      if (!session) {
         return res.status(400).json({
            success: false,
            message: "Payment session not found"
         });
      }

      // Check if payment was successful
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
      return res.status(500).json({
         success: false,
         message: "Internal server error",
         error: error.message
      });
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