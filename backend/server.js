const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const connectDB = require("./config/db");
const { apiLimiter } = require("./middleware/limits");
const authRoutes = require("./routes/authRoutes");
const githubRoutes = require("./routes/githubRoutes");
const scanRoutes = require("./routes/scanRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const required = ["MONGO_URI", "JWT_SECRET", "TOKEN_ENC_KEY", "GITHUB_APP_ID", "GITHUB_APP_SLUG", "GITHUB_APP_CLIENT_ID", "GITHUB_APP_CLIENT_SECRET", "GITHUB_APP_PRIVATE_KEY_PATH", "FRONTEND_URL"];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error("Missing env variables:", missing.join(", "));
  process.exit(1);
}
if (!/^[0-9a-f]{64}$/i.test(process.env.TOKEN_ENC_KEY)) {
  console.error("TOKEN_ENC_KEY must be 64 hex characters");
  process.exit(1);
}

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json({ limit: "100kb" }));
app.use("/api", apiLimiter);

app.get("/", (req, res) => {
  res.json({ message: "Autonomous Dependency Patcher Backend is Running!" });
});

app.use("/api/auth", authRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/scans", scanRoutes);
app.use("/api", dashboardRoutes);

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(err.status || 500).json({ message: "Server error" });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

