const eventService = require('../events/event.service');
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

async function createEvent(req, res) {
  const { isValid, errors } = validateCreateEvent(req.body);

  if (!isValid) {
    return res.status(400).json({ success: false, errors });
  }

  try {
    const event = await eventService.createEvent(req.body, req.user.id);
    return res.status(201).json({ success: true, data: event });
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
    const event = await eventService.updateEvent(req.params.id, req.body, req.user.id, 'faculty');
    return res.status(200).json({ success: true, data: event });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: error.message });
  }
}

async function reopenEvent(req, res) {
  try {
    const event = await eventService.reopenEvent(req.params.id, req.user.id, 'faculty');
    return res.status(200).json({ success: true, data: event });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: error.message });
  }
}

async function archiveEvent(req, res) {
  try {
    const event = await eventService.archiveEvent(req.params.id, req.user.id, 'faculty');
    return res.status(200).json({ success: true, data: event });
  } catch (error) {
    const statusCode = erorr.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: error.message });
  }
}


module.exports = { getAllEvents , getEventById  , createEvent , updateEvent , reopenEvent , archiveEvent};