import express from 'express';
import { userAuth } from '../middlewares/userAuth.middleware.js';
import { placeOrder } from '../controllers/order.controller.js';

const orderRouter = express.Router();

orderRouter.post('/place-order', userAuth, placeOrder);

export default orderRouter;