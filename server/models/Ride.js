const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  riderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional until accepted
  pickupLocation: { type: String, required: true },
  destination: { type: String, required: true },
  fare: { type: Number, required: true }, // Fare estimate
  status: { 
    type: String, 
    enum: ['requested', 'accepted', 'in_progress', 'completed', 'cancelled'], 
    default: 'requested' 
  } // Matches State Diagram in docs.md[cite: 1]
}, { timestamps: true });

module.exports = mongoose.model('Ride', rideSchema);