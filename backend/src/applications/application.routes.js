const express = require("express");

const router = express.Router();

const applicationController = require("./application.controller");

const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

// ======================================
// Faculty Routes
// ======================================

router.patch("/:id/approve", authenticate, authorize("faculty"), applicationController.approveApplication);
router.patch("/:id/reject", authenticate, authorize("faculty"), applicationController.rejectApplication);

// Get applications for an event
router.get("/event/:eventId", authenticate, authorize("faculty"), applicationController.getByEvent);

// ======================================
// Admin Routes
// ======================================

// Get all applications
router.get("/", authenticate, authorize("admin"), applicationController.getAll);

module.exports = router;