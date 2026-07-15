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
  deleteAccount,
  restoreAccount,
} = require("../controllers/accountController");

const router = express.Router();

router.patch("/:id/restore", protect, restrictTo("user"), restoreAccount);

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
  .patch(protect, restrictTo("user"), updateAccount)
  .delete(protect, restrictTo("user"), deleteAccount);

module.exports = router;
