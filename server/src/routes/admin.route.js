import express from 'express'
import { adminAuth } from '../middlewares/adminAuth.middleware.js'
import { addCollection, addOffer, addProduct, removeSingleImage, updateCollection, updateHomeContent, updateOffer, updateProduct } from '../controllers/admin.controller.js'

const adminRouter = express.Router()

// add products   
adminRouter.post('/add-product', adminAuth, addProduct);
// update products
adminRouter.put('/update-product/:slug', adminAuth, updateProduct);
// add collections
adminRouter.post('/add-collection', adminAuth, addCollection)
// update collectionsExist
adminRouter.put('/update-collection/:slug', adminAuth, updateCollection)
// add offer
adminRouter.post('/add-offer', adminAuth, addOffer)
// update offer
adminRouter.put('/update-offer/:slug', adminAuth, updateOffer)
// update home content
adminRouter.put('/update-home', adminAuth, updateHomeContent);
// delete image from cloudinary by public_id
adminRouter.delete('/delete-image', adminAuth, removeSingleImage);

export default adminRouter