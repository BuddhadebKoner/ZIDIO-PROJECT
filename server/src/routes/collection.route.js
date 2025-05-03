import express from 'express'
import { getCollections, getCollectionsById, getProductsByCollectionSlug, searchCollections } from '../controllers/collection.controller.js'

const collectionRouter = express.Router()

collectionRouter.get('/get-collections', getCollections);
// Route to get collection by slug
collectionRouter.get('/:slug', getCollectionsById);
// Route to search collections by name or subtitle
collectionRouter.get('/search', searchCollections);
// get products by collection id
collectionRouter.get('/:slug/products', getProductsByCollectionSlug)

export default collectionRouter