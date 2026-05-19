// server.js - Main entry point for AI-Based Smart Complaint Management System
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { errorHandler } = require("./middleware/errorMiddleware");

// Load environment variables
dotenv.config();

const app = express();

// ─── CORS Configuration ───────────────────────────────────────
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false,
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// ─── Middleware ───────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ──────────────────────────────────────────────────
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/complaints", require("./routes/complaintRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));

// ─── Root Health Check ────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    message: "AI-Based Smart Complaint Management System API",
    status: "Running",
    version: "1.0.0",
    db: mongoose.connection.readyState === 1 ? "Connected" : "Connecting...",
  });
});

// ─── Error Middleware ─────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server FIRST, then connect MongoDB ─────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ─── MongoDB Connection (non-blocking) ───────────────────────
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI not set in environment variables");
} else {
  mongoose
    .connect(MONGO_URI, {
      dbName: "complaintDB",
    })
    .then(() => {
      console.log("✅ MongoDB Connected Successfully");
    })
    .catch((err) => {
      console.error("❌ MongoDB Connection Failed:", err.message);
      // Don't exit — server keeps running so Render doesn't mark it as crashed
    });
}
