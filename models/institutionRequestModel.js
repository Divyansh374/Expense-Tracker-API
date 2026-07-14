const mongoose = require("mongoose");
const normalizeName = require("../utils/normalizeName");

const institutionRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide the name of the institution"],
      trim: true,
      unique: true,
      minlength: 2,
      maxlength: 100,
    },
    normalizedName: {
      type: String,
      unique: true,
      select: false,
    },
    shortName: String,
    website: String,
    requestedBy: [
      {
        type: mongoose.Types.ObjectId,
      },
    ],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },
    reviewedBy: mongoose.Types.ObjectId,
    reviewedAt: Date,
    adminRemarks: String,
  },
  { timestamps: true },
);

institutionRequestSchema.pre("save", function () {
  this.name = this.name.replace(/\s+/g, " ");
});

institutionRequestSchema.pre("save", function () {
  this.normalizedName = normalizeName(this.name);
});

const InstitutionRequest = mongoose.model(
  "InstitutionRequest",
  institutionRequestSchema,
);

module.exports = InstitutionRequest;
