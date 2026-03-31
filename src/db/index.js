import mongoose from "mongoose";
const connectDB =  async()=>{
    try {
        const conncetionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`);
        console.log("\nMongoDB connected");
    } catch (error) {
        console.log("Db not connected",error);
        process.exit(1);
    }
}

export default connectDB;