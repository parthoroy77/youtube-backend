import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!channelId) {
        throw new ApiError(400, "Invalid channel");
    }

    const alreadySubscribed = await Subscription.findOne({
        channel: channelId,
        subscriber: req.user._id,
    });

    if (alreadySubscribed) {
        await Subscription.findOneAndDelete(alreadySubscribed._id);
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Subscription removed"));
    }

    const subscription = await Subscription.create({
        channel: channelId,
        subscriber: req.user._id,
    });

    if (!subscription) {
        throw new ApiError(
            500,
            "Something went wrong while adding subscription"
        );
    }

    return res.status(200).json(new ApiResponse(200, {}, "Subscription added"));
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!channelId) {
        throw new ApiError(400, "Invalid channel");
    }

    const subscribersList = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscribedUser",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            avatar: 1,
                            username: 1,
                        },
                    },
                ],
            },
        },
        {
            $unwind: "$subscribedUser",
        },
        {
            $group: {
                _id: "$channel",
                subscribers: {
                    $push: "$subscribedUser",
                },
            },
        },
        {
            $addFields: {
                subscriberCount: {
                    $size: "$subscribers",
                },
            },
        },
    ]);

    if (!subscribersList) {
        throw new ApiError(
            500,
            "Something went wrong while getting subscribers"
        );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                subscribersList,
                "Successfully Fetched subscribers"
            )
        );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!subscriberId) {
        throw new ApiError(400, "Invalid User");
    }

    const channelList = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "subscribedChannels",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            avatar: 1,
                            username: 1,
                        },
                    },
                ],
            },
        },
        {
            $unwind: "$subscribedChannels",
        },
        {
            $group: {
                _id: "$subscriber",
                channels: {
                    $push: "$subscribedChannels",
                },
            },
        },
        {
            $addFields: {
                totalSubscribedChannels: {
                    $size: "$channels",
                },
            },
        },
    ]);

    if (!channelList) {
        throw new ApiError(
            500,
            "Something went wrong while getting channels list"
        );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, channelList, "Channels Fetched Successfully")
        );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
