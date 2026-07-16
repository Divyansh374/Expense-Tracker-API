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
