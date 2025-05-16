import express from 'express'
import { adminAuth } from '../middlewares/adminAuth.middleware.js'
import { addCollection, addOffer, addProduct, getCustomers, getDashboardStats, getInventoryBySlug, getInventorys, getOrders, getReviews, removeSingleImage, updateCollection, updateHomeContent, updateInventory, updateOffer, updateOrder, updateProduct } from '../controllers/admin.controller.js'

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
// get all inventorys
adminRouter.get('/get-inventory', adminAuth, getInventorys);
// get inventory by slug
adminRouter.get('/get-inventory/:slug', adminAuth, getInventoryBySlug);
// update inventory by slug
adminRouter.put('/update-inventory/:slug', adminAuth, updateInventory);
// fetch orders with complex query
adminRouter.get('/get-orders', adminAuth, getOrders)
// update order status
adminRouter.patch('/update-order/:id', adminAuth, updateOrder)
// get all reviews
adminRouter.get('/get-reviews', adminAuth, getReviews)
// get all customers
adminRouter.get('/get-customers', adminAuth, getCustomers)
// dashboard stats
adminRouter.get('/get-dashboard-stats', adminAuth, getDashboardStats)

export default adminRouter