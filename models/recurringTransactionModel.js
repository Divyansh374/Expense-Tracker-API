const mongoose = require("mongoose");

const recurringTransactionSchema = new mongoose.Schema(
  {
    owner: mongoose.Types.ObjectId,
    title: {
      type: String,
      required: [true, "Please specify a name for your transaction"],
    },
    description: String,
    amount: {
      type: Number,
      required: [true, "Please specify an amount"],
    },
    transactionType: {
      type: String,
      enum: ["expense", "income", "transfer"],
    },
    paymentMode: {
      type: String,
      enum: ["UPI", "Credit Card", "Debit Card", "Net Banking", "Cash"],
      default: "Net Banking",
    },
    sourceAccount: mongoose.Types.ObjectId,
    destinationAccount: mongoose.Types.ObjectId,
    category: mongoose.Types.ObjectId,
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      required: [true, "Please provide the payment frequency"],
    },
    interval: {
      type: Number,
      required: [true, "Please enter an interval"],
    },
    startDate: Date,
    endDate: Date,
    nextExecution: Date,
    lastExecuted: Date,
    autoCreate: Boolean,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const RecurringTransaction = mongoose.model(
  "RecurringTransaction",
  recurringTransactionSchema,
);

module.exports = RecurringTransaction;
