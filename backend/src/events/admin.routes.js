const express = require("express");
const router = express.Router();

const {
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  archiveEvent,
  getAllApplications
} = require("../events/admin.controller");


const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// All routes below require authentication + admin role
router.use(authenticate, authorize('admin'));

router.get("/events", getAllEvents);
router.get("/events/:id", getEventById);
router.put("/events/:id", updateEvent);
router.delete("/events/:id", deleteEvent);
router.patch("/events/:id/archive", archiveEvent);
router.get("/applications", getAllApplications);

module.exports = router;