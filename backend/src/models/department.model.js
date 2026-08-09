const mongoose = require('mongoose');
const { Schema } = mongoose;

const departmentSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String, // e.g. "CSE"
    required: true,
    trim: true
  },
  instituteId: {
    type: Schema.Types.ObjectId,
    ref: 'Institute',
    required: true
  }
}, {
  timestamps: true
});

// code must be unique within an institute, but two institutes can
// each have their own "CSE" department
departmentSchema.index({ instituteId: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('Department', departmentSchema);