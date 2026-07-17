const express = require("express");
const { protect, restrictTo } = require("../controllers/authController");
const {
  createInstitution,
  getInstitutions,
  getInstitution,
  updateInstitution,
  deleteInstitution,
  restoreInstitution,
} = require("../controllers/institutionController");

const router = express.Router();

router
  .route("/")
  .post(protect, restrictTo("admin"), createInstitution)
  .get(getInstitutions);

router
  .route("/:id")
  .get(getInstitution)
  .patch(protect, restrictTo("admin"), updateInstitution)
  .delete(protect, restrictTo("admin"), deleteInstitution);

router.patch("/:id/restore", protect, restrictTo("admin"), restoreInstitution);

module.exports = router;
