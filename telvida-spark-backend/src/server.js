const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// Simple test route — no DB
app.get("/", (req, res) => {
  res.json({
    message: "Telvida Spark Backend is running 🚀",
    hasDatabaseUrl: Boolean(
      process.env.DATABASE_URL || process.env.DATABASE_URL_POOLED,
    ),
    hasJwt: Boolean(process.env.JWT_SECRET),
  });
});

module.exports = app;
