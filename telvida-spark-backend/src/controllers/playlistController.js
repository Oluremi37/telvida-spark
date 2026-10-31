const { Playlist, PlaylistItem, Media, User } = require("../models");

// ======================
// CREATE PLAYLIST
// ======================
exports.createPlaylist = async (req, res) => {
  try {
    const { name, description, isLoop, isShuffle } = req.body;
    const userId = req.user.id;
    const organizationId = req.user.organizationId;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Playlist name is required",
      });
    }

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: "You must belong to an organization",
      });
    }

    const playlist = await Playlist.create({
      name,
      description,
      isLoop: isLoop !== undefined ? isLoop : true,
      isShuffle: isShuffle || false,
      organizationId,
      createdBy: userId,
      status: "draft",
    });

    res.status(201).json({
      success: true,
      message: "Playlist created successfully",
      data: { playlist },
    });
  } catch (error) {
    console.error("Create playlist error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ======================
// GET ALL PLAYLISTS
// ======================
exports.getPlaylists = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;

    const playlists = await Playlist.findAll({
      where: { organizationId },
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "fullName", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: { playlists },
    });
  } catch (error) {
    console.error("Get playlists error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ======================
// ADD ITEMS TO PLAYLIST
// ======================
exports.addItemsToPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { items } = req.body; // Array of { mediaId, duration, order }
    const organizationId = req.user.organizationId;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of items",
      });
    }

    // Check if playlist belongs to the organization
    const playlist = await Playlist.findOne({
      where: { id: playlistId, organizationId },
    });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    // Create playlist items
    const playlistItems = [];

    for (const item of items) {
      // Verify media belongs to the same organization
      const media = await Media.findOne({
        where: { id: item.mediaId, organizationId },
      });

      if (!media) {
        return res.status(400).json({
          success: false,
          message: `Media with id ${item.mediaId} not found in your organization`,
        });
      }

      const playlistItem = await PlaylistItem.create({
        playlistId,
        mediaId: item.mediaId,
        order: item.order !== undefined ? item.order : 0,
        duration: item.duration || null,
      });

      playlistItems.push(playlistItem);
    }

    res.status(201).json({
      success: true,
      message: "Items added to playlist successfully",
      data: { items: playlistItems },
    });
  } catch (error) {
    console.error("Add items to playlist error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ======================
// GET SINGLE PLAYLIST (with items)
// ======================
exports.getPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const organizationId = req.user.organizationId;

    const playlist = await Playlist.findOne({
      where: { id: playlistId, organizationId },
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "fullName", "email"],
        },
        {
          model: PlaylistItem,
          as: "items",
          include: [
            {
              model: Media,
              as: "media",
            },
          ],
        },
      ],
      order: [[{ model: PlaylistItem, as: "items" }, "order", "ASC"]],
    });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    res.status(200).json({
      success: true,
      data: { playlist },
    });
  } catch (error) {
    console.error("Get playlist error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ======================
// UPDATE PLAYLIST
// ======================
exports.updatePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { name, description, isLoop, isShuffle, status } = req.body;
    const organizationId = req.user.organizationId;

    const playlist = await Playlist.findOne({
      where: { id: playlistId, organizationId },
    });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    // Update fields if provided
    if (name !== undefined) playlist.name = name;
    if (description !== undefined) playlist.description = description;
    if (isLoop !== undefined) playlist.isLoop = isLoop;
    if (isShuffle !== undefined) playlist.isShuffle = isShuffle;
    if (status !== undefined) playlist.status = status;

    await playlist.save();

    res.status(200).json({
      success: true,
      message: "Playlist updated successfully",
      data: { playlist },
    });
  } catch (error) {
    console.error("Update playlist error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ======================
// DELETE PLAYLIST
// ======================
exports.deletePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const organizationId = req.user.organizationId;

    const playlist = await Playlist.findOne({
      where: { id: playlistId, organizationId },
    });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    await playlist.destroy();

    res.status(200).json({
      success: true,
      message: "Playlist deleted successfully",
    });
  } catch (error) {
    console.error("Delete playlist error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ======================
// REMOVE ITEM FROM PLAYLIST
// ======================
exports.removeItemFromPlaylist = async (req, res) => {
  try {
    const { playlistId, itemId } = req.params;
    const organizationId = req.user.organizationId;

    // Verify playlist belongs to organization
    const playlist = await Playlist.findOne({
      where: { id: playlistId, organizationId },
    });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    const item = await PlaylistItem.findOne({
      where: { id: itemId, playlistId },
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Playlist item not found",
      });
    }

    await item.destroy();

    res.status(200).json({
      success: true,
      message: "Item removed from playlist successfully",
    });
  } catch (error) {
    console.error("Remove item error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ======================
// REORDER PLAYLIST ITEMS
// ======================
exports.reorderPlaylistItems = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { items } = req.body;
    const organizationId = req.user.organizationId;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of items",
      });
    }

    // Verify playlist belongs to the organization
    const playlist = await Playlist.findOne({
      where: { id: playlistId, organizationId },
    });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    // Update each item's order
    for (let index = 0; index < items.length; index++) {
      const item = items[index];

      const playlistItem = await PlaylistItem.findOne({
        where: {
          id: item.id,
          playlistId,
        },
      });

      if (!playlistItem) {
        return res.status(404).json({
          success: false,
          message: `Playlist item with id ${item.id} not found`,
        });
      }

      await playlistItem.update({
        order: index,
      });
    }

    // Return the playlist items in their new order
    const updatedItems = await PlaylistItem.findAll({
      where: { playlistId },
      include: [
        {
          model: Media,
          as: "media",
        },
      ],
      order: [["order", "ASC"]],
    });

    res.status(200).json({
      success: true,
      message: "Playlist items reordered successfully",
      data: {
        items: updatedItems,
      },
    });
  } catch (error) {
    console.error("Reorder playlist items error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

module.exports = exports;
