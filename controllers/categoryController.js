const randomColor = require("randomcolor");
const Category = require("../models/categoryModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { excludeObj } = require("../utils/objectUtils");
const Transaction = require("../models/transactionModel");
const APIFeatures = require("../utils/apiFeatures");

exports.createCategory = catchAsync(async (req, res, next) => {
  const existingCategory = await Category.findOne({
    name: req.body.name,
    owner: req.user._id,
  });

  if (existingCategory) {
    return next(new AppError(400, "A category with this name already exists"));
  }

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
  const features = new APIFeatures(
    Category.find({
      owner: req.user._id,
    }),
    req.query,
    ["name"],
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const categories = await features.query;

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

  if (!category) {
    return next(new AppError(404, "Category not found"));
  }

  res.status(200).json({
    status: "success",
    data: {
      category,
    },
  });
});

exports.updateCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findOne({
    _id: req.params.id,
    owner: req.user._id,
  });

  if (!category) {
    return next(new AppError(404, "Category not found"));
  }

  const filteredObj = excludeObj(req.body, "isActive", "transactions");

  Object.keys(filteredObj).forEach(
    (e) => filteredObj[e] === undefined && delete filteredObj[e],
  );

  category.set(filteredObj);
  await category.save();

  res.status(200).json({
    status: "success",
    data: {
      category,
    },
  });
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findOneAndDelete({
    _id: req.params.id,
    owner: req.user._id,
  });

  if (!category) {
    return next(new AppError(404, "Category not found"));
  }

  res.status(204).json({
    status: "success",
    data: {
      category,
    },
  });
});

exports.getCategoryTransactions = catchAsync(async (req, res, next) => {
  const category = await Category.findOne({
    _id: req.params.id,
    owner: req.user._id,
  });

  if (!category) {
    return next(new AppError(404, "Category not found"));
  }

  const features = new APIFeatures(
    Transaction.find({
      category: req.params.id,
      owner: req.user._id,
      isDeleted: false,
    }),
    req.query,
    [
      "title",
      "description",
      "transactionType",
      "paymentMode",
      "sourceAccount",
      "destinationAccount",
      "notes",
    ],
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const transactions = await features.query;

  res.status(200).json({
    status: "success",
    data: {
      transactions,
    },
  });
});
