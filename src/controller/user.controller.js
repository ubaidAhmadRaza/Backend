import { asyncHandler } from "../utils/asynchandler.js";
import { userModel } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async function (userid) {
  try {
    const user = await userModel.findById(userid);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ ValidateBeforeSave: false });
    return { refreshToken, accessToken };
  } catch (error) {
    throw new ApiError(500, "WENT WRONG WHILE GENERATING TOKENS");
  }
};

//Tasks for this controller
//get data from user and validate is it is empty or note
//check user already exists or not
//check avatar image , and cover image if
// upload them on cloudinary and delete the file from dest
// crate user and hide pass and refresh tokn from it
//return response or error
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullname, password } = req.body;
  if (!username || !email || !fullname || !password)
    throw new ApiError(400, "fields are required");

  const existedUser = await userModel.findOne({
    $or: [{ email }, { username }],
  });
  if (existedUser) {
    throw new ApiError(409, "user with email or username already exists");
  }
  const avatarLocalPath = await req.files?.avatar[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = await req.files.coverImage[0].path;
  }
  if (!avatarLocalPath) {
    throw new ApiError(409, "avatar image is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  console.log(avatar);
  if (!avatar) {
    throw new ApiError(409, "avatar image is required");
  }

  const user = await userModel.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  const createdUser = await userModel
    .findById(user._id)
    .select("-password -refreshToken");
  if (!createdUser) {
    throw new ApiError(400, "error while creating user");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "created user successfully"));
});
//take username or email
// validate them
//password correct validate
//if validate then create access token or refresh token
const loginUser = asyncHandler(async (req, res, next) => {
  const { username, email, password } = req.body;
  if (!(username || email)) {
    throw new ApiError(401, "username or email are required");
  }
  const user = await userModel.findOne({
    $or: [{ email }, { username }],
  });
  if (!user) {
    throw new ApiError(401, "enter correct credentials ");
  }
  const authUser = await user.isPasswordCorrect(password);
  if (!authUser) {
    throw new ApiError(401, "Credential must be correcect");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  const loggedInUser = await userModel
    .findById(user._id)
    .select("-password -refreshToken");
  const options = {
    httpOnly: true,
    secure: true,
  };
  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: accessToken, re: refreshToken, loggedInUser },
        "user logged in successfuly"
      )
    );
});
const logoutUser = asyncHandler(async (req, res) => {
  await userModel.findByIdAndUpdate(
    req?.user_id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "log out successfuly"));
});
const accessRefreshToken = asyncHandler(async (req, res) => {
  const incomingComingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingComingRefreshToken) {
    throw new ApiError(400, "dont oqn refreshtoken");
  }
  const decodedToken = jwt.verify(
    incomingComingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );
  const user = await userModel.findById(decodedToken?._id);
  if (!user) {
    throw new ApiError(401, "unauthorized request");
  }
  if (incomingComingRefreshToken !== user?.refreshToken) {
    throw new ApiError(401, "unauthorized request");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  console.log(refreshToken);
  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, { accessToken, refreshToken }, ""));
});
const updatePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const user = req.user;
  const user1 = await userModel.findById(user._id);

  const authUser = await user1.isPasswordCorrect(oldPassword);
  if (!authUser) {
    throw new ApiError(401, "enter correct old password");
  }
  if (newPassword !== confirmPassword) {
    throw new ApiError(401, "new and confirm password doesnot match");
  }
  user1.password = newPassword;
  await user1.save({ ValidateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "change password successfuly"));
});
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = req.user;
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User fetched successfully"));
});
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;
  if (!fullname || !email) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await userModel
    .findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          fullname,
          email,
        },
      },
      { new: true }
    )
    .select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});
const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image file is missing");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading on avatar");
  }

  const user = await userModel
    .findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          coverImage: coverImage.url,
        },
      },
      { new: true }
    )
    .select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image updated successfully"));
});
const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading on avatar");
  }

  const user = await userModel
    .findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          avatar: avatar.url,
        },
      },
      { new: true }
    )
    .select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar image updated successfully"));
});
const getUserChannelDetails = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username.trim()) {
    throw new ApiError(400, "username not found");
  }
  const channel = await userModel.aggregate([
    {
      $match: { username: username.toLowerCase() },
    },
    {
      $lookup: {
        from: "subscriptions",
        as: "subscribers",
        localField: "_id",
        foreignField: "channel",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        as: "Subscriberto",
        localField: "_id",
        foreignField: "subscriber",
      },
    },
    {
      $addFields: {
        subscribercount: { $size: "$subscribers" },
        subcribedto: { $size: "$Subscriberto" },
        issubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullname: 1,
        issubscribed: 1,
        subcribedto: 1,
        subscribercount: 1,
        coverImage: 1,
        avatar: 1,
      },
    },
  ]);
  if (!channel.length) {
    return new ApiError(400, "not found channel");
  }
  console.log(channel);
  return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "fetched chanel successfuly"));
});

const getwathhistorty = asyncHandler(async (req, res) => {
  const user = await userModel.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch history fetched successfully"
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  accessRefreshToken,
  getCurrentUser,
  updatePassword,
  updateAccountDetails,
  updateUserCoverImage,
  updateUserAvatar,
  getUserChannelDetails,
  getwathhistorty,
};
