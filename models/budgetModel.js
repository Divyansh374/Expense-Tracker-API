const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    owner: mongoose.Types.ObjectId,
    category: mongoose.Types.ObjectId,
    month: {
      type: Number,
      required: [true, "Please provide a month for your budget"],
    },
    year: Number,
    limit: {
      type: Number,
      required: [true, "Please provide a budget limit"],
    },
    spent: Number,
  },
  { timestamps: true },
);

const Budget = mongoose.model("Budget", budgetSchema);

module.exports = Budget;
