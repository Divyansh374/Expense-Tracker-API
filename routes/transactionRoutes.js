const express = require("express");
const { protect, restrictTo } = require("../controllers/authController");
const {
  resolveAccounts,
  resolveCurrency,
  validateAmount,
  resolvePaymentMode,
  createTransaction,
  getTransactions,
} = require("../controllers/transactionController");

const router = express.Router();

router
  .route("/")
  .post(
    protect,
    restrictTo("user"),
    resolveAccounts,
    resolveCurrency,
    validateAmount,
    resolvePaymentMode,
    createTransaction,
  );

module.exports = router;
