import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {

    const stats = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(req.user._id),
            },
        },
        {
            $group: {
                _id: "$channel",
                subscribers: {
                    $push: "$subscriber",
                },
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "video",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            views: 1,
                        },
                    },
                ],
            },
        },
        {
            $unwind: "$video",
        },
        {
            $lookup: {
                from: "likes",
                localField: "video._id",
                foreignField: "video",
                as: "likes",
            },
        },
        {
            $unwind: "$likes",
        },
        {
            $group: {
                _id: "$_id",
                subscribers: {
                    $first: "$subscribers",
                },
                videoList: {
                    $addToSet: "$video",
                },
                likes: {
                    $push: "$likes",
                },
                totalViews: {
                    $sum: "$video.views",
                },
            },
        },
        {
            $project: {
                _id: 1,
                subscribersCount: {
                    $size: "$subscribers"
                },
                likesCount: {
                    $size: "$likes"
                },
                videoCount: {
                    $size: "$videoList"
                },
                totalViews: 1
            }
        }
    ]);

    return res.json(stats);
});

const getChannelVideos = asyncHandler(async (req, res) => {
    const videos = await Video.find({
        owner: req.user._id,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "All Videos Fetched Successfully"));
});

export { getChannelStats, getChannelVideos };
