import mongoose from "mongoose";
import { DB_NAME } from "../Constants.js";

const connectDB = async () => {
    try {
        const URL=process.env.MONGODB_URL;
        const connectionInstance = await mongoose.connect(`${URL}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        process.exit(1)
    }
}
export default connectDB;