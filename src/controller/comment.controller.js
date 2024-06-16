import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "video not found");
  }
  const user = req?.user;
  if (!user) {
    throw new ApiError(400, "pls login");
  }
  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "content not found");
  }
  const comment = await Comment.create({
    content,
    owner: user._id,
    video: videoId,
  });
  res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment added successfuly"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const userId = req.user._id; // Assumes req.user is set by authentication middleware

  // Check if commentId is provided
  if (!commentId) {
    throw new ApiError(400, "Required comment ID");
  }

  // Find the comment
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  // Check if the user owns the comment
  if (!comment.owner.equals(userId)) {
    throw new ApiError(403, "You are not authorized to update this comment");
  }

  // Update the comment
  comment.content = content;
  const updatecomment = await comment.save({ ValidateBeforeSave: false });

  // Respond with the updated comment
  res
    .status(200)
    .json(new ApiResponse(200, updatecomment, "comment update successfuly"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;
  const userId = req.user._id;

  // Check if commentId is provided
  if (!commentId) {
    throw new ApiError(400, "Required comment ID");
  }

  // Delete the comment
  const deletedComment = await Comment.findByIdAndDelete(commentId);
  if (!deletedComment.owner.equals(userId)) {
    throw new ApiError(404, "You are not authorized to update this comment");
  }

  if (!deletedComment) {
    throw new ApiError(404, "Comment not found");
  }

  // Respond with a success message
  res.status(200).json(new ApiResponse(200, {}, "delete comment success"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
