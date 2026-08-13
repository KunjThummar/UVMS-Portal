const mongoose = require('mongoose');
const { Schema } = mongoose;

const volunteerApplicationSchema = new Schema({
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },

  // snapshot fields captured at time of application (per SRS Section 7)
  fullName: {
    type: String,
    required: true
  },
  studentIdNumber: {
    type: String, // snapshot of Student.studentId
    required: true
  },
  semester: {
    type: Number,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  previousExperience: {
    type: String,
    default: null
  },

  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },

  decisionBy: {
    type: Schema.Types.ObjectId,
    ref: 'Faculty',
    default: null
  },
  decisionAt: {
    type: Date,
    default: null
  },
  decisionReason: {
    type: String, // e.g. "auto-rejected: deadline passed" / "auto-rejected: capacity reached"
    default: null
  },

  appliedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// faculty reviewing pending applications / capacity-counting job
volunteerApplicationSchema.index({ eventId: 1, status: 1 });

// a student's "my applications" view
volunteerApplicationSchema.index({ studentId: 1, status: 1 });

// Enforce "one active application per student per event" at the DB level:
// allows unlimited Rejected applications (reapplication), but guarantees
// at most one Pending or Approved application exists at a time.
volunteerApplicationSchema.index(
  { eventId: 1, studentId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['Pending', 'Approved'] } }
  }
);

module.exports = mongoose.model('VolunteerApplication', volunteerApplicationSchema);; 