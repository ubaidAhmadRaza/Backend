import { Router } from "express";
import {
  createTweet,
  deleteTweet,
  getUserTweets,
  updateTweet,
} from "../controller/tweet.controller.js";

import {
  isUserAuthenticated,
  
} from "../middlewares/auth.middleware.js";
import { verifyOwnership } from "../middlewares/verifyusertweet.middleware.js";

const router = Router();

router.route("/").post(isUserAuthenticated,  createTweet);
router.route("/user/:userId").get(getUserTweets);
router
  .route("/:tweetId")
  .patch(isUserAuthenticated, verifyOwnership, updateTweet)
  .delete(isUserAuthenticated, verifyOwnership, deleteTweet);

export default router;
