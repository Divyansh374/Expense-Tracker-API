const express = require("express");
const { protect, restrictTo } = require("../controllers/authController");
const {
  postRequest,
  getPendingRequests,
  getRequest,
} = require("../controllers/institutionRequestController");

const router = express.Router();

router.post("/", protect, postRequest);
router.get("/pending", protect, restrictTo("admin"), getPendingRequests);
router.get("/:id", protect, getRequest);

module.exports = router;
