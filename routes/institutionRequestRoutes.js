const express = require("express");
const { protect, restrictTo } = require("../controllers/authController");
const {
  postRequest,
  getPendingRequests,
} = require("../controllers/institutionRequestController");

const router = express.Router();

router.post("/", protect, postRequest);
router.get("/pending", protect, restrictTo("admin"), getPendingRequests);

module.exports = router;
