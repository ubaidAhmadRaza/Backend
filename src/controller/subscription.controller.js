import mongoose, { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { userModel } from "../models/user.model.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  const channelOwner = await userModel.findById(channelId);
  const user = req.user;
  if (!channelOwner) {
    throw new ApiError(400, "Invalod Channel id");
  }

  // Prevent self-subscription
  if (channelOwner?._id.toString() === user?._id.toString()) {
    throw new ApiError(400, "Cannot subscribe to yourself");
  }

  // Check if the subscription already exists
  const existingSubscription = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  });

  if (existingSubscription) {
    // Unsubscribe
    await Subscription.deleteOne({ _id: existingSubscription._id });
    return res
      .status(200)
      .json(new ApiResponse(200, "Unsubscribed successfully"));
  } else {
    // Subscribe
    const newSubscription = new Subscription({
      subscriber: req.user._id,
      channel: channelId,
    });
    await newSubscription.save();
    return res
      .status(201)
      .json(new ApiResponse(201, newSubscription, "Subscribed successfully"));
  }
});

// controller to return subscriber list of a channel

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  const channelOwner = await userModel.findById(channelId);

  if (!channelOwner) {
    throw new ApiError(400, "Invalod Channel id");
  }

  const subscribers = await Subscription.find({
    channel: channelOwner._id,
  }).populate("subscriber", "username email avatar");

  res
    .status(200)
    .json(
      new ApiResponse(200, subscribers, "Subscribers retrieved successfully")
    );
});

// controller to return channel list to which user has subscribed

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  const subscriber = await Subscription.findOne({ subscriber: subscriberId });

  if (!subscriber) {
    throw new ApiError(400, "do not find ssubscriber");
  }

  // Find all channels the user is subscribed to
  const subscribedChannels = await Subscription.find({
    subscriber: subscriberId,
  }).populate("channel", "username email avatat");

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribedChannels,
        "Subscribed channels retrieved successfully",
        subscribedChannels
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
