const express = require("express");
const { protect, restrictTo } = require("../controllers/authController");
const { createCategory } = require("../controllers/categoryController");

const router = express.Router();

router.route("/").post(protect, restrictTo("user"), createCategory);

module.exports = router;
