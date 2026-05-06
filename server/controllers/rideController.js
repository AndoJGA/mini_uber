const Ride = require('../models/Ride');
const User = require('../models/User');

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

// Action: Driver accepts request[cite: 1]
exports.acceptRide = async (req, res) => {
  try {
    const { rideId, driverId } = req.body;
    
    // Transition: Requested -> Accepted[cite: 1]
    const ride = await Ride.findByIdAndUpdate(
      rideId,
      { driverId, status: 'accepted' },
      { new: true }
    );

    res.json(ride);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Action: Complete Ride[cite: 1]
exports.completeRide = async (req, res) => {
  try {
    const { rideId } = req.body;
    
    // Transition: In Progress -> Completed[cite: 1]
    const ride = await Ride.findByIdAndUpdate(
      rideId,
      { status: 'completed' },
      { new: true }
    );

    res.json({ message: "Ride completed successfully", ride });
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
      { new: true }
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
      { new: true }
    );
    res.json(ride);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};