const randomColor = require("randomcolor");
const Category = require("../models/categoryModel");
const catchAsync = require("../utils/catchAsync");

exports.createCategory = catchAsync(async (req, res, next) => {
  const category = await Category.create({
    name: req.body.name,
    icon: req.body.icon,
    color: randomColor(),
    owner: req.user._id,
    isDefault: req.body.isDefault,
  });

  res.status(200).json({
    status: "success",
    data: {
      category,
    },
  });
});

exports.getCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.find({
    owner: req.user._id,
  });

  res.status(200).json({
    status: "success",
    data: {
      categories,
    },
  });
});

exports.getCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findOne({
    _id: req.params.id,
    owner: req.user._id,
  });

  res.status(200).json({
    status: "success",
    data: {
      category,
    },
  });
});
