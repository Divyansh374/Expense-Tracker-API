const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    amount: {
      type: Number,
      required: [true, "Please specify an amount"],
    },
    transactionType: {
      type: String,
      enum: ["expense", "income", "transfer"],
    },
    linkedTransaction: mongoose.Types.ObjectId,
    isRecurring: Boolean,
    recurringTransaction: mongoose.Types.ObjectId,
    receipt: String,
    paymentMode: {
      type: String,
      enum: ["digital", "cash"],
    },
    sourceAccount: {
      name: String,
      institution: String,
      id: mongoose.Types.ObjectId,
    },
    destinationAccount: {
      name: String,
      institution: String,
      id: mongoose.Types.ObjectId,
    },
    category: mongoose.Types.ObjectId,
    owner: mongoose.Types.ObjectId,
    transactionDate: Date,
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "completed",
    },
    notes: String,
    attachments: Array,
  },
  { timestamps: true },
);

transactionSchema.pre("save", function () {
  if (!this.isNew) return;

  this.transactionDate = Date.now();
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
