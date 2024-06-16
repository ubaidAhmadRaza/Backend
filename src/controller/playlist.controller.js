import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { userModel } from "../models/user.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const owner = req.user._id;

  if (!name || !description) {
    throw new ApiError(400, "Name and description are required");
  }

  const newPlaylist = await Playlist.create({ name, description, owner });

  res
    .status(200)
    .json(new ApiResponse(201, newPlaylist, "Playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }
  const user = await userModel.findById(userId);
  if (!user) {
    throw new ApiError(400, "user not found");
  }
  const playlist = await Playlist.find({ owner: user._id });
  if (!playlist.length) {
    throw new ApiError(400, "not found any playlist");
  }
  res
    .status(200)
    .json(new ApiResponse(200, playlist, "Fetched the playlist succeessfuly"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(400, "not found any playlist");
  }
  res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist fetched successfuly"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlist or video ID");
  }

  const playlist = await Playlist.findOne({ _id: playlistId, owner: userId });

  if (!playlist) {
    throw new ApiError(
      404,
      "Playlist not found or you do not have permission to add videos"
    );
  }

  if (playlist.videos.includes(videoId)) {
    throw new ApiError(400, "Video already in playlist");
  }

  playlist.videos.push(videoId);
  await playlist.save({});

  res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "Video added to playlist successfully")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlist or video ID");
  }

  const playlist = await Playlist.findById(playlistId);

  const videoIndex = playlist.videos.indexOf(videoId);
  if (videoIndex === -1) {
    throw new ApiError(400, "Video not found in playlist");
  }

  playlist.videos.splice(videoIndex, 1);
  await playlist.save();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        playlist,
        "Video removed from playlist successfully"
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
}

const playlist = await Playlist.findById(playlistId);
await Playlist.findByIdAndDelete(playlist._id)



res.status(200).json(new ApiResponse(200, {}, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;
    if(!name || !description){
        throw new ApiError(400,"NAME or description is missing")
    }

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        { name, description },
        { new: true, runValidators: true }
    );

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    res.status(200).json(new ApiResponse(200, playlist, "Playlist updated successfully"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
