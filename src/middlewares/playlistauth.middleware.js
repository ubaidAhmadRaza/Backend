import { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asynchandler.js";

const authorizePlaylistOwner = asyncHandler(async (req, res, next) => {
    const { playlistId } = req.params;
    const userId = req.user?._id;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You do not have permission to modify this playlist");
    }

    next();
});

export { authorizePlaylistOwner };
