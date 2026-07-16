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
  )
  .get(protect, restrictTo("user"), getTransactions);

router.route("/:id").get(protect, restrictTo("user"), getTransaction);

module.exports = router;
