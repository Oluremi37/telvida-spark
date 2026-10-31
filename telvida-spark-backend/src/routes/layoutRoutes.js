const express = require("express");
const router = express.Router();
const layoutController = require("../controllers/layoutController");
const { protect } = require("../middleware/authMiddleware");
const requireOrganization = require("../middleware/requireOrganization");

router.use(protect, requireOrganization);

router
  .route("/")
  .post(layoutController.createLayout)
  .get(layoutController.getLayouts);

router
  .route("/:layoutId")
  .get(layoutController.getLayout)
  .put(layoutController.updateLayout)
  .delete(layoutController.deleteLayout);

module.exports = router;
