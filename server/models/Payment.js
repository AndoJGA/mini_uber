const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  rideId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  transactionId: { type: String } // Mock identifier
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);