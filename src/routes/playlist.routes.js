import { Router } from "express";
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
  updatePlaylist,
} from "../controller/playlist.controller.js";
import { isUserAuthenticated } from "../middlewares/auth.middleware.js";
import { authorizePlaylistOwner } from "../middlewares/playlistauth.middleware.js";

const router = Router();

router.route("/").post(isUserAuthenticated, createPlaylist);

router
  .route("/:playlistId")
  .get(getPlaylistById)
  .patch(isUserAuthenticated, authorizePlaylistOwner, updatePlaylist)
  .delete(isUserAuthenticated, authorizePlaylistOwner, deletePlaylist);

router
  .route("/add/:videoId/:playlistId")
  .patch(isUserAuthenticated, authorizePlaylistOwner, addVideoToPlaylist);
router
  .route("/remove/:videoId/:playlistId")
  .patch(isUserAuthenticated, authorizePlaylistOwner, removeVideoFromPlaylist);

router.route("/user/:userId").get(getUserPlaylists);

export default router;
