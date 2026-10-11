const mongoose = require('mongoose');
const { Schema } = mongoose;

const eventCounterSchema = new Schema({
  _id: {
    type: String,
    required: true
  },
  sequence: {
    type: Number,
    default: 0,
    required: true
  }
}, {
  versionKey: false
});

module.exports =
  mongoose.models.EventCounter ||
  mongoose.model('EventCounter', eventCounterSchema);