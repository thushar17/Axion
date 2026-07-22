import express from 'express';
import dotenv from 'dotenv'
import http from 'http';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { initializedSocket } from './socket/index.js';
import AuthRouter from './routes/auth.js';
import RoomRouter from './routes/rooms.js';
import NotificationRouter from './routes/notification.js';
import { RoomModel } from './models/rooms.js';
import { connectRedis } from './lib/redis.js';

dotenv.config();
const app = express()
app.set('trust proxy', 1);
const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:3000'
const allowedOrigins = [
  'http://localhost:3000',
  'https://axion-alpha-blush.vercel.app',
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow local development, specific domains, and all Vercel preview deployments
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json())
app.use(cookieParser())
await connectDB()
await connectRedis()
await RoomModel.syncIndexes()
const PORT = process.env.PORT || 8000

const server = http.createServer(app)
initializedSocket(server)
app.use("/auth", AuthRouter)
app.use("/room", RoomRouter)
app.use("/notification", NotificationRouter)
app.get('/', (req, res) => {
  res.json({ message: 'Sucess' })
})


server.listen(PORT, () => {
  console.log(`app listening at port ${PORT}`)
})
