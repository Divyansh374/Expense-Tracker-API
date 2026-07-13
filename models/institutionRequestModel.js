const mongoose = require("mongoose");

const institutionRequestSchema = new mongoose.Schema(
  {
    institutionName: {
      type: String,
      required: [true, "Please provide the name of the institution"],
    },
    website: String,
    requestedBy: mongoose.Types.ObjectId,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
    },
    reviewedBy: mongoose.Types.ObjectId,
    reviewedAt: Date,
    adminRemarks: String,
  },
  { timestamps: true },
);

const InstitutionRequest = mongoose.model(
  "InstitutionRequest",
  institutionRequestSchema,
);

module.exports = InstitutionRequest;
