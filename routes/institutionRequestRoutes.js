const express = require("express");
const { protect, restrictTo } = require("../controllers/authController");
const {
  postRequest,
  getRequests,
  getRequest,
  approveRequest,
  rejectRequest,
  cancelRequest,
} = require("../controllers/institutionRequestController");

const router = express.Router();

router.route("/").post(protect, postRequest).get(protect, getRequests);

router.get("/:id", protect, getRequest);

router.patch("/:id/approve", protect, restrictTo("admin"), approveRequest);

router.patch("/:id/reject", protect, restrictTo("admin"), rejectRequest);

router.patch("/:id/cancel", protect, restrictTo("user"), cancelRequest);

module.exports = router;
