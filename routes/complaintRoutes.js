// routes/complaintRoutes.js - Complaint API Routes (Q2 - Backend)
const express = require("express");
const router = express.Router();
const {
  addComplaint,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
  deleteComplaint,
  searchByLocation,
} = require("../controllers/complaintController");

/**
 * Complaint API Endpoints:
 * POST   /api/complaints           → Add complaint
 * GET    /api/complaints           → Get all complaints (filter by category/status)
 * GET    /api/complaints/search    → Search by location
 * GET    /api/complaints/:id       → Get single complaint
 * PUT    /api/complaints/:id       → Update complaint status
 * DELETE /api/complaints/:id       → Delete complaint
 */

// Search route must come BEFORE /:id to avoid conflict
router.get("/search", searchByLocation);

router.route("/").get(getAllComplaints).post(addComplaint);

router
  .route("/:id")
  .get(getComplaintById)
  .put(updateComplaintStatus)
  .delete(deleteComplaint);

module.exports = router;
