const express = require("express");
const { protect, restrictTo } = require("../controllers/authController");
const {
  resolveAccounts,
  resolveCurrency,
  validateAmount,
  resolvePaymentMode,
  createTransaction,
  getTransactions,
  getTransaction,
  deleteTransaction,
  getTransactionStats,
} = require("../controllers/transactionController");

const router = express.Router();

router.get("/stats", protect, getTransactionStats);

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
  )
  .get(protect, restrictTo("user"), getTransactions);

router
  .route("/:id")
  .get(protect, restrictTo("user"), getTransaction)
  .delete(protect, restrictTo("user"), deleteTransaction);

module.exports = router;
