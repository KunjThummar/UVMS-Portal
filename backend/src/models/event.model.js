const mongoose = require('mongoose');
const { Schema } = mongoose;

function calculateAcademicYear(eventDate) {
  if (!eventDate) return '';
  const d = new Date(eventDate);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = d.getMonth(); // 6 = July
  const startYear = month >= 6 ? year : year - 1;
  return `${startYear}-${String(startYear + 1).slice(-2)}`;
}

function calculateEventDay(startDate, endDate) {
  if (!startDate || !endDate) return 1;

  const start = new Date(startDate);
  const end = new Date(endDate);

  const msPerDay = 1000 * 60 * 60 * 24;

  const diff = Math.round((end - start) / msPerDay) + 1;

  return Math.max(1, diff);
}

const eventSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  eventDate: {
    type: Date,
    required: true
  },

  eventEndDate: {
    type: Date,
    required: true
  },

  applicationDeadline: {
    type: Date,
    required: true
  },
  volunteerCapacity: {
    type: Number,
    required: true,
    min: 1
  },
  approvedCount: {
    type: Number, // denormalized counter, see design notes below
    default: 0
  },

  eventLevel: {
    type: String,
    enum: ['University', 'Institute', 'Department'],
    required: true
  },

  // populated only if eventLevel === 'Institute'
  targetInstituteIds: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Institute'
    }
  ],

  // populated only if eventLevel === 'Department'
  // supports multiple departments, possibly across different institutes
  targetDepartmentIds: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Department'
    }
  ],

  status: {
    type: String,
    enum: ['Open', 'ApplicationClosed', 'Completed'],
    default: 'Open'
  },

  academicYear: {
    type: String,
    required: true,
    trim: true,
    match: [/^\d{4}-\d{2}$/, 'Academic year must be in format YYYY-YY (e.g. 2026-27)']
  },
  organizer: {
    type: String, // Name of the institute
    required: true,
    trim: true
  },
  subOrganizer: {
    type: String, // Name of the department
    trim: true,
    default: ''
  },
  eventType: {
    type: String,
    enum: ['Seminar', 'Workshop', 'NSS', 'Hackathon', 'Hackthon', 'Expert Lecture'],
    required: true
  },
  eventMode: {
    type: String,
    enum: ['offline', 'online'],
    default: 'offline',
    required: true
  },
  eventDay: {
    type: Number, // Computed count of days
    default: 1
  },

  // Existing fields: approvedCount, volunteerCapacity, eventLevel...
  isArchived: {
    type: Boolean, // manual flag, protects from auto-cleanup job
    default: false
  },

  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true
  }
}, {
  timestamps: true
});


eventSchema.pre('save', function (next) {
  if (this.eventDate) {
    this.academicYear = calculateAcademicYear(this.eventDate);
  }
  if (this.eventDate && this.eventEndDate) {
    this.eventDay = calculateEventDay(this.eventDate, this.eventEndDate);
  }
  next();
});

// Indexes for fast searching & filtering
eventSchema.index({ academicYear: 1 });
eventSchema.index({ eventType: 1 });
eventSchema.index({ eventMode: 1 });
eventSchema.index({ organizer: 1 });

eventSchema.index({ createdBy: 1 });
eventSchema.index({ eventLevel: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ applicationDeadline: 1 });
eventSchema.index({ targetInstituteIds: 1 });
eventSchema.index({ eventDate: 1 });
eventSchema.index({ targetDepartmentIds: 1 }); // multikey index

/**
 * Design notes (carried over from schema doc):
 * - approvedCount is updated atomically ($inc) on approval/reversion,
 *   avoiding a full VolunteerApplication scan on every capacity check.
 * - isArchived is deliberately separate from status: status reflects the
 *   natural lifecycle (Open -> Full/ApplicationClosed -> Completed), while
 *   archiving is a manual action exempting the event from the auto-delete
 *   job, and can happen independent of lifecycle stage.
 */

module.exports = mongoose.models.Event || mongoose.model('Event', eventSchema);