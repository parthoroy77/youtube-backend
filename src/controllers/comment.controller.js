import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!videoId) {
        throw new ApiError(400, "Invalid video");
    }

    const skipCount = (page - 1) * limit;

    const allComments = await Comment.find({
        video: videoId,
    })
        .skip(skipCount)
        .limit(limit);

    if (!allComments) {
        throw new ApiError(400, "Something went wrong while getting comments");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                allComments,
                "All comments fetched successfully"
            )
        );
});

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { comment } = req.body;
    if (!videoId) {
        throw new ApiError(400, "Invalid Video Id");
    }

    if (!comment) {
        throw new ApiError(400, "Invalid Comment");
    }

    const createdComment = await Comment.create({
        owner: req.user?._id,
        content: comment,
        video: videoId,
    });

    if (!createdComment) {
        throw new ApiError(400, "Something went wrong while posting comment");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, createdComment, "Comment Added Successfully")
        );
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const { newComment } = req.body;

    if (!commentId) {
        throw new ApiError(400, "Invalid Comment");
    }

    if (!newComment) {
        throw new ApiError(400, "New Comment is required");
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        { content: newComment },
        { new: true }
    );

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedComment, "Comment Updated Successfully")
        );
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    await Comment.findByIdAndDelete(commentId);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Comment Deleted Successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
