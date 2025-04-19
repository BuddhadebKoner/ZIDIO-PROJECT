import express from 'express'
import { adminAuth } from '../middlewares/adminAuth.middleware.js'
import { addCollection, addOffer, addProduct } from '../controllers/admin.controller.js'

const adminRouter = express.Router()

// add products   
adminRouter.post('/add-product', adminAuth, addProduct);
// add collections
adminRouter.post('/add-collection', adminAuth, addCollection)
// add offer
adminRouter.post('/add-offer', adminAuth, addOffer)

export default adminRouter