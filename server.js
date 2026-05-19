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
  origin: "*", // Allow all origins (frontend on Render, localhost, etc.)
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false,
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Handle preflight requests

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
  });
});

// ─── Error Middleware ─────────────────────────────────────────
app.use(errorHandler);

// ─── MongoDB Connection ───────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  });
