const mongoose = require("mongoose");
const Transaction = require("../models/transactionModel");
const Account = require("../models/accountModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.resolveAccounts = catchAsync(async (req, res, next) => {
  const { sourceAccount, destinationAccount } = req.body;

  const findUserAccount = (account) =>
    Account.findOne({
      name: account.name,
      "institution.name": account.institution,
      owner: req.user._id,
    });
  let type;
  let source;
  let destination;

  if (sourceAccount && destinationAccount) {
    [source, destination] = await Promise.all([
      findUserAccount(sourceAccount),
      findUserAccount(destinationAccount),
    ]);

    if (!source) {
      return next(new AppError(404, "Source Account not found"));
    }

    if (!destination) {
      return next(new AppError(404, "Destination Account not found"));
    }

    if (source._id.equals(destination._id)) {
      return next(
        new AppError(400, "Source and Destination accounts cannot be the same"),
      );
    }

    type = "transfer";
    req.source = source;
    req.destination = destination;
  } else if (sourceAccount) {
    source = await findUserAccount(sourceAccount);

    if (!source) {
      return next(new AppError(404, "Source Account not found"));
    }

    type = "expense";
    req.source = source;
  } else if (destinationAccount) {
    destination = await findUserAccount(destinationAccount);

    if (!destination) {
      return next(new AppError(404, "Destination Account not found"));
    }

    type = "income";
    req.destination = destination;
  } else {
    return next(
      new AppError(
        400,
        "Please provide at least one account, source or destination",
      ),
    );
  }

  req.type = type;
  next();
});

exports.resolveCurrency = catchAsync(async (req, res, next) => {
  if (
    req.type === "transfer" &&
    req.source.currency !== req.destination.currency
  ) {
    return next(
      new AppError(
        400,
        `You can't make a transaction from ${req.source.currency} account to ${req.destination.currency} account`,
      ),
    );
  }

  next();
});

exports.validateAmount = catchAsync(async (req, res, next) => {
  if (!req.body.amount) {
    return next(
      new AppError(400, "Please enter the amount for the transaction"),
    );
  }

  if (typeof req.body.amount !== "number") {
    return next(new AppError(400, "Amount must be a number"));
  }

  if (req.body.amount < 0) {
    return next(new AppError(400, "Amount must be greater than 0"));
  }

  if (req.source && req.body.amount > req.source.balance) {
    return next(new AppError(400, "Funds not sufficient"));
  }

  next();
});

exports.resolvePaymentMode = catchAsync(async (req, res, next) => {
  if (req.type === "transfer" || req.type === "expense") {
    const { source } = req;

    if (source.type === "cash") {
      req.paymentMode = "cash";
    } else {
      req.paymentMode = "digital";
    }
  } else {
    const { destination } = req;

    if (destination.type === "cash") {
      req.paymentMode = "cash";
    } else {
      req.paymentMode = "digital";
    }
  }

  next();
});

exports.createTransaction = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();

  session.startTransaction();

  try {
    let source;
    let destination;

    if (req.source) {
      await Account.findByIdAndUpdate(
        req.source._id,
        {
          $inc: { balance: -req.body.amount },
        },
        { session },
      );
      source = {
        name: req.source.name,
        institution: req.source.institution.name,
        id: req.source._id,
      };
    }

    if (req.destination) {
      await Account.findByIdAndUpdate(
        req.destination._id,
        {
          $inc: { balance: req.body.amount },
        },
        { session },
      );
      destination = {
        name: req.destination.name,
        institution: req.destination.institution.name,
        id: req.destination._id,
      };
    }

    const transaction = await Transaction.create(
      [
        {
          title: req.body?.title,
          description: req.body?.description,
          amount: req.body.amount,
          transactionType: req.type,
          paymentMode: req.paymentMode,
          sourceAccount: source,
          destinationAccount: destination,
          owner: req.user._id,
          notes: req.body?.notes,
          attachments: req.body?.attachments,
        },
      ],
      { session },
    );

    await session.commitTransaction();

    res.status(200).json({
      status: "success",
      data: {
        transaction,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    return next(err);
  } finally {
    session.endSession();
  }
});
