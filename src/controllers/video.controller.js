import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if (!title) {
        throw new ApiError(400, "Title is required");
    }

    if (!description) {
        throw new ApiError(400, "Description is required");
    }
    console.log(req.files);

    const thumbnailLocalPath = req.files?.thumbnail[0].path;
    const videoLocalPath = req.files?.videoFile[0].path;

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required");
    }

    if (!videoLocalPath) {
        throw new ApiError(400, "Video is required");
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    const uploadedVideo = await uploadOnCloudinary(videoLocalPath);

    console.log(uploadedVideo);

    const video = await Video.create({
        title,
        description,
        duration: uploadedVideo.duration,
        owner: req.user?._id,
        thumbnail: thumbnail.url,
        videoFile: uploadedVideo.url,
    });

    console.log(video);

    return res
        .status(200)
        .json(new ApiResponse(400, video, "Video Uploaded Successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) {
        throw new ApiError(400, "Invalid video id");
    }
    const video = await Video.findById(videoId);
    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video fetched Successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const { newTitle, newDescription } = req.body;

    if (!newTitle) {
        throw new ApiError(400, "Invalid title");
    }

    if (!newDescription) {
        throw new ApiError(400, "Invalid Description");
    }

    const thumbnailLocalPath = req.file?.path;

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required");
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!thumbnail) {
        throw new ApiError(
            500,
            "Something went wrong while uploading thumbnail"
        );
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                thumbnail: thumbnail.url,
                title: newTitle,
                description: newDescription,
            },
        },
        { new: true }
    );

    if (!updatedVideo) {
        throw new ApiError(
            500,
            "Something went wrong while uploading thumbnail"
        );
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "Video Updated Succesfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) {
        throw new ApiError(400, "Invalid video");
    }
    await Video.findByIdAndDelete(videoId);
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video Deleted Successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "Invalid video");
    }
    const getVideo = await Video.findById(videoId);
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: !getVideo.isPublished,
            },
        },
        { new: true }
    );

    if (!updatedVideo) {
        throw new ApiError(400, "Something went wrong while updating video");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedVideo,
                "Video Status Updated Successfully"
            )
        );
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
};
