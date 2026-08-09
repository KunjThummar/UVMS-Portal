const mongoose = require('mongoose');
const { Schema } = mongoose;

const instituteSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  code: {
    type: String, // short code e.g. "IT"
    required: true,
    unique: true,
    trim: true
  }
}, {
  timestamps: true
});



module.exports = mongoose.model('Institute', instituteSchema);