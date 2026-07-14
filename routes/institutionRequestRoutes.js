const express = require("express");
const { protect } = require("../controllers/authController");
const {
  postRequest,
  getRequests,
  getRequest,
} = require("../controllers/institutionRequestController");

const router = express.Router();

router.route("/").post(protect, postRequest).get(protect, getRequests);
router.get("/:id", protect, getRequest);

module.exports = router;
