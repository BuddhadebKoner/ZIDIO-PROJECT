import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from "./src/config/db.js";
// import "./src/utils/offerStatusUpdater.js";
import { clerkMiddleware } from '@clerk/express'
import authRouter from './src/routes/auth.route.js';
import userRouter from './src/routes/user.route.js';
import adminRouter from './src/routes/admin.route.js';
import collectionRouter from './src/routes/collection.route.js';
import productRouter from './src/routes/product.route.js';
import offerRouter from './src/routes/offer.route.js';

dotenv.config();

const app = express();
const port = 3000;
connectDB();
// clerk middleware
app.use(clerkMiddleware({
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY
}));

app.use(express.json());

const allowedOrigins = [
  process.env.CLIENT_URL?.replace(/\/$/, ''),
  'http://localhost:5173',
  'https://zidio-project-nine.vercel.app'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`Origin ${origin} not allowed by CORS`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// testing
app.get('/', (req, res) => {
  res.json({ message: "Hey i think you testing server , yes i am alive" });
})

// auth route
app.use('/api/auth', authRouter);
// user route
app.use('/api/user', userRouter);
// admin route
app.use('/api/admin', adminRouter);
// collections
app.use('/api/collections', collectionRouter);
// products
app.use('/api/products', productRouter);
// offers
app.use('/api/offers', offerRouter);

app.listen(port, () => {
  console.log(`Server is running on PORT http://localhost:${port}/`);
  console.log(`Allowed origins for CORS: ${allowedOrigins.join(', ')}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Please close the application using this port and try again.`);
  } else {
    console.error('An error occurred when starting the server:', err);
  }
  process.exit(1);
});