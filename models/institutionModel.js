const mongoose = require("mongoose");
const validator = require("validator");
const { isValid } = require("i18n-iso-countries");

const institutionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    shortName: String,
    description: String,
    institutionType: {
      type: String,
      enum: ["bank", "walletProvider", "paymentGateway"],
      required: [
        true,
        "Please provide a type: bank, walletProvider, paymentGateway",
      ],
    },
    supportedCurrencies: [
      {
        type: String,
        uppercase: true,
        validate: {
          validator: validator.isCurrency,
          message: (props) => `${props.value} is not a valid country code`,
        },
      },
    ],
    country: {
      type: String,
      required: [true, "Please specify the country"],
      uppercase: true,
      trim: true,
      validate: {
        validator: isValid,
        message: (props) =>
          `${props.value} is not a valid ISO 3166-1 alpha-2 country code`,
      },
    },
    logo: String,
    website: {
      type: String,
      validate: {
        validator: validator.isURL,
        message: "Please provide a valid website URL",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  { timestamps: true },
);

institutionSchema.pre(/^find/, function () {
  this.find({ isActive: true });
});

const Institution = mongoose.model("Institution", institutionSchema);

module.exports = Institution;

// Institution Request by user

/*

name: "Jupiter",
requestedBy: "userId",
status: "pending",

*/
