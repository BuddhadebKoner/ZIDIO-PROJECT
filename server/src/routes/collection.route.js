import express from 'express'
import { getCollections } from '../controllers/collection.controller.js'

const collectionRouter = express.Router()

// get infinity collections
collectionRouter.get('/get-collections', getCollections);

export default collectionRouter