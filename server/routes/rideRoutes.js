const express = require('express');
const router = express.Router();
const { 
  requestRide, 
  acceptRide, 
  startRide, 
  completeRide, 
  processPayment,
  getRiderHistory,
  getDriverHistory,
  getActiveRide,
  getRideById
} = require('../controllers/rideController');

router.post('/request', requestRide);
router.post('/accept', acceptRide);
router.post('/start', startRide);
router.post('/complete', completeRide);
router.post('/pay', processPayment);

router.get('/active', getActiveRide);
router.get('/history/rider/:riderId', getRiderHistory);
router.get('/history/driver/:driverId', getDriverHistory);

router.get('/available', async (req, res) => {
  try {
    const rides = await require('../models/Ride').find({ status: 'requested' });
    res.json(rides);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', getRideById);

module.exports = router;