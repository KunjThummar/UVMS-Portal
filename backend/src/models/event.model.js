const mongoose = require('mongoose');
const { Schema } = mongoose;

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

module.exports = mongoose.model('Event', eventSchema);