import express from 'express';
import dotenv from 'dotenv'
import http from 'http';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import { initializedSocket } from './socket/index.js';
import AuthRouter from './routes/auth.js';


dotenv.config();
const app = express()
app.use(express.json())
app.use(cookieParser())
await connectDB()
const PORT = 8000

const server = http.createServer(app)
initializedSocket(server)
app.use("/auth",AuthRouter)
app.get('/',(req,res)=>{
    res.json({message: 'Sucess'})
})


server.listen(PORT,()=>{
     console.log(`app listening at port ${PORT}`)
})
