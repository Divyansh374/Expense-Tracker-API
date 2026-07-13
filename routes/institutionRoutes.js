const express = require("express");
const { protect, restrictTo } = require("../controllers/authController");
const {
  createInstitution,
  getInstitutions,
  getInstitution,
} = require("../controllers/institutionController");

const router = express.Router();

router
  .route("/")
  .post(protect, restrictTo("admin"), createInstitution)
  .get(getInstitutions);

router.route("/:id").get(getInstitution);

module.exports = router;
