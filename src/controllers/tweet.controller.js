import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { tweet } = req.body;
    if (!tweet) {
        throw new ApiError(400, "Invalid Tweet");
    }
    await Tweet.create({
        owner: req.user._id,
        content: tweet,
    });
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
        throw new ApiError(400, "Invalid User");
    }
    const userTweets = await Tweet.find({owner: req.user._id || userId});
    if (!userTweets) {
        throw new ApiError(500, "Internal Server Error while getting tweets");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, userTweets, "Tweets Fetched Successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { updatedTweet } = req.body;

    if (!tweetId) {
        throw new ApiError(400, "Invalid Tweet");
    }

    if (!updatedTweet) {
        throw new ApiError(500, "Tweet Content Invalid");
    }

    await Tweet.findByIdAndUpdate(tweetId, {
        $set: { content: updatedTweet },
    });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Tweet Updated Successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!tweetId) {
        throw new ApiError(400, "Invalid Tweet");
    }

    await Tweet.findByIdAndDelete(tweetId);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Tweet Deleted Successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
