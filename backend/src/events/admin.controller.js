const eventService = require('../events/event.service');
const applicationService = require('../applications/application.service');
const {validateCreateEvent , validateUpdateEvent} = require('../events/event.validation');

async function getAllEvents(req, res) {
  const filters = req.query;

  try {
    const events = await eventService.getAllEventsForFacultyOrAdmin(filters);
    return res.status(200).json({ success: true, data: events });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: error.message });
  }
}

async function getEventById(req, res) {
  try {
    const event = await eventService.getEventById(req.params.id);
    return res.status(200).json({ success: true, data: event });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: error.message });
  }
}

async function updateEvent(req, res) {
  const { isValid, errors } = validateUpdateEvent(req.body);

  if (!isValid) {
    return res.status(400).json({ success: false, errors });
  }

  try {
    const event = await eventService.updateEvent(req.params.id, req.body, req.user.id, 'admin');
    return res.status(200).json({ success: true, data: event });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: error.message });
  }
}

async function archiveEvent(req, res) {
  try {
    const event = await eventService.archiveEvent(req.params.id, req.user.id, 'admin');
    return res.status(200).json({ success: true, data: event });
  } catch (error) {
    const statusCode = erorr.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: error.message });
  }
}

async function getAllApplications(req, res) {
  try {
    const { status, eventId, studentId } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (eventId) filters.eventId = eventId;
    if (studentId) filters.studentId = studentId;

    const applications = await applicationService.getAll(filters);

    return res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch applications",
    });
  }
}

async function deleteEvent(req, res) {
  try {
    const { id } = req.params;

    // ADMIN-ONLY override — faculty can never hard-delete, only archive
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can permanently delete events. Faculty should archive instead.",
      });
    }

    const deletedEvent = await eventService.hardDelete(id);

    if (!deletedEvent) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Event permanently deleted",
      data: deletedEvent,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete event",
    });
  }
}

module.exports = {
    getAllEvents,
    getEventById,
    updateEvent,
    archiveEvent,
    getAllApplications,
    deleteEvent
};