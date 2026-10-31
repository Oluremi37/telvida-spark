const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const requireOrganization = require("../middleware/requireOrganization");

router.use(protect, requireOrganization);

router.get("/", userController.listMembers);
router.get("/invitations", userController.listInvitations);
router.patch("/:userId/role", userController.updateMemberRole);

module.exports = router;
