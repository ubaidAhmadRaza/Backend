import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asynchandler.js";
import mongoose from "mongoose";

// Middleware to check if the authenticated user owns the tweet
const verifyOwnership = asyncHandler(async (req, res, next) => {
    const { tweetId } = req.params;
    const userId = req.user?._id;

    if (!mongoose.isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }
    
    
    if (tweet.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to modify this tweet");
    }

    req.tweet = tweet; 
    next();
});

export { verifyOwnership };
