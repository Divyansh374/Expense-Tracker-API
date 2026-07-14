const express = require("express");
const { protect, restrictTo } = require("../controllers/authController");
const {
  postRequest,
  getRequests,
  getRequest,
  approveRequest,
} = require("../controllers/institutionRequestController");

const router = express.Router();

router.route("/").post(protect, postRequest).get(protect, getRequests);
router.get("/:id", protect, getRequest);
router.patch("/:id/approve", protect, restrictTo("admin"), approveRequest);

module.exports = router;
