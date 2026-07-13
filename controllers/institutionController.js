const Institution = require("../models/institutionModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.createInstitution = catchAsync(async (req, res, next) => {
  const newInstitution = await Institution.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      institution: newInstitution,
    },
  });
});

exports.getInstitutions = catchAsync(async (req, res, next) => {
  const institutions = await Institution.find({
    isActive: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      institutions,
    },
  });
});

exports.getInstitution = catchAsync(async (req, res, next) => {
  const institution = await Institution.findById(req.params.id);

  if (!institution) {
    return next(new AppError(404, "Institution not found"));
  }

  res.status(200).json({
    status: "success",
    data: {
      institution,
    },
  });
});
