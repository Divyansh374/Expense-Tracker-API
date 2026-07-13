const express = require("express");
const morgan = require("morgan");

const authRouter = require("./routes/authRoutes");
const institutionRouter = require("./routes/institutionRoutes");

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

module.exports = app;
