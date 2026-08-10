const mongoose = require('mongoose');

function validateCreateEvent(data) {
  const errors = [];
  const now = new Date();

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

  // --- title ---
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push('title is required and must be a non-empty string');
  }

  // --- description ---
  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    errors.push('description is required and must be a non-empty string');
  }

  // --- eventDate ---
  let parsedEventDate = null;
  if (!eventDate || isNaN(Date.parse(eventDate))) {
    errors.push('eventDate is required and must be a valid date');
  } else {
    parsedEventDate = new Date(eventDate);
    if (parsedEventDate <= now) {
      errors.push('eventDate must be in the future');
    }
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

  // only compare the two dates if both individually parsed successfully
  if (parsedEventDate && parsedDeadline && parsedDeadline >= parsedEventDate) {
    errors.push('applicationDeadline must be before eventDate');
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
  }

  if (eventLevel === 'Department') {
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

  // cross-field check only if BOTH were sent in this update AND both parsed cleanly
  if (parsedEventDate && parsedDeadline && parsedDeadline >= parsedEventDate) {
    errors.push('applicationDeadline must be before eventDate');
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

  // --- conditional target arrays — only checked if eventLevel was sent in THIS update ---
  if (eventLevel === 'Institute') {
    if (!Array.isArray(targetInstituteIds) || targetInstituteIds.length === 0) {
      errors.push('targetInstituteIds is required and must be a non-empty array when eventLevel is Institute');
    } else {
      const allValid = targetInstituteIds.every((id) => mongoose.Types.ObjectId.isValid(id));
      if (!allValid) {
        errors.push('targetInstituteIds must contain only valid Mongo ObjectIds');
      }
    }
  }

  if (eventLevel === 'Department') {
    if (!Array.isArray(targetDepartmentIds) || targetDepartmentIds.length === 0) {
      errors.push('targetDepartmentIds is required and must be a non-empty array when eventLevel is Department');
    } else {
      const allValid = targetDepartmentIds.every((id) => mongoose.Types.ObjectId.isValid(id));
      if (!allValid) {
        errors.push('targetDepartmentIds must contain only valid Mongo ObjectIds');
      }
    }
  }

  // if targetInstituteIds/targetDepartmentIds are sent WITHOUT eventLevel also being sent,
  // we can't validate them against a level context in this update payload alone
  if (eventLevel === undefined && (targetInstituteIds !== undefined || targetDepartmentIds !== undefined)) {
    errors.push('eventLevel must be included in the same request when updating targetInstituteIds or targetDepartmentIds');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = { validateCreateEvent , validateUpdateEvent };