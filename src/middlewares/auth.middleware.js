import { userModel } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken";
export const isUserAuthenticated = asyncHandler(async (req,res,next) =>{
    const accessToken =req.cookies?.accessToken;
    if(!accessToken){
        throw new ApiError(404,"please login ")
    }
    const decodedToken= await jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET);
    if (!decodedToken){
        throw new ApiError(404,"not verify  access token")
    }
    const user=await userModel.findById(decodedToken?._id).select("-password -refreshToken");
    if(!user){
        throw new ApiError(404,"invalid access token")
    }
    req.user=user
    next()


})