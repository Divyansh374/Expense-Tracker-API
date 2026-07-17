const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, "Please provide a name for your category"],
    },
    icon: String,
    color: String,
    owner: mongoose.Types.ObjectId,
    transactions: [
      {
        sourceAccount: mongoose.Types.ObjectId,
        destinationAccount: mongoose.Types.ObjectId,
        type: String,
        amount: Number,
      },
    ],
    isDefault: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  { timestamps: true },
);

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
