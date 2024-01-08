import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name) {
        throw new ApiError("Playlist name is required");
    }

    if (!description) {
        throw new ApiError("Playlist description is required");
    }

    const createPlaylist = await Playlist.create({
        owner: req.user._id,
        name,
        description,
    });

    if (!createPlaylist) {
        throw new ApiError(500, "Something went wrong while creating playlist");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                createPlaylist,
                "Playlist created successfully"
            )
        );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        throw new ApiError(400, "Invalid user");
    }

    const userPlaylists = await Playlist.find({
        owner: userId,
    });

    if (!userPlaylists) {
        throw new ApiError(500, "Something went wrong while getting playlists");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                userPlaylists,
                "Playlists fetched successfully"
            )
        );
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!playlistId) {
        throw new ApiError(400, "Invalid playlist");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiResponse(
            500,
            "Something went wrong while getting playlist"
        );
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!playlistId) {
        throw new ApiError(400, "Invalid Playlist");
    }

    if (!videoId) {
        throw new ApiError(400, "Invalid Video");
    }

    const getPlaylist = await Playlist.findById(playlistId);

    if (!getPlaylist) {
        throw new ApiError(400, "Something went wrong while getting playlist");
    }

    const videoAdd = await getPlaylist.videos.push(videoId);

    await getPlaylist.save();

    if (!videoAdd) {
        throw new ApiError(400, "Something went wrong while adding video");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video added successfully"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!playlistId) {
        throw new ApiError(400, "Invalid Playlist");
    }

    if (!videoId) {
        throw new ApiError(400, "Invalid Video");
    }

    const getPlaylist = await Playlist.findById(playlistId);

    if (!getPlaylist) {
        throw new ApiError(400, "Something went wrong while getting playlist");
    }

    const videoAdd = await getPlaylist.videos.pop(videoId);

    await getPlaylist.save();

    if (!videoAdd) {
        throw new ApiError(400, "Something went wrong while removing video");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Video remove from playlist successfully")
        );
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!playlistId) {
        throw new ApiError(400, "Invalid Playlist");
    }

    await Playlist.findByIdAndDelete(playlistId);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    if (!name) {
        throw new ApiError("Playlist name is required");
    }

    if (!description) {
        throw new ApiError("Playlist description is required");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            name,
            description,
        },
        { new: true }
    );

    if (!updatedPlaylist) {
        throw new ApiError(500, "Something went wrong when updating playlist");
    }


    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatePlaylist,
                "Playlists updated successfully"
            )
        );
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
};
