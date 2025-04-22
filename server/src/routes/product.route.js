import express from 'express';
import { filterProducts, getProductById, getProducts, searchProducts } from '../controllers/product.controller.js';

const productRouter = express.Router();

// Route to get all products
productRouter.get('/get-products', getProducts);
// Route to search products
productRouter.get('/search', searchProducts);
// Route to get a single product 
productRouter.get('/filter', filterProducts);
// get product by id
productRouter.get('/:slug', getProductById);

export default productRouter;