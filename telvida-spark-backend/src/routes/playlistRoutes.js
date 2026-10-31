const express = require("express");

const router = express.Router();

const playlistController = require("../controllers/playlistController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, playlistController.createPlaylist);

router.get("/", protect, playlistController.getPlaylists);

router.get("/:playlistId", protect, playlistController.getPlaylist);

router.put("/:playlistId", protect, playlistController.updatePlaylist);

router.delete("/:playlistId", protect, playlistController.deletePlaylist);

router.post(
  "/:playlistId/items",
  protect,
  playlistController.addItemsToPlaylist,
);

router.put(
  "/:playlistId/items/reorder",
  protect,
  playlistController.reorderPlaylistItems,
);

router.delete(
  "/:playlistId/items/:itemId",
  protect,
  playlistController.removeItemFromPlaylist,
);

module.exports = router;
