const Institution = require("../models/institutionModel");
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
