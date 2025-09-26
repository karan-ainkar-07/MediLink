import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const DB_NAME="Medilink1"
        const URL="mongodb+srv://karanr:66xMGYrUWhf97uYO@cluster0.ozmtjaq.mongodb.net"
        const connectionInstance = await mongoose.connect(`${URL}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        process.exit(1)
    }
}


export default connectDB;