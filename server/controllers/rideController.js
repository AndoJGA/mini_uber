const Ride = require('../models/Ride');
const User = require('../models/User');
const Payment = require('../models/Payment');

// Action: Rider sends request
exports.requestRide = async (req, res) => {
  try {
    const { riderId, pickupLocation, destination, fare } = req.body;
    
    const newRide = new Ride({
      riderId,
      pickupLocation,
      destination,
      fare, // From fare estimate requirement
      status: 'requested' // Initial state
    });

    await newRide.save();
    res.status(201).json(newRide);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Action: Driver accepts request
exports.acceptRide = async (req, res) => {
  try {
    const { rideId, driverId } = req.body;
    
    // Transition: Requested -> Accepted
    const ride = await Ride.findByIdAndUpdate(
      rideId,
      { driverId, status: 'accepted' },
      { returnDocument: 'after' }
    );

    res.json(ride);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Action: Driver starts the ride
exports.startRide = async (req, res) => {
  try {
    const { rideId } = req.body;
    // Transition: Accepted -> In Progress
    const ride = await Ride.findByIdAndUpdate(
      rideId,
      { status: 'in_progress' },
      { returnDocument: 'after' }
    );
    res.json(ride);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Action: Driver ends the ride
exports.completeRide = async (req, res) => {
  try {
    const { rideId } = req.body;
    // Transition: In Progress -> Completed
    const ride = await Ride.findByIdAndUpdate(
      rideId,
      { status: 'completed' },
      { returnDocument: 'after' }
    );
    res.json(ride);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.processPayment = async (req, res) => {
  try {
    const { rideId, amount } = req.body;
    
    // Create the Payment object
    const payment = new Payment({
      rideId,
      amount,
      status: 'completed',
      transactionId: 'TXN-' + Math.random().toString(36).substr(2, 9)
    });

    await payment.save();
    res.json({ message: "Payment processed successfully", payment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRiderHistory = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const riderId = new mongoose.Types.ObjectId(req.params.riderId);
    
    // Aggregate rides with their payments
    const history = await Ride.aggregate([
      { $match: { riderId: riderId } },
      {
        $lookup: {
          from: 'payments',
          localField: '_id',
          foreignField: 'rideId',
          as: 'paymentDetails'
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDriverHistory = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const driverId = new mongoose.Types.ObjectId(req.params.driverId);
    
    // Aggregate completed rides with payments for earnings
    const history = await Ride.aggregate([
      { $match: { driverId: driverId, status: 'completed' } },
      {
        $lookup: {
          from: 'payments',
          localField: '_id',
          foreignField: 'rideId',
          as: 'paymentDetails'
        }
      },
      { $sort: { createdAt: -1 } }
    ]);
    
    // Calculate total earnings from the linked payments
    const totalEarnings = history.reduce((sum, item) => {
      const payment = item.paymentDetails[0];
      return sum + (payment ? payment.amount : 0);
    }, 0);
    
    res.json({ rides: history, totalEarnings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getActiveRide = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const { userId, role } = req.query;
    const query = role === 'rider' ? 
      { riderId: new mongoose.Types.ObjectId(userId) } : 
      { driverId: new mongoose.Types.ObjectId(userId) };
    
    // For rider, also look for 'completed' but unpaid rides if necessary
    // However, the current logic is to show payment screen for 'completed'
    const ride = await Ride.findOne({ 
      ...query, 
      status: { $in: ['requested', 'accepted', 'in_progress', 'completed'] } 
    }).sort({ updatedAt: -1 }); // Get the most recent one
    
    // If the most recent ride is completed, we should check if it's paid
    // For simplicity, we'll return it and let the frontend decide based on status
    res.json(ride);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    res.json(ride);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};