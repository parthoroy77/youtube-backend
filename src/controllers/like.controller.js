import mongoose, { Schema, isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "Invalid video");
    }

    const existingLikeInVideo = await Like.findOne({ video: videoId });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        return res.status(200).json(new ApiResponse(200, {}, "Like Removed"));
    }

    const addLikeInVideo = await Like.create({
        video: videoId,
        likedBy: req.user?._id,
    });

    if (!addLikeInVideo) {
        throw new ApiError(
            500,
            "Something went wrong while adding like in video"
        );
    }

    return res.status(200).json(new ApiResponse(200, {}, "Like Added"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!commentId) {
        throw new ApiError(400, "Invalid Comment");
    }

    const existingLikeInComment = await Like.findOne({ comment: commentId });

    if (existingLikeInComment) {
        await Like.findByIdAndDelete(existingLikeInComment._id);
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Like removed from comment"));
    }

    const likeAddedInComment = await Like.create({
        comment: commentId,
        likedBy: req.user?._id,
    });

    if (!likeAddedInComment) {
        throw new ApiError(
            500,
            "Something went wrong while adding like in comment"
        );
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Like Added In Comment"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!tweetId) {
        throw new ApiError(400, "Invalid Tweet");
    }

    const existingLikeInTweet = await Like.findOne({ tweet: tweetId });

    if (existingLikeInTweet) {
        await Like.findByIdAndDelete(existingLikeInTweet._id);
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Like removed from tweet"));
    }

    const likeAddedInTweet = await Like.create({
        tweet: tweetId,
        likedBy: req.user?._id,
    });

    if (!likeAddedInTweet) {
        throw new ApiError(
            500,
            "Something went wrong while adding like in tweet"
        );
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Like Added In Tweet"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
    if (!req.user._id) {
        throw new ApiError(404, "unauthorized request");
    }

    const allLikedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user._id),
                video: { $exists: true },
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "likedVideos",
                pipeline: [
                    {
                        $match: {
                            isPublished: true,
                        },
                    },
                ],
            },
        },
        {
            $project: {
                likedVideos: 1
            }
        }
    ]);

    if (!allLikedVideos) {
        throw new ApiError(
            500,
            "Something went wrong while getting liked videos"
        );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                allLikedVideos,
                "All liked Video fetched successfully"
            )
        );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
