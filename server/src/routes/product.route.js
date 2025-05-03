import express from 'express';
import { addToCart, addTowishlist, filterProducts, getProductById, getProducts, searchProducts } from '../controllers/product.controller.js';
import { userAuth } from '../middlewares/userAuth.middleware.js';

const productRouter = express.Router();

// Route to get all products
productRouter.get('/get-products', getProducts);
// Route to search products
productRouter.get('/search', searchProducts);
// Route to get a single product 
productRouter.get('/filter', filterProducts);
// get product by id
productRouter.get('/:slug', getProductById);
// add to wishlist
productRouter.post('/add-to-wishlist', userAuth, addTowishlist);
// add to cart
productRouter.post('/add-to-cart', userAuth, addToCart);

export default productRouter;