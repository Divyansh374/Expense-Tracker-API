const express = require("express");
const {
  signup,
  login,
  protect,
  restrictTo,
} = require("../controllers/authController");
const { getAllUsers } = require("../controllers/userController");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

module.exports = router;
