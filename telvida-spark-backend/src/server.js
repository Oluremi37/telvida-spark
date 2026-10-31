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

app.get("/", async (req, res) => {
  try {
    const sequelize = require("./config/database");
    await sequelize.authenticate();

    res.json({
      message: "Telvida Spark Backend is running 🚀",
      database: "connected",
    });
  } catch (error) {
    console.error("DB error:", error);
    res.status(500).json({
      message: "Database connection failed",
      error: error.message,
      name: error.name,
    });
  }
});
app.get("/debug", (req, res) => {
  try {
    const pg = require("pg");
    const { Sequelize } = require("sequelize");

    res.json({
      success: true,
      pgAvailable: !!pg.Client,
      sequelizeAvailable: !!Sequelize,
      nodeVersion: process.version,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack,
    });
  }
});

module.exports = app;
