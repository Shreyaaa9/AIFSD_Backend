// controllers/complaintController.js - Complaint CRUD Controller (Q2 - Backend)
const asyncHandler = require("express-async-handler");
const Complaint = require("../models/Complaint");

/**
 * @desc    Add a new complaint
 * @route   POST /api/complaints
 * @access  Public
 * Test Case: Add valid complaint → "Complaint stored successfully"
 * Test Case: Missing title field → "Validation error"
 */
const addComplaint = asyncHandler(async (req, res) => {
  const { name, email, title, description, category, location } = req.body;

  // Validation - title is required
  if (!title) {
    res.status(400);
    throw new Error("Validation error: Complaint title is required");
  }

  // Email format validation
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (email && !emailRegex.test(email)) {
    res.status(400);
    throw new Error("Invalid email format");
  }

  const complaint = await Complaint.create({
    name,
    email,
    title,
    description,
    category,
    location,
    submittedBy: req.user ? req.user._id : null,
  });

  res.status(201).json({
    success: true,
    message: "Complaint stored successfully",
    data: complaint,
  });
});

/**
 * @desc    Get all complaints
 * @route   GET /api/complaints
 * @access  Public
 * Supports filter by category: ?category=Water Supply
 * Test Case: Fetch complaints → "Complaints displayed"
 */
const getAllComplaints = asyncHandler(async (req, res) => {
  const { category, status } = req.query;

  // Build dynamic filter
  const filter = {};
  if (category) filter.category = category;
  if (status) filter.status = status;

  const complaints = await Complaint.find(filter).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: complaints.length,
    data: complaints,
  });
});

/**
 * @desc    Get single complaint by ID
 * @route   GET /api/complaints/:id
 * @access  Public
 */
const getComplaintById = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    res.status(404);
    throw new Error("Complaint not found");
  }

  res.status(200).json({ success: true, data: complaint });
});

/**
 * @desc    Update complaint status
 * @route   PUT /api/complaints/:id
 * @access  Public
 * Test Case: Update complaint status → "Updated status shown"
 */
const updateComplaintStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const validStatuses = ["Pending", "In Progress", "Resolved", "Closed"];
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error(
      `Invalid status. Must be one of: ${validStatuses.join(", ")}`
    );
  }

  const complaint = await Complaint.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!complaint) {
    res.status(404);
    throw new Error("Complaint not found");
  }

  res.status(200).json({
    success: true,
    message: "Complaint status updated successfully",
    data: complaint,
  });
});

/**
 * @desc    Delete a complaint
 * @route   DELETE /api/complaints/:id
 * @access  Public
 * Test Case: Delete complaint → "Complaint removed"
 */
const deleteComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findByIdAndDelete(req.params.id);

  if (!complaint) {
    res.status(404);
    throw new Error("Complaint not found");
  }

  res.status(200).json({
    success: true,
    message: "Complaint removed successfully",
  });
});

/**
 * @desc    Search complaints by location
 * @route   GET /api/complaints/search?location=Ghaziabad
 * @access  Public
 * Test Case: Filter by location → "Matching complaints displayed"
 */
const searchByLocation = asyncHandler(async (req, res) => {
  const { location } = req.query;

  if (!location) {
    res.status(400);
    throw new Error("Please provide a location to search");
  }

  // Case-insensitive partial match
  const complaints = await Complaint.find({
    location: { $regex: location, $options: "i" },
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: complaints.length,
    message:
      complaints.length > 0
        ? "Matching complaints displayed"
        : "No complaints found for this location",
    data: complaints,
  });
});

module.exports = {
  addComplaint,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
  deleteComplaint,
  searchByLocation,
};
