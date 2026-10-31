const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/scheduleController");
const { protect } = require("../middleware/authMiddleware");
const requireOrganization = require("../middleware/requireOrganization");

router.use(protect, requireOrganization);

router.post("/", scheduleController.createSchedule);
router.get("/", scheduleController.getSchedules);
router.get("/:scheduleId", scheduleController.getSchedule);
router.put("/:scheduleId", scheduleController.updateSchedule);
router.delete("/:scheduleId", scheduleController.deleteSchedule);

// New endpoints
router.patch("/:scheduleId/reactivate", scheduleController.reactivateSchedule);
router.post("/:scheduleId/displays", scheduleController.addDisplayToSchedule);
router.delete(
  "/:scheduleId/displays/:deviceId",
  scheduleController.removeDisplayFromSchedule,
);

module.exports = router;
