import { Router } from "express";
import { accessRefreshToken, getCurrentUser, loginUser, logoutUser, registerUser, updateAccountDetails, updatePassword, updateUserAvatar, updateUserCoverImage } from "../controller/user.controller.js";

import { upload } from "../middlewares/multer.middleware.js";
import { isUserAuthenticated } from "../middlewares/auth.middleware.js";

const router = Router()
router.route("/registeruser").post(upload.fields([{
    name:'avatar',
    maxCount:1
}],{
    name:"coverImage",
    maxCount:1
}),registerUser)
router.route("/loginuser").post(loginUser)
router.route("/logoutuser").post(isUserAuthenticated,logoutUser)
router.route("/refresh-token").post(accessRefreshToken)
router.route("/update-password").post(isUserAuthenticated,updatePassword)
router.route("/get-current-user").get(isUserAuthenticated,getCurrentUser)
router.route("/update-details").patch(isUserAuthenticated,updateAccountDetails)
router.route("/update-coverImage").patch(upload.single("coverImage"),isUserAuthenticated,updateUserCoverImage)
router.route("/update-coverImage").patch(upload.single("coverImage"),isUserAuthenticated,updateUserAvatar)

export default router