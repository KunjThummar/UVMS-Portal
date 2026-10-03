const Event = require('../models/event.model');
const Student = require('../models/student.model');
const VolunteerApplication = require('../models/volunteerapplication.model');
const ApiError = require('../utils/ApiError');

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function calculateAcademicYear(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = d.getMonth();
  const startYear = month >= 6 ? year : year - 1;
  const endYearShort = String(startYear + 1).slice(-2);
  return `${startYear}-${endYearShort}`;
}

function calculateEventDay(startDate, endDate) {
  if (!startDate || !endDate) return 1;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const msPerDay = 1000 * 60 * 60 * 24;
  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  const diff = Math.round((endUtc - startUtc) / msPerDay) + 1;
  return Math.max(1, diff);
}

function isStudentEligibleForEvent(student, event) {
  const studentInstId = (student.instituteId?._id || student.instituteId)?.toString();
  const studentDeptId = (student.departmentId?._id || student.departmentId)?.toString();

  switch (event.eventLevel) {
    case 'University':
      return true;

    case 'Institute': {
      const matchesInstitute = (
        !!studentInstId &&
        Array.isArray(event.targetInstituteIds) &&
        event.targetInstituteIds.some(
          (instId) => (instId?._id || instId)?.toString() === studentInstId
        )
      );
      if (!matchesInstitute) return false;

      if (Array.isArray(event.targetDepartmentIds) && event.targetDepartmentIds.length > 0) {
        return (
          !!studentDeptId &&
          event.targetDepartmentIds.some(
            (deptId) => (deptId?._id || deptId)?.toString() === studentDeptId
          )
        );
      }
      return true;
    }

    case 'Department':
      return (
        !!studentDeptId &&
        Array.isArray(event.targetDepartmentIds) &&
        event.targetDepartmentIds.some(
          (deptId) => (deptId?._id || deptId)?.toString() === studentDeptId
        )
      );
  }
}

async function getEligibleEventsForStudent(student, filters = {}) {
  const eligibilityOr = [
    { eventLevel: 'University' },
    {
      eventLevel: 'Institute',
      targetInstituteIds: student.instituteId,
      $or: [
        { targetDepartmentIds: { $exists: false } },
        { targetDepartmentIds: { $size: 0 } },
        { targetDepartmentIds: student.departmentId }
      ]
    },
    {
      eventLevel: 'Department',
      targetDepartmentIds: student.departmentId
    }
  ];

  const andConditions = [{ $or: eligibilityOr }];

  // Status filter
  if (filters.status) {
    andConditions.push({ status: filters.status });
  }

  // Academic Year filter
  if (filters.academicYear) {
    andConditions.push({ academicYear: filters.academicYear });
  }

  // Event Type filter
  if (filters.eventType) {
    andConditions.push({ eventType: filters.eventType });
  }

  // Event Mode filter
  if (filters.eventMode) {
    andConditions.push({ eventMode: filters.eventMode.toLowerCase() });
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
    andConditions.push({ eventDate: eventDateFilters });
  }

  // Search filter
  if (filters.search) {
    const searchRegex = new RegExp(escapeRegex(filters.search), 'i');
    andConditions.push({
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { organizer: searchRegex },
        { subOrganizer: searchRegex }
      ]
    });
  }

  // Archived filter
  if (!filters.includeArchived) {
    andConditions.push({ isArchived: false });
  }

  const query = { $and: andConditions };

  try {
    const events = await Event.find(query)
      .populate('createdBy', 'fullName email')
      .populate('targetInstituteIds', 'code name')
      .populate('targetDepartmentIds', 'code name instituteId')
      .sort({ eventDate: 1 });

    return events;
  } catch (error) {
    throw new ApiError(500, 'Failed to fetch eligible events: ' + error.message);
  }
}

async function getEventById(eventId) {
  const event = await Event.findById(eventId)
    .populate('createdBy', 'fullName email')
    .populate('targetInstituteIds', 'code name')
    .populate('targetDepartmentIds', 'code name instituteId');

  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  return event;
}

const getFacultyEventById = getEventById;

async function getEventForStudent(eventId, studentId) {
  const event = await getEventById(eventId);
  const student = await Student.findById(studentId);

  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  if (!student) {
    throw new ApiError(404, 'Student not found');
  }

  const eligible = isStudentEligibleForEvent(student, event);

  if (!eligible) {
    throw new ApiError(403, 'You are not eligible for this event');
  }

  return event;
}

