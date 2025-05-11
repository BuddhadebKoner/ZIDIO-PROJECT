import express from 'express';
import { userAuth } from '../middlewares/userAuth.middleware.js';
import { addAddress, extreamSearch, getCartProducts, updateAddress, updateAvatar, updateUserDetails } from '../controllers/user.controller.js';
import { getHomeContent } from '../controllers/admin.controller.js';
import { getHomeContentDetails } from '../controllers/public.controller.js';

const userRouter = express.Router();

// update user profile
userRouter.patch('/update-avatar', userAuth, updateAvatar);
// update user details
userRouter.patch('/update-profile', userAuth, updateUserDetails);
// add address
userRouter.post('/add-address', userAuth, addAddress);
// update address
userRouter.patch('/update-address', userAuth, updateAddress);
// get home content for admin panal 
userRouter.get('/home-content', userAuth, getHomeContent);
// get home content for user panal
userRouter.get('/home-content-details', getHomeContentDetails);
// extream search whole database
userRouter.get('/extream-search', extreamSearch);
// get cart products
userRouter.get('/cart-products', userAuth, getCartProducts);               


export default userRouter;