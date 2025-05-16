import express from 'express';
import { addReview, addToCart, addTowishlist, filterProducts, getProductById, getProducts, getReviewsById, removeFromCart, removeFromWishlist, searchProducts, updateCart } from '../controllers/product.controller.js';
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
// remove from wishlist
productRouter.post('/remove-from-wishlist', userAuth, removeFromWishlist);
// add to cart
productRouter.post('/add-to-cart', userAuth, addToCart);
// remove from cart
productRouter.post('/remove-from-cart', userAuth, removeFromCart);
// update cart quantity and size
productRouter.put('/update-cart', userAuth, updateCart);
// add review
productRouter.post('/add-review', userAuth, addReview);
// get all reviews by product id
productRouter.get('/get-reviews/:slug', getReviewsById);

export default productRouter;