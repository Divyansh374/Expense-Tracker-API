const mongoose = require("mongoose");

const institutionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    shortName: String,
    institutionType: {
      type: String,
      enum: ["bank", "walletProvider", "paymentGateway"],
    },
    country: String,
    logo: String,
    website: String,
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  { timestamps: true },
);

const Institution = mongoose.model("Institution", institutionSchema);

module.exports = Institution;

// Institution Request by user

/*

name: "Jupiter",
requestedBy: "userId",
status: "pending",

*/
