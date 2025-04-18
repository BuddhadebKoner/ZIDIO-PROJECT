import express from 'express';
import { getProducts, searchProducts } from '../controllers/product.controller.js';

const productRouter = express.Router();

// Route to get all products
productRouter.get('/get-products', getProducts);
// Route to search products
productRouter.get('/search', searchProducts);

export default productRouter;