import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { userModel } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query = "",
    sortBy,
    sortType,
    userId,
  } = req.query;
  //TODO: get all videos based on query, sort, pagination
  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const SortBy = req.query.sortBy || "createdAt";
  const SortType = req.query.sortType === "asc" ? 1 : -1;
  let searchCriteria = { isPublished: true };
  if (query) {
    searchCriteria.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }
  if (userId) {
    searchCriteria.owner = userId;
  }
  const skip = (pageNumber - 1) * limitNumber;
  const videos = await Video.find(searchCriteria)
    .sort({ [SortBy]: SortType })
    .limit(limit)
    .skip(skip);
  const totalVideos = await Video.countDocuments(searchCriteria);
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          totalVideos,
          videos,
          page,
          limit,
          totalPages: Math.ceil(totalVideos / limitNumber),
        },
        " video fetched Successfuly"
      )
    );
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description, isPublished } = req.body;
  // TODO: get video, upload to cloudinary, create video
  if (!title || !description) {
    throw new ApiError(400, "title or description are required");
  }
  const owner = req.user._id;

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
    owner,
    thumbnail: thumbnail?.url || "",
    isPublished: isPublished || true,
  });
  const videoo = await Video.findById(vid._id).populate(
    "owner",
    "username avatar email fullname"
  );

  if (!vid) {
    throw new ApiError(400, "Error on creating video");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, videoo, "video upload succefuly"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "required video id");
  }
  const video = await Video.findById(videoId).populate(
    "owner",
    "username avatar email fullname"
  );
  if (!video) {
    throw new ApiError(400, "not found any video");
  }
  const user = await userModel.findById(req.user?._id);

  if (!user.watchHistory.includes(videoId)) {
    await Video.findByIdAndUpdate(
      videoId,
      {
        $inc: {
          views: 1,
        },
      },
      {
        new: true,
      }
    );
  }
  if (req?.user) {
    await userModel.findByIdAndUpdate(
      req.user?._id,
      {
        $addToSet: {
          watchHistory: videoId,
        },
      },
      {
        new: true,
      }
    );
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
  const user = req.user;

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "not found any video");
  }
  if (!video.owner.equals(user._id)) {
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
  ).populate("owner", "username avatar email fullname");

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
  if (!video.owner.equals(req?.user?._id)) {
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

  if (!video.owner.equals(req?.user?._id)) {
    throw new ApiError(404, "You are not authorized to toogle status");
  }
  if (!video) {
    throw new ApiError(400, "not found any video");
  }
  video.isPublished = !video.isPublished;
  await video.save({ ValidateBeforeSave: false });
  const updatevideo = await Video.findById(videoId).populate(
    "owner",
    "username avatar email fullname"
  );
  res
    .status(200)
    .json(new ApiResponse(200, updatevideo, "toogle public status"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
