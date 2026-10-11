const EventCounter = require('../models/EventCounter');

const EVENT_TYPE_CODES = {
  'Hackathon': 1,
  'Seminar/Webinar': 2,
  'Workshop': 3,
  'NSS': 4,
  'Expert Lecture': 5,
  'other': 7
};

async function generateEventId(eventDate, eventType) {
  const date = new Date(eventDate);

  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid event date');
  }

  const year = date.getFullYear();
  const month = date.getMonth();

  // Academic year begins in July.
  const startYear = month >= 6 ? year : year - 1;
  const academicYear =
    `${startYear}/${String(startYear + 1).slice(-2)}`;

  const typeCode = EVENT_TYPE_CODES[eventType];

  if (typeCode === undefined) {
    throw new Error(`Unknown event type: ${eventType}`);
  }

  const counterKey = `${academicYear}-${typeCode}`;

  const counter = await EventCounter.findOneAndUpdate(
    { _id: counterKey },
    { $inc: { sequence: 1 } },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    }
  );

  const sequenceNumber = String(counter.sequence).padStart(3, '0');

  return `${academicYear}-${typeCode}-${sequenceNumber}`;
}

module.exports = generateEventId;