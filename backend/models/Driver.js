const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  currentShiftHours: { type: Number, default: 0 },
  past7DaysHours: { type: Number, default: 0 }
});

module.exports = mongoose.model('Driver', DriverSchema);
