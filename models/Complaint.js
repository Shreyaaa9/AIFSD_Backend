// models/Complaint.js - MongoDB Schema for Complaint (Q3 - MongoDB Schema)
const mongoose = require("mongoose");

/**
 * Complaint Schema
 * Fields: name, email, title, description, category, location, status, createdAt
 * Includes validation, defaults, and query filtering support
 */
const ComplaintSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide your name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    title: {
      type: String,
      required: [true, "Complaint title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Complaint description is required"],
    },
    category: {
      type: String,
      required: [true, "Complaint category is required"],
      enum: [
        "Water Supply",
        "Electricity",
        "Sanitation",
        "Roads",
        "Public Safety",
        "Noise",
        "Other",
      ],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved", "Closed"],
      default: "Pending",
    },
    // AI Analysis fields stored with complaint
    aiAnalysis: {
      priority: { type: String, default: null },
      department: { type: String, default: null },
      summary: { type: String, default: null },
      autoResponse: { type: String, default: null },
    },
    // Reference to user who submitted (optional, for authenticated users)
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// Index for fast location-based search (Q2 - Search by location)
ComplaintSchema.index({ location: "text", title: "text" });

module.exports = mongoose.model("Complaint", ComplaintSchema);
