const express = require("express");
const { protect } = require("../controllers/authController");
const { postRequest } = require("../controllers/institutionRequestController");

const router = express.Router();

router.post("/", protect, postRequest);

module.exports = router;
