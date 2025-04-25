import express from 'express';
import { getAllOffers, getOfferDetailsByCode, searchOffers } from '../controllers/offer.controller.js';


const offerRouter = express.Router();

// Route to get all offers
offerRouter.get('/get-offers', getAllOffers);
// Route to search offers
offerRouter.get('/search', searchOffers);
// get offer by offerCode	
offerRouter.get('/:slug', getOfferDetailsByCode)


export default offerRouter;