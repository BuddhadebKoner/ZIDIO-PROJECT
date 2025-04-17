import express from 'express'
import { adminAuth } from '../middlewares/adminAuth.middleware.js'
import { addProduct } from '../controllers/admin.controller.js'

const adminRouter = express.Router()

// add products
adminRouter.post('/add-product', adminAuth, addProduct);

export default adminRouter