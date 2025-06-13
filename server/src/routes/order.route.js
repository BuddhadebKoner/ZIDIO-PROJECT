import express from 'express';
import { userAuth } from '../middlewares/userAuth.middleware.js';
import { getOrderById, getOrders } from '../controllers/order.controller.js';
import { placeOrderCashAndOnlineMixed, placeOrderCashOnDelivery, placeOrderOnlinePayment, verifyPayment } from '../contro  llers/orderExample.controller.js';

const orderRouter = express.Router();

// place order online payment
orderRouter.post('/place-order-online', userAuth, placeOrderOnlinePayment);
// place order with cash on delivery
orderRouter.post('/place-order-cod', userAuth, placeOrderCashOnDelivery);
// place order with online and cash 
orderRouter.post('/place-order-online-cash', userAuth, placeOrderCashAndOnlineMixed);

// get all orders
orderRouter.get('/get-orders', userAuth, getOrders);
// get order by id
orderRouter.get('/get-order/:trackId', userAuth, getOrderById);
// veryfy order
orderRouter.post('/verify-payment', userAuth, verifyPayment);

export default orderRouter;