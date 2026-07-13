const mongoose = require("mongoose");
const cc = require("currency-codes");

const accountSchema = new mongoose.Schema(
  {
    name: String,
    owner: mongoose.Types.ObjectId,
    type: {
      type: String,
      enum: ["cash", "bank", "wallet"],
      default: "bank",
    },
    institution: {
      type: mongoose.Types.ObjectId,
      ref: "Institution",
    },
    currentBalance: {
      type: Number,
      required: [true, "Please provide the current balance of the account"],
    },
    openingBalance: Number,
    currency: {
      type: String,
      validate: {
        validator: function (val) {
          return cc.code(val);
        },
        message: (props) =>
          `${props.value} is not a valid ISO 4217 currency code`,
      },
    },
    color: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const Account = mongoose.model("Account", accountSchema);

module.exports = Account;
