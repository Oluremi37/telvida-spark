const express = require("express");
const router = express.Router();
const onboardingController = require("../controllers/onboardingController");
const { protect } = require("../middleware/authMiddleware");

// Protected route - user must be logged in
router.post("/organization", protect, onboardingController.setupOrganization);
router.post("/invite", protect, onboardingController.inviteTeamMember);
router.post("/accept-invite/:token", onboardingController.acceptInvitation);
router.get("/invite/:token", onboardingController.getInvitation);
module.exports = router;
