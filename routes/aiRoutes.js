// routes/aiRoutes.js - AI API Routes (Q5 - AI Integration)
const express = require("express");
const router = express.Router();
const {
  analyzeComplaint,
  getComplaintAnalysis,
} = require("../controllers/aiController");

/**
 * AI API Endpoints:
 * POST /api/ai/analyze         → Analyze a complaint using AI
 * GET  /api/ai/analysis/:id    → Get stored AI analysis for a complaint
 */

router.post("/analyze", analyzeComplaint);
router.get("/analysis/:id", getComplaintAnalysis);

module.exports = router;
