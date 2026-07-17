const express = require("express");
const morgan = require("morgan");
const globalErrorHandler = require("./controllers/errorController");

const authRouter = require("./routes/authRoutes");
const institutionRouter = require("./routes/institutionRoutes");
const institutionRequestRouter = require("./routes/institutionRequestRoutes");
const accountRouter = require("./routes/accountRoutes");
const transactionRouter = require("./routes/transactionRoutes");
const categoryRouter = require("./routes/categoryRoutes");

const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  next();
});

app.use("/expense-tracker/v1/users", authRouter);
app.use("/expense-tracker/v1/institutions", institutionRouter);
app.use("/expense-tracker/v1/institution-requests", institutionRequestRouter);
app.use("/expense-tracker/v1/accounts", accountRouter);
app.use("/expense-tracker/v1/transactions", transactionRouter);
app.use("/expense-tracker/v1/categories", categoryRouter);

app.use(globalErrorHandler);

module.exports = app;