async function getAllEventsForFacultyOrAdmin(filters = {}) {
  const query = {};

  const level = filters.level || filters.eventLevel;
  if (level) {
    query.eventLevel = level;
  }

  if (filters.status && typeof filters.status === 'string') {
    const s = filters.status.trim().toLowerCase();
    if (s !== '' && s !== 'all') {
      if (s === 'closed') {
        query.status = { $in: ['ApplicationClosed', 'Completed'] };
      } else if (s === 'applicationclosed') {
        query.status = 'ApplicationClosed';
      } else if (s === 'open') {
        query.status = 'Open';
      } else if (s === 'completed') {
        query.status = 'Completed';
      } else {
        query.status = filters.status;
      }
    }
  }

  if (filters.isArchived) {
    query.isArchived = true;
  }

  if (filters.academicYear) {
    query.academicYear = filters.academicYear;
  }

  if (filters.eventType) {
    query.eventType = filters.eventType;
  }

  if (filters.eventMode) {
    query.eventMode = filters.eventMode.toLowerCase();
  }

  if (filters.organizer) {
    query.organizer = new RegExp(escapeRegex(filters.organizer), 'i');
  }

  if (filters.institute) {
    query.targetInstituteIds = filters.institute;
  }

  if (filters.department) {
    query.targetDepartmentIds = filters.department;
  }

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

  if (filters.search) {
    const searchRegex = new RegExp(escapeRegex(filters.search), 'i');
    query.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { organizer: searchRegex },
      { subOrganizer: searchRegex }
    ];
  }

  try {
    const events = await Event.find(query)
      .populate('createdBy', 'fullName email')
      .populate('targetInstituteIds', 'code name')
      .populate('targetDepartmentIds', 'code name instituteId')
      .sort({ eventDate: 1 });
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
    eventEndDate,
    academicYear,
    organizer,
    subOrganizer,
    eventType,
    eventMode,
    applicationDeadline,
    volunteerCapacity,
    eventLevel,
    targetInstituteIds,
    targetDepartmentIds
  } = data;

  const date = new Date(eventDate);
  const endDate = new Date(eventEndDate);
  const deadline = new Date(applicationDeadline);

  if (deadline >= date) {
    throw new ApiError(400, 'applicationDeadline must be before eventDate');
  }

  if (endDate < date) {
    throw new ApiError(400, 'eventEndDate must be greater than or equal to eventDate');
  }

  const computedAcademicYear = academicYear || calculateAcademicYear(date);
  const computedEventDay = calculateEventDay(date, endDate);

  try {
    const event = new Event({
      title,
      description,
      eventDate: date,
      eventEndDate: endDate,
      academicYear: computedAcademicYear,
      organizer,
      subOrganizer: subOrganizer || '',
      eventType,
      eventMode: eventMode ? eventMode.toLowerCase() : 'offline',
      eventDay: computedEventDay,
      applicationDeadline: deadline,
      volunteerCapacity,
      eventLevel,
      targetInstituteIds: (eventLevel === 'Institute' || eventLevel === 'Department') ? (targetInstituteIds || []) : [],
      targetDepartmentIds: eventLevel === 'Department' ? (targetDepartmentIds || []) : [],
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
    const creatorId = (event.createdBy?._id || event.createdBy).toString();
    if (creatorId !== actorId.toString()) {
      throw new ApiError(403, 'You are not authorized to update this event');
    }
  }

  const {
    title,
    description,
    eventDate,
    eventEndDate,
    academicYear,
    organizer,
    subOrganizer,
    eventType,
    eventMode,
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

  if (eventDate !== undefined) {
    event.eventDate = new Date(eventDate);
    event.academicYear = calculateAcademicYear(event.eventDate);
  }
  if (eventEndDate !== undefined) {
    event.eventEndDate = new Date(eventEndDate);
  }
  if (eventDate !== undefined || eventEndDate !== undefined) {
    event.eventDay = calculateEventDay(event.eventDate, event.eventEndDate);
  }

  if (academicYear !== undefined) event.academicYear = academicYear;
  if (organizer !== undefined) event.organizer = organizer;
  if (subOrganizer !== undefined) event.subOrganizer = subOrganizer;
  if (eventType !== undefined) event.eventType = eventType;
  if (eventMode !== undefined) event.eventMode = eventMode.toLowerCase();

  if (applicationDeadline !== undefined) event.applicationDeadline = new Date(applicationDeadline);
  if (volunteerCapacity !== undefined) event.volunteerCapacity = volunteerCapacity;
  if (eventLevel !== undefined) {
    event.eventLevel = eventLevel;
    if (eventLevel === 'University') {
      event.targetInstituteIds = [];
      event.targetDepartmentIds = [];
    } else if (eventLevel === 'Institute') {
      event.targetDepartmentIds = [];
    }
  }
  if (targetInstituteIds !== undefined) {
    event.targetInstituteIds = (event.eventLevel === 'Institute' || event.eventLevel === 'Department') ? targetInstituteIds : [];
  }
  if (targetDepartmentIds !== undefined) {
    event.targetDepartmentIds = event.eventLevel === 'Department' ? targetDepartmentIds : [];
  }
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
    const creatorId = (event.createdBy?._id || event.createdBy).toString();
    if (actorId.toString() !== creatorId) {
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
    const creatorId = (event.createdBy?._id || event.createdBy).toString();
    if (actorId.toString() !== creatorId) {
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

  // Check against eventEndDate (or eventDate if end date missing)
  const finalDate = event.eventEndDate || event.eventDate;
  const eventPassed = finalDate < new Date();

  if (!eventPassed) {
    return event;
  }

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

async function hardDelete(id) {
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