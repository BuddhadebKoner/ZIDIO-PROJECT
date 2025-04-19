import express from 'express';
import { filterProducts, getProducts, searchProducts } from '../controllers/product.controller.js';

const productRouter = express.Router();

// Route to get all products
productRouter.get('/get-products', getProducts);
// Route to search products
productRouter.get('/search', searchProducts);
// Route to get a single product 
productRouter.get('/filter', filterProducts);

export default productRouter;