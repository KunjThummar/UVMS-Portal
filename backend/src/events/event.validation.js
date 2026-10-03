const mongoose = require('mongoose');

const VALID_EVENT_TYPES = ['Seminar', 'Workshop', 'NSS', 'Hackathon', 'Hackthon', 'Expert Lecture'];
const VALID_EVENT_MODES = ['offline', 'online'];
const ACADEMIC_YEAR_REGEX = /^\d{4}-\d{2}$/;

function validateCreateEvent(data) {
  const errors = [];
  const now = new Date();

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

  // --- title ---
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push('title is required and must be a non-empty string');
  }

  // --- description ---
  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    errors.push('description is required and must be a non-empty string');
  }

  // --- eventDate (start date) ---
  let parsedEventDate = null;
  if (!eventDate || isNaN(Date.parse(eventDate))) {
    errors.push('eventDate is required and must be a valid date');
  } else {
    parsedEventDate = new Date(eventDate);
    if (parsedEventDate <= now) {
      errors.push('eventDate must be in the future');
    }
  }

  // --- eventEndDate ---
  let parsedEndDate = null;
  if (!eventEndDate || isNaN(Date.parse(eventEndDate))) {
    errors.push('eventEndDate is required and must be a valid date');
  } else {
    parsedEndDate = new Date(eventEndDate);
    if (parsedEndDate <= now) {
      errors.push('eventEndDate must be in the future');
    }
  }

  // eventEndDate must be on or after eventDate
  if (parsedEventDate && parsedEndDate && parsedEndDate < parsedEventDate) {
    errors.push('eventEndDate must be greater than or equal to eventDate');
  }

  // --- applicationDeadline ---
  let parsedDeadline = null;
  if (!applicationDeadline || isNaN(Date.parse(applicationDeadline))) {
    errors.push('applicationDeadline is required and must be a valid date');
  } else {
    parsedDeadline = new Date(applicationDeadline);
    if (parsedDeadline <= now) {
      errors.push('applicationDeadline must be in the future');
    }
  }

  if (parsedEventDate && parsedDeadline && parsedDeadline >= parsedEventDate) {
    errors.push('applicationDeadline must be before eventDate');
  }

  // --- organizer (Institute name) ---
  if (!organizer || typeof organizer !== 'string' || organizer.trim().length === 0) {
    errors.push('organizer (institute name) is required and must be a non-empty string');
  }

  // --- subOrganizer (Department name, optional) ---
  if (subOrganizer !== undefined && subOrganizer !== null && typeof subOrganizer !== 'string') {
    errors.push('subOrganizer must be a string');
  }

  // --- eventType ---
  if (!eventType || !VALID_EVENT_TYPES.includes(eventType)) {
    errors.push(`eventType is required and must be one of: ${VALID_EVENT_TYPES.filter(t => t !== 'Hackthon').join(', ')}`);
  }

  // --- eventMode ---
  if (!eventMode || !VALID_EVENT_MODES.includes(eventMode.toString().toLowerCase())) {
    errors.push('eventMode is required and must be either "offline" or "online"');
  }

  // --- academicYear (optional in payload; auto-derived from eventDate if omitted) ---
  if (academicYear !== undefined && academicYear !== null) {
    if (typeof academicYear !== 'string' || !ACADEMIC_YEAR_REGEX.test(academicYear.trim())) {
      errors.push('academicYear must be in format YYYY-YY (e.g. 2025-26, 2026-27)');
    }
  }

  // --- volunteerCapacity ---
  if (
    volunteerCapacity === undefined ||
    volunteerCapacity === null ||
    typeof volunteerCapacity !== 'number' ||
    isNaN(volunteerCapacity) ||
    volunteerCapacity < 1
  ) {
    errors.push('volunteerCapacity is required and must be a number of at least 1');
  }

  // --- eventLevel ---
  const validLevels = ['University', 'Institute', 'Department'];
  if (!eventLevel || !validLevels.includes(eventLevel)) {
    errors.push('eventLevel is required and must be one of: University, Institute, Department');
  }

  // --- conditional target arrays based on eventLevel ---
  if (eventLevel === 'Institute') {
    if (!Array.isArray(targetInstituteIds) || targetInstituteIds.length === 0) {
      errors.push('targetInstituteIds is required and must be a non-empty array when eventLevel is Institute');
    } else {
      const allValid = targetInstituteIds.every((id) => mongoose.Types.ObjectId.isValid(id));
      if (!allValid) {
        errors.push('targetInstituteIds must contain only valid Mongo ObjectIds');
      }
    }
    if (targetDepartmentIds !== undefined && targetDepartmentIds !== null) {
      if (!Array.isArray(targetDepartmentIds)) {
        errors.push('targetDepartmentIds must be an array of Mongo ObjectIds if provided');
      } else {
        const allValid = targetDepartmentIds.every((id) => mongoose.Types.ObjectId.isValid(id));
        if (!allValid) {
          errors.push('targetDepartmentIds must contain only valid Mongo ObjectIds');
        }
      }
    }
  }

  if (eventLevel === 'Department') {
    if (targetInstituteIds !== undefined && targetInstituteIds !== null) {
      if (!Array.isArray(targetInstituteIds)) {
        errors.push('targetInstituteIds must be an array of Mongo ObjectIds if provided');
      } else {
        const allValid = targetInstituteIds.every((id) => mongoose.Types.ObjectId.isValid(id));
        if (!allValid) {
          errors.push('targetInstituteIds must contain only valid Mongo ObjectIds');
        }
      }
    }
    if (!Array.isArray(targetDepartmentIds) || targetDepartmentIds.length === 0) {
      errors.push('targetDepartmentIds is required and must be a non-empty array when eventLevel is Department');
    } else {
      const allValid = targetDepartmentIds.every((id) => mongoose.Types.ObjectId.isValid(id));
      if (!allValid) {
        errors.push('targetDepartmentIds must contain only valid Mongo ObjectIds');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

function validateUpdateEvent(data) {
  const errors = [];
  const now = new Date();

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

  // --- title (optional) ---
  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      errors.push('title must be a non-empty string');
    }
  }

  // --- description (optional) ---
  if (description !== undefined) {
    if (typeof description !== 'string' || description.trim().length === 0) {
      errors.push('description must be a non-empty string');
    }
  }

  // --- eventDate (optional) ---
  let parsedEventDate = null;
  if (eventDate !== undefined) {
    if (isNaN(Date.parse(eventDate))) {
      errors.push('eventDate must be a valid date');
    } else {
      parsedEventDate = new Date(eventDate);
      if (parsedEventDate <= now) {
        errors.push('eventDate must be in the future');
      }
    }
  }

  // --- eventEndDate (optional) ---
  let parsedEndDate = null;
  if (eventEndDate !== undefined) {
    if (isNaN(Date.parse(eventEndDate))) {
      errors.push('eventEndDate must be a valid date');
    } else {
      parsedEndDate = new Date(eventEndDate);
      if (parsedEndDate <= now) {
        errors.push('eventEndDate must be in the future');
      }
    }
  }

  if (parsedEventDate && parsedEndDate && parsedEndDate < parsedEventDate) {
    errors.push('eventEndDate must be greater than or equal to eventDate');
  }

  // --- applicationDeadline (optional) ---
  let parsedDeadline = null;
  if (applicationDeadline !== undefined) {
    if (isNaN(Date.parse(applicationDeadline))) {
      errors.push('applicationDeadline must be a valid date');
    } else {
      parsedDeadline = new Date(applicationDeadline);
      if (parsedDeadline <= now) {
        errors.push('applicationDeadline must be in the future');
      }
    }
  }

  if (parsedEventDate && parsedDeadline && parsedDeadline >= parsedEventDate) {
    errors.push('applicationDeadline must be before eventDate');
  }

  // --- organizer (optional) ---
  if (organizer !== undefined) {
    if (typeof organizer !== 'string' || organizer.trim().length === 0) {
      errors.push('organizer must be a non-empty string');
    }
  }

  // --- subOrganizer (optional) ---
  if (subOrganizer !== undefined && subOrganizer !== null && typeof subOrganizer !== 'string') {
    errors.push('subOrganizer must be a string');
  }

  // --- eventType (optional) ---
  if (eventType !== undefined && !VALID_EVENT_TYPES.includes(eventType)) {
    errors.push(`eventType must be one of: ${VALID_EVENT_TYPES.filter(t => t !== 'Hackthon').join(', ')}`);
  }

  // --- eventMode (optional) ---
  if (eventMode !== undefined && !VALID_EVENT_MODES.includes(eventMode.toString().toLowerCase())) {
    errors.push('eventMode must be either "offline" or "online"');
  }

  // --- academicYear (optional) ---
  if (academicYear !== undefined && academicYear !== null) {
    if (typeof academicYear !== 'string' || !ACADEMIC_YEAR_REGEX.test(academicYear.trim())) {
      errors.push('academicYear must be in format YYYY-YY (e.g. 2025-26, 2026-27)');
    }
  }

  // --- volunteerCapacity (optional) ---
  if (volunteerCapacity !== undefined) {
    if (
      typeof volunteerCapacity !== 'number' ||
      isNaN(volunteerCapacity) ||
      volunteerCapacity < 1
    ) {
      errors.push('volunteerCapacity must be a number of at least 1');
    }
  }

  // --- eventLevel (optional) ---
  const validLevels = ['University', 'Institute', 'Department'];
  if (eventLevel !== undefined) {
    if (!validLevels.includes(eventLevel)) {
      errors.push('eventLevel must be one of: University, Institute, Department');
    }
  }

  // --- conditional target arrays ---
  if (eventLevel === 'Institute') {
    if (!Array.isArray(targetInstituteIds) || targetInstituteIds.length === 0) {
      errors.push('targetInstituteIds is required and must be a non-empty array when eventLevel is Institute');
    } else {
      const allValid = targetInstituteIds.every((id) => mongoose.Types.ObjectId.isValid(id));
      if (!allValid) {
        errors.push('targetInstituteIds must contain only valid Mongo ObjectIds');
      }
    }
    if (targetDepartmentIds !== undefined && targetDepartmentIds !== null) {
      if (!Array.isArray(targetDepartmentIds)) {
        errors.push('targetDepartmentIds must be an array of Mongo ObjectIds if provided');
      } else {
        const allValid = targetDepartmentIds.every((id) => mongoose.Types.ObjectId.isValid(id));
        if (!allValid) {
          errors.push('targetDepartmentIds must contain only valid Mongo ObjectIds');
        }
      }
    }
  }

  if (eventLevel === 'Department') {
    if (targetInstituteIds !== undefined && targetInstituteIds !== null) {
      if (!Array.isArray(targetInstituteIds)) {
        errors.push('targetInstituteIds must be an array of Mongo ObjectIds if provided');
      } else {
        const allValid = targetInstituteIds.every((id) => mongoose.Types.ObjectId.isValid(id));
        if (!allValid) {
          errors.push('targetInstituteIds must contain only valid Mongo ObjectIds');
        }
      }
    }
    if (!Array.isArray(targetDepartmentIds) || targetDepartmentIds.length === 0) {
      errors.push('targetDepartmentIds is required and must be a non-empty array when eventLevel is Department');
    } else {
      const allValid = targetDepartmentIds.every((id) => mongoose.Types.ObjectId.isValid(id));
      if (!allValid) {
        errors.push('targetDepartmentIds must contain only valid Mongo ObjectIds');
      }
    }
  }

  if (eventLevel === undefined && (targetInstituteIds !== undefined || targetDepartmentIds !== undefined)) {
    errors.push('eventLevel must be included in the same request when updating targetInstituteIds or targetDepartmentIds');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = { validateCreateEvent, validateUpdateEvent };