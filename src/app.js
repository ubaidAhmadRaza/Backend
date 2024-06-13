import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

//creating and exporting app
const app = express();
// Setting miidlewares for app
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}));
app.use(express.json({
    limit:"16kb",
}))
app.use(express.urlencoded({
    extended:true,
    limit:"16kb"
}))
app.use(cookieParser())

//import routes
import  userRouter  from "./routes/user.routes.js";


//routes declaration
app.use("/api/v1/users",userRouter)



export {app}