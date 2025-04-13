// src/routes/auth.route.js
import express from 'express';
import { isAuthenticated } from '../controllers/auth.controller.js';
import { userAuth } from '../middlewares/userAuth.middleware.js';

const authRouter = express.Router();

// Check if user is authenticated
authRouter.post('/is-authenticated', userAuth, isAuthenticated);

export default authRouter;