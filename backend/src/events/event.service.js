const Event = require('../models/event.model');
const Student = require('../models/student.model');
const VolunteerApplication = require('../models/volunteerApplication.model');
const ApiError = require('../utils/ApiError');

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function isStudentEligibleForEvent(student, event) {
  switch (event.eventLevel) {
    case 'University':
      return true;

    case 'Institute':
      return (!!student.instituteId &&
        Array.isArray(event.targetInstituteIds) &&
        event.targetInstituteIds.some(
          (instId) => instId.toString() === student.instituteId.toString()
        )
      );

    case 'Department':
      return (!!student.departmentId &&
        Array.isArray(event.targetDepartmentIds) &&
        event.targetDepartmentIds.some(
          (deptId) => deptId.toString() === student.departmentId.toString()
        )
      );
  }
}

async function getEligibleEventsForStudent(student, filters = {}) {

  const eligibilityOr = [
    { eventLevel: 'University' },
    {
      eventLevel: 'Institute',
      targetInstituteIds: student.instituteId
    },
    {
      eventLevel: 'Department',
      targetDepartmentIds: student.departmentId
    }
  ];

  const andConditions = [{ $or: eligibilityOr }];

  // Status filter
  if (filters.status) {
    andConditions.push({
      status: filters.status
    });
  }

  // Date filter
   if (filters.dateFrom || filters.dateTo) {
    const eventDateFilters = {};

    if (filters.dateFrom) {
      eventDateFilters.$gte = new Date(filters.dateFrom);
    }

    if (filters.dateTo) {
      const endDate = new Date(filters.dateTo);
      endDate.setDate(endDate.getDate() + 1);

      eventDateFilters.$lt = endDate;
    }

    andConditions.push({
      eventDate: eventDateFilters,
    });
  }

  // Search filter
  if (filters.search) {
    const searchRegex = new RegExp(escapeRegex(filters.search), 'i');

    andConditions.push({
      $or: [
        { title: searchRegex },
        { description: searchRegex }
      ]
    });
  }

  // Archived filter
  if (!filters.includeArchived) {
    andConditions.push({
      isArchived: false
    });
  }

  const query = {
    $and: andConditions
  };

  try {
    const events = await Event.find(query)
      .sort({ eventDate: 1 });

    return events;

  } catch (error) {
    throw new ApiError(500, 'Failed to fetch eligible events: ' + error.message);
  }
}

async function getEventForStudent(eventId, studentId) {
  const event = await Event.findById(eventId);
  const student = await Student.findById(studentId);
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  const eligible = isStudentEligibleForEvent(student, event);

  if (!eligible) {
    throw new ApiError(403, 'You are not eligible for this event');
  }

  return event;
}

async function getAllEventsForFacultyOrAdmin(filters = {}) {
  const query = {};

  // --- eventLevel filter ---
  if (filters.level) {
    query.eventLevel = filters.level;
  }

  // --- status filter ---
  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.isArchived) {
    query.isArchived = true;
  }

  // --- institute filter (matches events targeting this institute) ---
  if (filters.institute) {
    query.targetInstituteIds = filters.institute;
  }

  // --- department filter (matches events targeting this department) ---
  if (filters.department) {
    query.targetDepartmentIds = filters.department;
  }

  // --- date filter (single date OR range, on eventDate) ---
  if (filters.date) {
    const dayStart = new Date(filters.date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    query.eventDate = { $gte: dayStart, $lt: dayEnd };
  } else if (filters.startDate || filters.endDate) {
    const eventDateFilter = {};
    if (filters.startDate) {
      eventDateFilter.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      eventDateFilter.$lte = new Date(filters.endDate);
    }
    query.eventDate = eventDateFilter;
  }

  // --- search text (title or description, case-insensitive) ---
  if (filters.search) {
    const searchRegex = new RegExp(filters.search, 'i');
    query.$or = [{ title: searchRegex }, { description: searchRegex }];
  }

  try {
    const events = await Event.find(query).sort({ eventDate: 1 });
    return events;
  } catch (error) {
    throw new ApiError(500, 'Failed to fetch events: ' + error.message);
  }
}

async function createEvent(data, facultyId) {
  const {
    title,
    description,
    eventDate,
    applicationDeadline,
    volunteerCapacity,
    eventLevel,
    targetInstituteIds,
    targetDepartmentIds
  } = data;

  // applicationDeadline must be before eventDate
  const deadline = new Date(applicationDeadline);
  const date = new Date(eventDate);

  if (deadline >= date) {
    throw new ApiError(400, 'applicationDeadline must be before eventDate');
  }

  try {
    const event = new Event({
      title,
      description,
      eventDate: date,
      applicationDeadline: deadline,
      volunteerCapacity,
      eventLevel,
      targetInstituteIds: eventLevel === 'Institute' ? targetInstituteIds : [],
      targetDepartmentIds: eventLevel === 'Department' ? targetDepartmentIds : [],
      createdBy: facultyId
    });

    return await event.save();
  } catch (error) {
    throw new ApiError(500, 'Failed to create event: ' + error.message);
  }
}

