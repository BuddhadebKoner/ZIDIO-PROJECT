import express from 'express';
import { userAuth } from '../middlewares/userAuth.middleware.js';
import { updateAvatar, updateUserDetails } from '../controllers/user.controller.js';

const userRouter = express.Router();

// update user profile
userRouter.patch('/update-avatar', userAuth, updateAvatar);
// update user details
userRouter.patch('/update-profile', userAuth, updateUserDetails);


export default userRouter;