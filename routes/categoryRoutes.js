const express = require("express");
const { protect, restrictTo } = require("../controllers/authController");
const {
  createCategory,
  getCategories,
} = require("../controllers/categoryController");

const router = express.Router();

router
  .route("/")
  .post(protect, restrictTo("user"), createCategory)
  .get(protect, restrictTo("user"), getCategories);

module.exports = router;
