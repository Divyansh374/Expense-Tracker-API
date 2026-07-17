const mongoose = require("mongoose");
const validator = require("validator");
const { isValid } = require("i18n-iso-countries");
const { code } = require("currency-codes");

const institutionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide the name of the Institution"],
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    normalizedName: {
      type: String,
      unique: true,
      select: false,
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
    supportedCurrencies: {
      type: [
        {
          type: String,
          uppercase: true,
          validate: {
            validator: (val) => code(val),
            message: (props) => `${props.value} is not a valid currency code`,
          },
        },
      ],
      validate: {
        validator: function (arr) {
          return arr.length > 0;
        },
        message: "Please provide at least one supported currency",
      },
    },
    country: {
      type: String,
      required: [true, "Please specify the country"],
      uppercase: true,
      trim: true,
      validate: {
        validator: (val) => isValid(val),
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

institutionSchema.pre("save", function () {
  this.normalizedName = this.name.trim().toLowerCase();
});

institutionSchema.query.includeInactive = function () {
  return this.setOptions({ includeInactive: true });
};

institutionSchema.pre(/^find/, function () {
  if (!this.getOptions().includeInactive) {
    this.find({ isActive: true });
  }
});

const Institution = mongoose.model("Institution", institutionSchema);

module.exports = Institution;

// Institution Request by user

/*

name: "Jupiter",
requestedBy: "userId",
status: "pending",

*/
