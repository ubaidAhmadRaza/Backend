import { Router } from 'express';

import {isUserAuthenticated} from "../middlewares/auth.middleware.js"
import { addComment, deleteComment, getVideoComments, updateComment, } from '../controller/comment.controller.js';

const router = Router();

router.use(isUserAuthenticated); // Apply verifyJWT middleware to all routes in this file

router.route("/:videoId").get(getVideoComments).post(addComment);
router.route("/c/:commentId").delete(deleteComment).patch(updateComment);

export default router