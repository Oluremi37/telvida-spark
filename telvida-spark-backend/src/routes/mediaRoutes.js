const express = require("express");
const router = express.Router();
const mediaController = require("../controllers/mediaController");
const { protect } = require("../middleware/authMiddleware");
const requireOrganization = require("../middleware/requireOrganization");
const upload = require("../middleware/upload");

router.use(protect, requireOrganization);

router.post("/upload", upload.array("files", 10), mediaController.uploadMedia);
router.post("/web-content", mediaController.addWebContent);
router.get("/", mediaController.listMedia);
router.get("/:id", mediaController.getMediaById);
router.patch("/:id", mediaController.updateMedia);
router.delete("/:id", mediaController.deleteMedia);

module.exports = router;
