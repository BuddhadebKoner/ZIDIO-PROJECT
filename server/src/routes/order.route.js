import express from 'express';
import { userAuth } from '../middlewares/userAuth.middleware.js';
import { getOrderById, getOrders, placeOrder } from '../controllers/order.controller.js';

const orderRouter = express.Router();

orderRouter.post('/place-order', userAuth, placeOrder);
// get all orders
orderRouter.get('/get-orders', userAuth, getOrders);
// get order by id
orderRouter.get('/get-order/:trackId', userAuth, getOrderById);

export default orderRouter;