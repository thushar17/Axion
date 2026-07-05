import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { initializedSocket } from './socket/index.js';
import AuthRouter from './routes/auth.js';
import RoomRouter from './routes/rooms.js';
import { RoomModel } from './models/rooms.js';
dotenv.config();
const app = express();
const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:3000';
app.use(cors({
    origin: clientUrl,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
await connectDB();
await RoomModel.syncIndexes();
const PORT = 8000;
const server = http.createServer(app);
initializedSocket(server);
app.use("/auth", AuthRouter);
app.use("/room", RoomRouter);
app.get('/', (req, res) => {
    res.json({ message: 'Sucess' });
});
server.listen(PORT, () => {
    console.log(`app listening at port ${PORT}`);
});
//# sourceMappingURL=server.js.map