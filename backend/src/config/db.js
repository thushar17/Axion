import mongoose from 'mongoose'

const connectDB = async =>{
    try {
        connecton = new mongoose.connect(process.env.MONGO_URI)
        console.log("Db connected", process.env.MONGO_URI)
    } catch (error) {
         console.error("Database connection failed:", error.message);
    process.exit(1);
    }
}


export default connectDB