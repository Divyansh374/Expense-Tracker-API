const mongoose = require("mongoose");
const cc = require("currency-codes");
const AppError = require("../utils/appError");

const accountSchema = new mongoose.Schema(
  {
    name: String,
    owner: mongoose.Types.ObjectId,
    type: {
      type: String,
      enum: ["cash", "bank", "wallet"],
      required: [true, "Please provide the type of your account"],
    },
    institution: {
      name: String,
      id: { type: mongoose.Types.ObjectId, ref: "Institution" },
    },
    balance: {
      type: Number,
      default: 0,
      validate: {
        validator: (val) => val >= 0,
        message: "An Account cannot have negative balance",
      },
    },
    currency: {
      type: String,
      validate: {
        validator: (val) => cc.code(val),
        message: (props) =>
          `${props.value} is not a valid ISO 4217 currency code`,
      },
    },
    color: String,
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  { timestamps: true },
);

accountSchema.pre("validate", function () {
  if (this.type === "cash" && this.institution?.id) {
    throw new AppError(
      400,
      "Cash account cannot be associated with an institution",
    );
  }

  if (this.type === "cash" && !this.currency) {
    throw new AppError(400, "Please provide a currency for your cash account");
  }
});

accountSchema.pre("validate", function () {
  if (this.type !== "cash" && !this.institution?.id) {
    throw new AppError(
      400,
      "Please provide an institution for your digital account",
    );
  }
});

accountSchema.pre(/^find/, function () {
  const options = this.getOptions();

  if (options.skipMiddleware === true) return;

  if (this.isActive === false) {
    throw new AppError(400, "This account is inactive");
  }
});

const Account = mongoose.model("Account", accountSchema);

module.exports = Account;
