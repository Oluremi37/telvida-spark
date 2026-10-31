const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/feedbackController");
const { protect } = require("../middleware/authMiddleware");
const requireOrganization = require("../middleware/requireOrganization");

router.use(protect, requireOrganization);

router.get("/", feedbackController.listFeedback);
router.get("/summary", feedbackController.getFeedbackSummary);
router.delete("/:id", feedbackController.deleteFeedback);

module.exports = router;
