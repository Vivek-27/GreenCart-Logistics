const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    // store hashed password only
    passwordHash: { type: String, required: true },
    // optional: role / name / email
    role: { type: String, default: 'manager' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
