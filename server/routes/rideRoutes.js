const express = require('express');
const router = express.Router();
const { requestRide, acceptRide, completeRide } = require('../controllers/rideController');

router.post('/request', requestRide);
router.post('/accept', acceptRide);
router.post('/complete', completeRide);

router.get('/available', async (req, res) => {
  const rides = await require('../models/Ride').find({ status: 'requested' });
  res.json(rides);
});

module.exports = router;