import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import connectDB from './config/DB.js'
import dotenv from "dotenv";

dotenv.config(); 
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS);

const app = express()

app.use(cors({
    origin:"http://localhost:3000",
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

await connectDB();

// Routing 
import userRouter from "./routes/userRoute.js"
import doctorRouter from "./routes/doctorRoute.js"
import clinicRouter from "./routes/clinicRoute.js"
import userProfileRouter from "./routes/userProfileRoute.js"

app.use('/clinic',clinicRouter)
app.use('/user',userRouter);
app.use('/doctor',doctorRouter);
app.use('/userProfile',userProfileRouter)

export { app }