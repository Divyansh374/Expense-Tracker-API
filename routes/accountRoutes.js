const express = require("express");
const { protect, restrictTo } = require("../controllers/authController");
const { validateInstitution } = require("../controllers/institutionController");
const {
  validateCurrency,
  generateAccountName,
  addAccount,
} = require("../controllers/accountController");

const router = express.Router();

router
  .route("/")
  .post(
    protect,
    restrictTo("user"),
    validateInstitution,
    validateCurrency,
    generateAccountName,
    addAccount,
  );

module.exports = router;
