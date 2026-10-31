const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");
const requireOrganization = require("../middleware/requireOrganization");

router.use(protect, requireOrganization);

router.get("/stats", dashboardController.getDashboardStats);

module.exports = router;
