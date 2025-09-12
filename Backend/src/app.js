import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


// Routing 
import userRouter from "./routes/userRoute"
import doctorRouter from "./routes/doctorRoute"

app.use('/user',userRouter);
app.use('/doctor',doctorRouter);

export { app }