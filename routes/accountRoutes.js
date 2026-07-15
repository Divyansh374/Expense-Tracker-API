const express = require("express");
const { protect, restrictTo } = require("../controllers/authController");
const { validateInstitution } = require("../controllers/institutionController");
const {
  validateCurrency,
  generateAccountName,
  addAccount,
  getAccounts,
  getAccount,
  updateAccount,
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
  )
  .get(protect, restrictTo("user"), getAccounts);

router
  .route("/:id")
  .get(protect, restrictTo("user"), getAccount)
  .patch(protect, restrictTo("user"), updateAccount);

module.exports = router;
