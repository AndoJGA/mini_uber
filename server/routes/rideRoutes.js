const express = require('express');
const router = express.Router();
const { requestRide, acceptRide, completeRide } = require('../controllers/rideController');

router.post('/request', requestRide);
router.post('/accept', acceptRide);
router.post('/complete', completeRide);

module.exports = router;