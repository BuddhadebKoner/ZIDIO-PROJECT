import express from 'express'
import { adminAuth } from '../middlewares/adminAuth.middleware.js'
import { addCollection, addOffer, addProduct, updateProduct } from '../controllers/admin.controller.js'

const adminRouter = express.Router()

// add products   
adminRouter.post('/add-product', adminAuth, addProduct);
// update products
adminRouter.put('/update-product/:slug', adminAuth, updateProduct);
// add collections
adminRouter.post('/add-collection', adminAuth, addCollection)
// add offer
adminRouter.post('/add-offer', adminAuth, addOffer)

export default adminRouter