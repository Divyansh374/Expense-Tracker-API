const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name for your category"],
    },
    type: {
      type: String,
      enum: ["expense", "income", "transfer"],
    },
    icon: String,
    color: String,
    owner: mongoose.Types.ObjectId,
    isDefault: Boolean,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
