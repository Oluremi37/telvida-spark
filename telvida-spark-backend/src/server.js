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

// Load models + associations
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

// Connect DB before handling requests
let dbReady = false;

async function ensureDb() {
  if (dbReady) return;

  await sequelize.authenticate();

  if (process.env.SYNC_DB === "true") {
    await sequelize.sync({ alter: true });
    console.log("✅ Database synced");
  }

  dbReady = true;
  console.log("✅ Connected to PostgreSQL successfully");
}

app.use(async (req, res, next) => {
  try {
    await ensureDb();
    next();
  } catch (error) {
    console.error("DB connection error:", error);
    return res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

app.get("/", (req, res) => {
  res.json({ message: "Telvida Spark Backend is running 🚀" });
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

// Local development
async function startServer() {
  try {
    await ensureDb();
    const port = process.env.PORT || 5001;
    app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error.message);
  }
}

if (require.main === module) {
  startServer();
}

// Vercel
module.exports = app;
