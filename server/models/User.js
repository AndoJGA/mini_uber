const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true }, // From Data Dictionary
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['rider', 'driver', 'admin'], required: true },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // GPS position
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);