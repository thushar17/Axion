import mongoose from "mongoose";
export const connectDB = async()=>{
     try {
      const mongoUri = process.env.MONGO_URI
      if (!mongoUri) {
  throw new Error("MONGO_URI is not defined");

}
mongoose.connect(mongoUri)
      console.log("db connected")
     } catch (error) {
        console.error(`Db connection failed ${error}`)
        process.exit(1)
     }
}