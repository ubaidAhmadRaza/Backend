import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { userModel } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description, isPublished } = req.body;
  // TODO: get video, upload to cloudinary, create video
  if (!title || !description) {
    throw new ApiError(400, "title or description are required");
  }
  const videolocalpath = await req.files?.videoFile[0]?.path;
  if (!videolocalpath) {
    throw new ApiError(400, "video is missing");
  }
  const video = await uploadOnCloudinary(videolocalpath);
  let thumbnailLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.thumbnail) &&
    req.files.thumbnail.length > 0
  ) {
    thumbnailLocalPath = await req.files.thumbnail[0].path;
  }
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  const vid = await Video.create({
    videoFile: video.url,
    description,
    title,
    owner: req.user_id,
    thumbnail: thumbnail?.url || "",
    isPublished: isPublished || true,
  });

  if (!vid) {
    throw new ApiError(400, "Error on creating video");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, vid, "video upload succefuly"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "required video id");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "not found any video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Fetched video successfuly"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
  if (!videoId) {
    throw new ApiError(400, "required video id");
  }
  if (!video.owner.equals(req?.user_id)) {
    throw new ApiError(404, "You are not authorized to update");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "not found any video");
  }
  if (!video.owner.equals(req?.user_id)) {
    throw new ApiError(404, "You are not authorized to update");
  }
  const { title, description } = req.body;
  const updateFields = {};
  let thumbnailLocalPath = await req.file?.path;
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  if (!title || !description || !thumbnail) {
    throw new ApiError(400, "FIelds are required");
  }
  updateFields.title = title;
  updateFields.description = description;
  updateFields.thumbnail = thumbnail?.url;

  // Find the video by ID and update it
  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    { $set: updateFields },
    { new: true, runValidators: true }
  );

  if (!updatedVideo) {
    throw new ApiError(404, "Video not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "update Video successfuly"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  if (!videoId) {
    throw new ApiError(400, "required video id");
  }
  const video = await Video.findById(videoId);
  if (!video.owner.equals(req?.user_id)) {
    throw new ApiError(404, "You are not authorized to update");
  }
  const deletedvideo = await Video.findByIdAndDelete(videoId);

  if (!deleteVideo) {
    throw new ApiError(400, `No video found with ID ${videoId}`);
  }
  return res
    .status(200)
    .json(new ApiResponse(200, deleteVideo, "video del successfuly"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "required video id");
  }
  const video = await Video.findById(videoId);

  if (!video.owner.equals(req?.user_id)) {
    throw new ApiError(404, "You are not authorized to toogle status");
  }
  if (!video) {
    throw new ApiError(400, "not found any video");
  }
  video.isPublished = !video.isPublished;
  await video.save({ ValidateBeforeSave: false });
  res.status(200).json(new ApiResponse(200, {}, "toogle public status"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
