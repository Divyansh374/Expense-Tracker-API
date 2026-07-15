const Institution = require("../models/institutionModel");
const Request = require("../models/institutionRequestModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { excludeObj } = require("../utils/objectUtils");

exports.createInstitution = catchAsync(async (req, res, next) => {
  const newInstitution = await Institution.create(req.body);

  const normalizedName = newInstitution.name
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

  const matchingRequest = await Request.findOne({
    status: "pending",
    normalizedName,
  });

  if (matchingRequest) {
    matchingRequest.status = "approved";
    matchingRequest.reviewedBy = undefined;
    matchingRequest.reviewedAt = Date.now();
    matchingRequest.adminRemarks =
      "The request was automatically approved. The institution has been added to the API";
    await matchingRequest.save();
  }

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

exports.updateInstitution = catchAsync(async (req, res, next) => {
  const institution = await Institution.findById(req.params.id);

  if (!institution) {
    return next(new AppError(404, "Institution not found"));
  }

  const filteredBody = excludeObj(
    req.body,
    "institutionType",
    "country",
    "isActive",
  );

  Object.assign(institution, filteredBody);

  await institution.save();

  res.status(200).json({
    status: "success",
    data: {
      institution,
    },
  });
});

exports.deleteInstitution = catchAsync(async (req, res, next) => {
  const institution = await Institution.findById(req.params.id);

  if (!institution) {
    return next(new AppError(404, "Institution not found"));
  }

  institution.isActive = false;
  await institution.save();

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.restoreInstitution = catchAsync(async (req, res, next) => {
  const institution = await Institution.findById(
    req.params.id,
  ).includeInactive();

  if (!institution) {
    return next(new AppError(404, "Institution not found"));
  }

  institution.isActive = true;
  await institution.save();

  res.status(200).json({
    status: "success",
    data: {
      institution,
    },
  });
});
