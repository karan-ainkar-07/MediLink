import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import connectDB from './config/DB.js'
import dotenv from "dotenv";

dotenv.config();

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

console.log(process.env.MONGODB_URI)

await connectDB();

// Routing 
import userRouter from "./routes/userRoute.js"
import doctorRouter from "./routes/doctorRoute.js"
import clinicRouter from "./routes/clinicRoute.js"

app.use('/clinic',clinicRouter)
app.use('/user',userRouter);
app.use('/doctor',doctorRouter);

export { app }