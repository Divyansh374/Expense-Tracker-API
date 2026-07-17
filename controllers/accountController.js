const randomColor = require("randomcolor");
const Account = require("../models/accountModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");

const generateAccountName = (name, accountNumber) =>
  accountNumber === 1 ? name : `${name} - Account ${accountNumber}`;

exports.validateCurrency = catchAsync(async (req, res, next) => {
  let accountCurrency;

  const isCash = req.body.type === "cash";

  if (isCash) {
    accountCurrency = req.body.currency;
  } else {
    const correctCurrency = req.institution.supportedCurrencies.some(
      (c) => c === req.body.currency,
    );

    if (!correctCurrency) {
      return next(
        new AppError(
          400,
          `The specified institution does not support the currency ${req.body.currency}`,
        ),
      );
    }

    if (req.institution.supportedCurrencies.length === 1) {
      accountCurrency = req.institution.supportedCurrencies[0];
    } else {
      accountCurrency = req.body.currency;
    }
  }

  req.currency = accountCurrency;
  next();
});

exports.generateAccountName = catchAsync(async (req, res, next) => {
  let accountNumber;
  const isCash = req.body.type === "cash";

  if (isCash) {
    const count = await Account.countDocuments({
      owner: req.user._id,
      type: "cash",
    });

    accountNumber = count + 1;
  } else {
    const { institution } = req;

    const count = await Account.countDocuments({
      owner: req.user._id,
      "institution.id": institution._id,
    });

    accountNumber = count + 1;
  }

  req.accountNumber = accountNumber;
  next();
});

exports.addAccount = catchAsync(async (req, res, next) => {
  let name;
  let institution;

  const isCash = req.body.type === "cash";

  if (isCash) {
    name = req.body.name || generateAccountName("Cash", req.accountNumber);
    institution = undefined;
  } else {
    name =
      req.body.name ||
      generateAccountName(req.institution.name, req.accountNumber);
    institution = {
      name: req.institution.name,
      id: req.institution._id,
    };
  }

  const account = await Account.create({
    name,
    owner: req.user._id,
    type: req.body.type,
    institution,
    currency: req.currency,
    color: randomColor(),
  });

  res.status(201).json({
    status: "success",
    data: {
      account,
    },
  });
});

exports.getAccounts = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(
    Account.find({ owner: req.user._id, isDeleted: false }),
    req.query,
    ["name", "type", "institution", "currency"],
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const accounts = await features.query;

  res.status(200).json({
    status: "success",
    data: {
      accounts,
    },
  });
});

exports.getDeletedAccounts = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(
    Account.find({ owner: req.user._id, isDeleted: true }),
    req.query,
    ["name", "type", "institution", "currency"],
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const accounts = await features.query;

  res.status(200).json({
    status: "success",
    data: {
      accounts,
    },
  });
});

exports.getAccount = catchAsync(async (req, res, next) => {
  const account = await Account.findById(req.params.id);

  if (!account) {
    return next(new AppError(404, "Account not found"));
  }

  if (!req.user._id.equals(account.owner)) {
    return next(
      new AppError(401, "You do not have permission to access this account"),
    );
  }

  res.status(200).json({
    status: "success",
    data: {
      account,
    },
  });
});

exports.updateAccount = catchAsync(async (req, res, next) => {
  const account = await Account.findById(req.params.id);

  if (!account) {
    return next(new AppError(404, "Account not found"));
  }

  if (!req.user._id.equals(account.owner)) {
    return next(
      new AppError(401, "You do not have permission to access this account"),
    );
  }

  if (!account.name.startsWith(`${account.institution.name} - Account`)) {
    return next(
      new AppError(400, "Custom names set by the user cannot be updated"),
    );
  }

  account.name = req.body.name;
  await account.save();

  res.status(200).json({
    status: "success",
    data: {
      account,
    },
  });
});

exports.deleteAccount = catchAsync(async (req, res, next) => {
  const account = await Account.findById(req.params.id);

  if (!account) {
    return next(new AppError(404, "Institution not found"));
  }

  if (!req.user._id.equals(account.owner)) {
    return next(
      new AppError(401, "You do not have permission to access this account"),
    );
  }

  account.isDeleted = true;
  await account.save();

  res.status(204).json({
    status: "success",
    data: {
      account,
    },
  });
});

exports.restoreAccount = catchAsync(async (req, res, next) => {
  const account = await Account.findById(req.params.id).setOptions({
    skipMiddleware: true,
  });

  if (!account) {
    return next(new AppError(404, "Institution not found"));
  }

  if (!req.user._id.equals(account.owner)) {
    return next(
      new AppError(401, "You do not have permission to access this account"),
    );
  }

  account.isActive = true;
  await account.save();

  res.status(200).json({
    status: "success",
    data: {
      account,
    },
  });
});

exports.getAccountStats = catchAsync(async (req, res, next) => {
  const stats = await Account.aggregate([
    {
      $match: { owner: req.user._id },
    },
    {
      $facet: {
        accountTotals: [
          {
            $group: {
              _id: null,
              totalAccounts: {
                $sum: 1,
              },
              cashAccounts: {
                $sum: {
                  $cond: [
                    {
                      $eq: ["$type", "cash"],
                    },
                    1,
                    0,
                  ],
                },
              },
              bankAccounts: {
                $sum: {
                  $cond: [
                    {
                      $eq: ["$type", "bank"],
                    },
                    1,
                    0,
                  ],
                },
              },
              wallets: {
                $sum: {
                  $cond: [
                    {
                      $eq: ["$type", "wallet"],
                    },
                    1,
                    0,
                  ],
                },
              },
            },
          },
          {
            $project: {
              _id: 0,
              totalAccounts: "$totalAccounts",
              cashAccounts: "$cashAccounts",
              bankAccounts: "$bankAccounts",
              wallets: "$wallets",
            },
          },
        ],
        currencyTotals: [
          {
            $group: {
              _id: "$currency",
              accounts: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
              currency: "$_id",
              accounts: "$accounts",
            },
          },
        ],
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});
