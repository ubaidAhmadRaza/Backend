import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";

import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video

  const userId = req.user._id;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const existingLike = await Like.findOne({ video: videoId, likedBy: userId });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    res.status(200).json(new ApiResponse(200, {}, "Like removed from video"));
  } else {
    const newLike = await Like.create({ video: videoId, likedBy: userId });
    res
      .status(201)
      .json(new ApiResponse(201, newLike, "Video liked successfully"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: userId,
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    res.status(200).json(new ApiResponse(200, {}, "Like removed from comment"));
  } else {
    const newLike = await Like.create({ comment: commentId, likedBy: userId });
    res
      .status(201)
      .json(new ApiResponse(201, newLike, "Video liked successfully"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const existingLike = await Like.findOne({
    tweet: tweetId,
    likedBy: userId,
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    res.status(200).json(new ApiResponse(200, {}, "Like removed from tweet"));
  } else {
    const newLike = await Like.create({ tweet: tweetId, likedBy: userId });
    res
      .status(201)
      .json(new ApiResponse(201, newLike, "Video liked successfully"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const userId = req.user._id;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const likedVideos = await Like.find({ likedBy: userId, video: { $exists: true } })
        .populate({
            path: 'video',
            select: 'title description videoFile thumbnail owner', 
            
            populate: {
                path: 'owner',
                select: 'username email avatar'
            }
        });

    res.status(200).json(new ApiResponse(200, likedVideos, "Liked videos retrieved successfully"));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
