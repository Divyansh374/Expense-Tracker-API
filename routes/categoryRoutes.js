const express = require("express");
const { protect, restrictTo } = require("../controllers/authController");
const {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const router = express.Router();

router
  .route("/")
  .post(protect, restrictTo("user"), createCategory)
  .get(protect, restrictTo("user"), getCategories);

router
  .route("/:id")
  .get(protect, restrictTo("user"), getCategory)
  .patch(protect, restrictTo("user"), updateCategory)
  .delete(protect, restrictTo("user"), deleteCategory);

module.exports = router;