async function updateEvent(eventId, data, actorId, actorRole) {
  const event = await Event.findById(eventId);

  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  if (actorRole.toString() === 'faculty') {
    if (event.createdBy.toString() !== actorId.toString()) {
      throw new ApiError(403, 'You are not authorized to update this event');
    }
  }
  // Admin: no ownership check — can update any event

  const {
    title,
    description,
    eventDate,
    applicationDeadline,
    volunteerCapacity,
    eventLevel,
    targetInstituteIds,
    targetDepartmentIds,
    status,
    isArchived
  } = data;

  if (title !== undefined) event.title = title;
  if (description !== undefined) event.description = description;
  if (eventDate !== undefined) event.eventDate = new Date(eventDate);
  if (applicationDeadline !== undefined) event.applicationDeadline = new Date(applicationDeadline);
  if (volunteerCapacity !== undefined) event.volunteerCapacity = volunteerCapacity;
  if (eventLevel !== undefined) event.eventLevel = eventLevel;
  if (targetInstituteIds !== undefined) event.targetInstituteIds = targetInstituteIds;
  if (targetDepartmentIds !== undefined) event.targetDepartmentIds = targetDepartmentIds;
  if (status !== undefined) event.status = status;
  if (isArchived !== undefined) event.isArchived = isArchived;

  try {
    return await event.save();
  } catch (error) {
    throw new ApiError(500, 'Failed to update event: ' + error.message);
  }
}

async function reopenEvent(eventId, actorId, actorRole) {
  const event = await Event.findById(eventId);

  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  if (actorRole.toString() === 'faculty') {
    if (actorId.toString() !== event.createdBy.toString()) {
      throw new ApiError(403, 'You are not authorized to reopen this event');
    }
  }

  if (event.applicationDeadline < new Date()) {
    throw new ApiError(400, 'Cannot reopen: application deadline has already passed');
  }

  if (event.approvedCount >= event.volunteerCapacity) {
    throw new ApiError(400, 'Cannot reopen: volunteer capacity already reached');
  }

  event.status = 'Open';

  try {
    return await event.save();
  } catch (error) {
    throw new ApiError(500, 'Failed to reopen the event: ' + error.message);
  }
}

async function archiveEvent(eventId, actorId, actorRole) {

  const event = await Event.findById(eventId);

  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  if (actorRole.toString() === 'faculty') {
    if (actorId.toString() !== event.createdBy.toString()) {
      throw new ApiError(403, 'You are not authorized to archive this event');
    }
  }

  event.isArchived = true;

  try {
    return await event.save();
  } catch (error) {
    throw new ApiError(500, 'Failed to archive event: ' + error.message);
  }
}

async function checkAndCloseIfDeadlinePassed(eventId) {
  const event = await Event.findById(eventId);

  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  const deadlinePassed = event.applicationDeadline < new Date();

  if (!deadlinePassed) {
    return event;
  }

  if (event.status !== 'Open') {
    return event;
  }

  event.status = 'ApplicationClosed';

  try {
    await event.save();

    await VolunteerApplication.updateMany(
      { eventId: event._id, status: 'Pending' },
      {
        $set: {
          status: 'Rejected',
          decisionReason: 'auto-rejected: deadline passed'
        }
      }
    );

    return event;
  } catch (error) {
    throw new ApiError(500, 'Failed to close event on deadline: ' + error.message);
  }
}

async function checkAndCloseIfFull(eventId) {
  const event = await Event.findById(eventId);

  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  const isFull = event.approvedCount >= event.volunteerCapacity;

  if (!isFull) {
    return event;
  }

  // Only 'Open' events should transition on capacity being reached.
  // 'ApplicationClosed' and 'Completed' are already terminal/later states.
  if (event.status !== 'Open') {
    return event;
  }

  event.status = 'ApplicationClosed'; // 'Full' folded into this, per updated enum

  try {
    await event.save();

    await VolunteerApplication.updateMany(
      { eventId: event._id, status: 'Pending' },
      {
        $set: {
          status: 'Rejected',
          decisionReason: 'auto-rejected: capacity reached'
        }
      }
    );

    return event;
  } catch (error) {
    throw new ApiError(500, 'Failed to close event on capacity reached: ' + error.message);
  }
}

async function markEventCompletedIfEventDatePassed(eventId) {
  const event = await Event.findById(eventId);

  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  const eventDatePassed = event.eventDate < new Date();

  if (!eventDatePassed) {
    return event;
  }

  // Only events that have already gone through ApplicationClosed
  // are eligible to complete — guarantees Pending apps were already
  // resolved on the way here.
  if (event.status !== 'ApplicationClosed') {
    return event;
  }

  event.status = 'Completed';

  try {
    return await event.save();
  } catch (err) {
    throw new ApiError(500, 'Failed to mark event completed: ' + err.message);
  }
}

async function getEventById(eventId) {
  const event = await Event.findById(eventId);

  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  return event;
}

async function hardDelete(id) {
  // Permanently removes the event and its DB row — irreversible.
  // Unlike archive(), this does not set a status flag; the record is gone.
  const deletedEvent = await Event.findByIdAndDelete(id);
  return deletedEvent;
}

module.exports = {
  isStudentEligibleForEvent,
  getAllEventsForFacultyOrAdmin,
  getEligibleEventsForStudent,
  getEventForStudent,
  createEvent,
  updateEvent,
  reopenEvent,
  archiveEvent,
  checkAndCloseIfDeadlinePassed,
  checkAndCloseIfFull,
  markEventCompletedIfEventDatePassed,
  getEventById,
  hardDelete
};


