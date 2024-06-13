import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";




const connectDB= async ()  =>  {
    
    try {
        // const uri=`${process.env.MONGODB_URL}/${DB_NAME}`
        const uri=`${process.env.MONGODB_URL}/${DB_NAME}`
        const connection = await mongoose.connect(uri)
       console.log(console.log(`\n MongoDB connected !! DB HOST: ${connection.connection.host}`));
        
    } catch (errr) {
        console.log("errrror of DB cannot connect to Db",errr);
        process.exit(1)
    }

}

export default connectDB

