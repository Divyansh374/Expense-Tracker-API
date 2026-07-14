const Request = require("../models/institutionRequestModel");
const Institution = require("../models/institutionModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { excludeObj } = require("../utils/objectUtils");
const normalizeName = require("../utils/normalizeName");

exports.postRequest = catchAsync(async (req, res, next) => {
  // Filter the body
  const filteredObj = excludeObj(
    req.body,
    "status",
    "reviewedBy",
    "reviewedAt",
    "adminRemarks",
  );

  filteredObj.requestedBy = [req.user._id];

  // Check if a request or institution already exists
  const normalizedName = normalizeName(req.body.name);

  const [existingRequest, existingInstitution] = await Promise.all([
    Request.findOne({ normalizedName }),
    Institution.findOne({ normalizedName }),
  ]);

  if (existingInstitution) {
    return next(new AppError(400, "This institution already exists"));
  }

  if (existingRequest) {
    // Check if the request has been rejected by the admin
    if (existingRequest.status === "rejected") {
      existingRequest.status = "pending";
      existingRequest.requestedBy = [];

      existingRequest.reviewedBy = undefined;
      existingRequest.reviewedAt = undefined;
      existingRequest.adminRemarks = undefined;
    }

    // Check if user has once already requested for the same institution
    const alreadyRequested = existingRequest.requestedBy.some((id) =>
      id.equals(req.user._id),
    );

    if (alreadyRequested) {
      return next(
        new AppError(400, "You have already requested this institution once"),
      );
    }

    // Push the user id in the existing request
    existingRequest.requestedBy.push(req.user._id);
    await existingRequest.save();

    return res.status(200).json({
      status: "success",
      data: {
        request: existingRequest,
      },
    });
  }

  // If all ok, create new request
  const request = await Request.create(filteredObj);

  res.status(200).json({
    status: "success",
    data: {
      request,
    },
  });
});

exports.getRequests = catchAsync(async (req, res, next) => {
  let pendingRequests;

  if (req.user.role === "admin") {
    pendingRequests = await Request.find({ status: "pending" });
  }

  if (req.user.role === "user") {
    pendingRequests = await Request.find({
      requestedBy: req.user._id,
      status: { $ne: "cancelled" },
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      requests: pendingRequests,
    },
  });
});

exports.getRequest = catchAsync(async (req, res, next) => {
  const request = await Request.findById(req.params.id);

  if (!request) {
    return next(new AppError(404, "Request not found"));
  }

  const requestedByUser = request.requestedBy.some((id) =>
    id.equals(req.user._id),
  );

  if (req.user.role === "user" && !requestedByUser) {
    return next(
      new AppError(401, "You do not have permission to access this request"),
    );
  }

  res.status(200).json({
    status: "success",
    data: {
      request,
    },
  });
});

exports.approveRequest = catchAsync(async (req, res, next) => {
  const request = await Request.findById(req.params.id);

  if (!request) {
    return next(new AppError(404, "Request not found"));
  }

  if (request.status === "approved") {
    return next(
      new AppError(400, "This request has already been approved before"),
    );
  }

  if (request.status === "cancelled" || request.status === "rejected") {
    return next(new AppError(400, `This request has been ${request.status}`));
  }

  const institution = await Institution.create({
    name: request.name,
    shortName: req.body.shortName || request.shortName,
    description: req.body.description,
    institutionType: req.body.institutionType,
    supportedCurrencies: req.body.supportedCurrencies,
    country: req.body.country,
    website: req.body.website || request.website,
    logo: req.body.logo,
  });

  request.status = "approved";
  request.reviewedBy = req.user._id;
  request.reviewedAt = Date.now();
  request.adminRemarks = req.body.adminRemarks;
  await request.save();

  res.status(200).json({
    status: "success",
    data: {
      institution,
      request,
    },
  });
});

exports.rejectRequest = catchAsync(async (req, res, next) => {
  const request = await Request.findById(req.params.id);

  if (!request) {
    return next(new AppError(404, "Request not found"));
  }

  if (request.status === "rejected" || request.status === "approved") {
    return next(
      new AppError(400, `This request has already been ${request.status}`),
    );
  }

  if (request.status === "cancelled") {
    return next(new AppError(400, "This request has been cancelled"));
  }

  request.status = "rejected";
  request.reviewedBy = req.user._id;
  request.reviewedAt = Date.now();
  request.adminRemarks = req.body.adminRemarks;
  await request.save();

  res.status(200).json({
    status: "success",
    data: {
      request,
    },
  });
});

exports.cancelRequest = catchAsync(async (req, res, next) => {
  const request = await Request.findById(req.params.id);

  if (!request) {
    return next(new AppError(404, "Request not found"));
  }

  const requestedByUser = request.requestedBy.some((id) =>
    id.equals(req.user._id),
  );

  if (!requestedByUser) {
    return next(
      new AppError(401, "You do not have permission to cancel this request"),
    );
  }

  if (request.status === "rejected" || request.status === "approved") {
    return next(
      new AppError(400, `This request has already been ${request.status}`),
    );
  }

  if (request.status === "cancelled") {
    return next(new AppError(400, "This request has already been cancelled"));
  }

  request.requestedBy.pull(req.user._id);

  if (request.requestedBy.length === 0) {
    request.status = "cancelled";
    request.reviewedBy = undefined;
    request.reviewedAt = undefined;
    request.adminRemarks = undefined;
  }

  await request.save();

  res.status(204).json({
    status: "success",
    data: {
      request,
    },
  });
});
