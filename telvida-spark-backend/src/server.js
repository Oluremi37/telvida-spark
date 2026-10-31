const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

dotenv.config();

const sequelize = require("./config/database");

const authRoutes = require("./routes/authRoutes");
const onboardingRoutes = require("./routes/onboardingRoutes");
const mediaRoutes = require("./routes/mediaRoutes");
const deviceRoutes = require("./routes/deviceRoutes");
const displayRoutes = require("./routes/displayRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const playlistRoutes = require("./routes/playlistRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const layoutRoutes = require("./routes/layoutRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const userRoutes = require("./routes/userRoutes");

require("./models");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    message: "Telvida Spark Backend is running 🚀",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/displays", displayRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/layouts", layoutRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/users", userRoutes);

// Reuse the database connection within the serverless instance
let dbReady = false;
let dbConnectionPromise = null;

async function ensureDb() {
  if (dbReady) return;

  if (!dbConnectionPromise) {
    dbConnectionPromise = (async () => {
      await sequelize.authenticate();

      if (process.env.SYNC_DB === "true") {
        await sequelize.sync({ alter: true });
        console.log("Database synced");
      }

      dbReady = true;
      console.log("PostgreSQL connected successfully");
    })().catch((error) => {
      dbConnectionPromise = null;
      throw error;
    });
  }

  await dbConnectionPromise;
}

// Local development
if (require.main === module) {
  const port = process.env.PORT || 5001;

  ensureDb()
    .then(() => {
      app.listen(port, () => {
        console.log(`Server running on port ${port}`);
      });
    })
    .catch((error) => {
      console.error("Database connection failed:", error);
      process.exit(1);
    });
}

// Vercel serverless handler
module.exports = async (req, res) => {
  try {
    await ensureDb();
    return app(req, res);
  } catch (error) {
    console.error("Database connection error:", error);

    return res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
};
