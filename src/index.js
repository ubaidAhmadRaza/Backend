 import dotenv from "dotenv";
import connectDB from "./DB/index.js";
import { app } from "./app.js";
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";





//config .env
dotenv.config({
    path: './.env'
})


//Connecting Backend eith database
connectDB()
.then(()=>{
    
    app.listen(process.env.PORT || 2000, ()=>{
        console.log(`app is running on ${process.env.PORT}`)
    })
    app.on("error",(err)=>{
        console.log("err",err);
        throw err
    });
})
.catch((error)=>{
    console.log("ERROR INDEX.JS",error);
    throw error
});






/*
;( async  () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        app.on("error",(err)=>{
            console.log("err",err);
            throw err
        });
        app.listen(process.env.PORT,()=>{
            console.log(`app is running on ${process.env.PORT}`)
        })
        
    } catch (error) {
        console.log("ERrROR",error );
        throw error
    }
})()
*/
