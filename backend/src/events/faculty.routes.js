const express = require('express');
const router = express.Router();

const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  reopenEvent,
  archiveEvent
  // notifyStudents  -- not yet implemented
} = require('../events/faculty.controller');

const {
  getApplicationsForEvent,
  approveApplication,
  rejectApplication,
  notifyStudents
} = require('../events/faculty.controller');

const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use(authenticate, authorize('faculty'));

router.get('/events', getAllEvents);
router.get('/events/:id', getEventById);
router.post('/events', createEvent);
router.put('/events/:id', updateEvent);
router.patch('/events/:id/reopen', reopenEvent);
router.patch('/events/:id/archive', archiveEvent);
router.post('/events/:id/notify', notifyStudents);
router.get('/events/:id/applications', getApplicationsForEvent);
router.patch('/applications/:id/approve', approveApplication);
router.patch('/applications/:id/reject', rejectApplication);

module.exports = router;