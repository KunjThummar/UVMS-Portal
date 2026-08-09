const express = require("express");

const router = express.Router();

const studentController = require("./student.controller");

const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

// ======================================
// All Student Routes
// ======================================

// Student Profile
router.get("/profile", authenticate, authorize("student"), studentController.getProfile);

// Eligible Events
router.get("/events", authenticate, authorize("student"), studentController.getEligibleEvents);

// Event Details
router.get("/events/:id", authenticate, authorize("student"), studentController.getEventById);

// Apply To Event
router.post("/events/:id/apply", authenticate, authorize("student"), studentController.applyToEvent);

// My Applications
router.get("/applications", authenticate, authorize("student"), studentController.getMyApplications);

module.exports = router;