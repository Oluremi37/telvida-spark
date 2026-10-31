const express = require("express");
const router = express.Router();
const displayController = require("../controllers/displayController");
const { protect } = require("../middleware/authMiddleware");
const requireOrganization = require("../middleware/requireOrganization");

router.use(protect, requireOrganization);

router.post("/authorize", displayController.authorizeDevice);
router.get("/", displayController.listDisplays);
router.get("/:id", displayController.getDisplay);
router.patch("/:id", displayController.updateDisplay);
router.post("/:id/commands", displayController.queueCommand);
router.delete("/:id", displayController.removeDisplay);

module.exports = router;
