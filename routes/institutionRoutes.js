const express = require("express");
const { protect, restrictTo } = require("../controllers/authController");
const {
  createInstitution,
  getInstitutions,
} = require("../controllers/institutionController");

const router = express.Router();

router
  .route("/")
  .post(protect, restrictTo("admin"), createInstitution)
  .get(getInstitutions);

module.exports = router;
