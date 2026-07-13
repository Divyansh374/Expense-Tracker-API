const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signup = catchAsync(async (req, res, next) => {
  // Create the user
  const { name, email, password, passwordConfirm } = req.body;

  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
  });

  // Create JWT
  const token = signToken(newUser._id);

  // Send JWT
  res.status(200).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if user provided both email and password
  if (!email || !password) {
    return next(new AppError(400, "Please provide email and password"));
  }

  // Get the user
  const user = await User.findOne({ email }).select("+password");

  // Check password
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError(404, "Incorrect email or password"));
  }

  // Send JWT
  const token = signToken(user._id);

  res.status(200).json({
    status: "success",
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // Check if the user has a token
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError(401, "You are not logged in. Please log in again"),
    );
  }

  // Token verification
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Check if the user still exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError(401, "The user associated to the token no longer exists"),
    );
  }

  // Check if the password was changed after the token was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        401,
        "User recently changed the password. Please login again",
      ),
    );
  }

  // Grant access to the protected route
  req.user = freshUser;
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          403,
          "You do not have the permission to access this route",
        ),
      );
    }
    next();
  };
