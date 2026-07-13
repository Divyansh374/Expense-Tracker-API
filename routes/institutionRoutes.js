const express = require("express");
const { protect, restrictTo } = require("../controllers/authController");
const {
  createInstitution,
  getInstitutions,
  getInstitution,
  updateInstitution,
} = require("../controllers/institutionController");

const router = express.Router();

router
  .route("/")
  .post(protect, restrictTo("admin"), createInstitution)
  .get(getInstitutions);

router
  .route("/:id")
  .get(getInstitution)
  .patch(protect, restrictTo("admin", "manager"), updateInstitution);

module.exports = router;
