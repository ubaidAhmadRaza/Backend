import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { userModel } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const userId = req.user._id;

  if (!content) {
    throw new ApiError(400, "Content is required");
  }

  const newTweet = await Tweet.create({ content, owner: userId });

  res
    .status(200)
    .json(new ApiResponse(201, newTweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const userExists = await userModel.findById(userId);
  if (!userExists) {
    throw new ApiError(404, "User not found");
  }

  const tweets = await Tweet.find({ owner: userId });

  res
    .status(200)
    .json(
      new ApiResponse(200, tweets, "User tweets retrieved successfully")
    );
});

const updateTweet = asyncHandler(async (req, res) => {
 
    const { content } = req.body;
    if (!content) {
      throw new ApiError(400, "Content is required");
    }
    const tweet=await Tweet.findById(req.tweet._id)

    tweet.content = content;
    const updatedTweet = await tweet.save();

    res
      .status(200)
      .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"));

});

const deleteTweet = asyncHandler(async (req, res) => {
  
    await Tweet.findByIdAndDelete(req.tweet._id)


    res
      .status(200)
      .json(new ApiResponse(200, {}, "Tweet deleted successfully"));
  
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
