// routes/authRoutes.js - Authentication Routes (Q6 - Auth & Security)
const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

/**
 * Auth API Endpoints:
 * POST /api/auth/register   → Register new user
 * POST /api/auth/login      → Login and get JWT token
 * GET  /api/auth/profile    → Get logged-in user profile (Protected)
 */

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);

module.exports = router;
