import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from "./src/config/db.js";
// import "./src/utils/offerStatusUpdater.js";


dotenv.config();

const app = express();
const port = process.env.PORT || 3000
// connect to db
connectDB();

app.use(express.json());

const allowedOrigins = [
  process.env.CLIENT_URL?.replace(/\/$/, ''),
  'http://localhost:5173',
  'http://192.168.31.100:5173'
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
  res.json({ message: "Hello World" });
})

app.listen(port, () => {
  console.log(`server is running on PORT http://localhost:${port}/`);
  console.log(`Allowed origins for CORS: ${allowedOrigins.join(', ')}`);
});