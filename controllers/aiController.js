// controllers/aiController.js - AI Complaint Analyzer (Q5 - AI Integration)
const asyncHandler = require("express-async-handler");
const fetch = require("node-fetch");
const Complaint = require("../models/Complaint");

/**
 * @desc    Analyze complaint using OpenRouter AI API
 * @route   POST /api/ai/analyze
 * @access  Public
 *
 * AI Features:
 * 1. Complaint Priority Detection (High/Medium/Low)
 * 2. Department Recommendation
 * 3. Complaint Summary
 * 4. Auto-generated User Response
 *
 * Test Cases:
 * - Water leakage → Water department suggestion
 * - Electricity issue → High priority alert
 * - Garbage complaint → Sanitation department
 * - Long complaint text → AI-generated summary
 */

// ─── Smart rule-based fallback (works even without API) ───────────────
const getRuleBasedAnalysis = (title, description, category) => {
  const text = (title + " " + description).toLowerCase();

  let priority = "Medium";
  let priorityReason = "Standard service issue requiring attention";
  if (
    text.match(
      /urgent|emergency|danger|flood|fire|accident|injury|hazard|outage|cut off|no water|no electricity|sewage overflow/
    )
  ) {
    priority = "High";
    priorityReason =
      "Contains urgent keywords indicating immediate danger or critical service failure";
  } else if (
    text.match(/minor|small|suggest|feedback|recommend|inconvenience/)
  ) {
    priority = "Low";
    priorityReason =
      "Minor issue or suggestion that can be addressed in routine maintenance";
  }

  let department = "Municipal Authority";
  let departmentReason = "General municipal issue";
  if (
    category === "Water Supply" ||
    text.match(/water|pipe|leak|pipeline|supply|tap/)
  ) {
    department = "Water Supply Department";
    departmentReason = "Issue involves water supply infrastructure";
  } else if (
    category === "Electricity" ||
    text.match(/electricity|power|light|current|transformer|wire/)
  ) {
    department = "Electricity Department";
    departmentReason = "Issue involves electrical supply or infrastructure";
    if (text.match(/outage|cut|no power|no electricity/)) priority = "High";
  } else if (
    category === "Sanitation" ||
    text.match(/garbage|waste|trash|sewage|drain|smell|hygiene/)
  ) {
    department = "Sanitation Department";
    departmentReason = "Issue involves waste management or sanitation";
  } else if (
    category === "Roads" ||
    text.match(/road|pothole|street|traffic|pavement|highway/)
  ) {
    department = "Public Works Department";
    departmentReason = "Issue involves road or public infrastructure";
  } else if (
    category === "Public Safety" ||
    text.match(/safety|crime|theft|violence|security|police/)
  ) {
    department = "Public Safety Department";
    departmentReason = "Issue involves public safety and security";
  }

  return {
    priority,
    priorityReason,
    department,
    departmentReason,
    summary: `Complaint regarding ${category || "municipal services"}: ${description.substring(0, 120)}${description.length > 120 ? "..." : ""}`,
    autoResponse: `Thank you for submitting your complaint about "${title}". We have received your report and assigned it to the ${department} with ${priority} priority. Our team will respond within ${priority === "High" ? "24 hours" : priority === "Medium" ? "48-72 hours" : "5-7 business days"}. We appreciate your patience.`,
  };
};

const analyzeComplaint = asyncHandler(async (req, res) => {
  const { title, description, category, complaintId } = req.body;

  if (!title || !description) {
    res.status(400);
    throw new Error("Title and description are required for AI analysis");
  }

  // Build AI prompt
  const prompt = `You are an AI assistant for a Smart Complaint Management System. Analyze the following complaint and provide structured output.

Complaint Title: ${title}
Category: ${category || "Not specified"}
Description: ${description}

Respond ONLY in this JSON format (no extra text):
{
  "priority": "High" or "Medium" or "Low",
  "priorityReason": "Brief reason for this priority level",
  "department": "Recommended department name",
  "departmentReason": "Why this department should handle it",
  "summary": "A concise 1-2 sentence summary of the complaint",
  "autoResponse": "A professional, empathetic response message (2-3 sentences)"
}

Priority: High=immediate danger/outage, Medium=significant inconvenience, Low=minor issue
Departments: Water Supply Dept | Electricity Dept | Sanitation Dept | Public Works Dept | Public Safety Dept | Municipal Authority`;

  // ─── Multiple free models to try in sequence ──────────────────────
  const MODELS = [
    "qwen/qwen-2.5-7b-instruct:free",
    "google/gemma-2-9b-it:free",
    "microsoft/phi-3-mini-128k-instruct:free",
    "meta-llama/llama-3.2-3b-instruct:free",
    "deepseek/deepseek-chat-v3-0324:free",
  ];

  let analysis = null;

  for (const model of MODELS) {
    try {
      console.log(`🤖 Trying model: ${model}`);

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:5000",
            "X-Title": "AI Complaint Management System",
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content: prompt }],
            max_tokens: 600,
            temperature: 0.3,
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`⚠️ Model ${model} failed (${response.status}):`, errText.substring(0, 200));
        continue;
      }

      const aiData = await response.json();
      const rawContent = aiData.choices?.[0]?.message?.content?.trim();

      if (!rawContent) {
        console.warn(`⚠️ Model ${model} returned empty content`);
        continue;
      }

      try {
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
        analysis = JSON.parse(jsonMatch ? jsonMatch[0] : rawContent);
        console.log(`✅ Success with model: ${model}`);
        break;
      } catch (parseErr) {
        console.warn(`⚠️ Model ${model} JSON parse failed`);
        continue;
      }
    } catch (fetchErr) {
      console.warn(`⚠️ Model ${model} fetch error:`, fetchErr.message);
      continue;
    }
  }

  // ─── All models failed → use smart rule-based fallback ────────────
  if (!analysis) {
    console.log("ℹ️ All AI models failed. Using rule-based fallback.");
    analysis = getRuleBasedAnalysis(title, description, category);
  }

  // ─── Save analysis to complaint if ID provided ────────────────────
  if (complaintId) {
    await Complaint.findByIdAndUpdate(complaintId, {
      aiAnalysis: {
        priority: analysis.priority,
        department: analysis.department,
        summary: analysis.summary,
        autoResponse: analysis.autoResponse,
      },
    });
  }

  res.status(200).json({
    success: true,
    message: "AI analysis completed successfully",
    data: { title, category, analysis },
  });
});

/**
 * @desc    Get stored AI analysis for a complaint
 * @route   GET /api/ai/analysis/:id
 * @access  Public
 */
const getComplaintAnalysis = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    res.status(404);
    throw new Error("Complaint not found");
  }

  if (!complaint.aiAnalysis || !complaint.aiAnalysis.priority) {
    res.status(404);
    throw new Error("No AI analysis found. Please run analysis first.");
  }

  res.status(200).json({
    success: true,
    data: {
      complaint: {
        title: complaint.title,
        category: complaint.category,
        description: complaint.description,
      },
      analysis: complaint.aiAnalysis,
    },
  });
});

module.exports = { analyzeComplaint, getComplaintAnalysis };
