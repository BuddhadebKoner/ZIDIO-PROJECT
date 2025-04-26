import express from 'express';
import { userAuth } from '../middlewares/userAuth.middleware.js';
import { addAddress, updateAddress, updateAvatar, updateUserDetails } from '../controllers/user.controller.js';
import { getHomeContent } from '../controllers/admin.controller.js';

const userRouter = express.Router();

// update user profile
userRouter.patch('/update-avatar', userAuth, updateAvatar);
// update user details
userRouter.patch('/update-profile', userAuth, updateUserDetails);
// add address
userRouter.post('/add-address', userAuth, addAddress);
// update address
userRouter.patch('/update-address', userAuth, updateAddress);
// get home content
userRouter.get('/home-content', userAuth, getHomeContent)


export default userRouter;