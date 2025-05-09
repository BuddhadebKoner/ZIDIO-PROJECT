import express from 'express';
import { userAuth } from '../middlewares/userAuth.middleware.js';
import { getOrderById, getOrders, placeOrder, verifyPayment } from '../controllers/order.controller.js';

const orderRouter = express.Router();

// place order
orderRouter.post('/place-order', userAuth, placeOrder);
// get all orders
orderRouter.get('/get-orders', userAuth, getOrders);
// get order by id
orderRouter.get('/get-order/:trackId', userAuth, getOrderById);
// veryfy order
orderRouter.post('/verify-payment', userAuth, verifyPayment);

export default orderRouter;