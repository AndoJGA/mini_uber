const router = require('express').Router();
const RideService = require('../services/RideService');
const { authenticate, authorize } = require('../middleware/authMiddleware');

router.post('/', authenticate, authorize('passenger'), async (req,res) => {
  const { pickupLabel, destLabel, pickupLat, pickupLng,
          destLat, destLng } = req.body;
  const ride = await RideService.createRideRequest(
    req.user.userId, pickupLabel, destLabel,
    pickupLat, pickupLng, destLat, destLng);
  res.status(201).json(ride);
});
router.post('/:id/accept', authenticate, authorize('driver'), async (req,res) => {
  try {
    const ride = await RideService.acceptRide(req.user.userId, req.params.id);
    res.json(ride);
  } catch(e) {
    res.status(409).json({ error: e.message });
  }
});
router.patch('/:id/start',    authenticate, authorize('driver'),
  async (req,res) => res.json(await RideService.startRide(req.params.id)));
router.patch('/:id/complete', authenticate, authorize('driver'),
  async (req,res) => res.json(await RideService.completeRide(req.params.id)));
router.delete('/:id', authenticate, async (req,res) => {
  await RideService.cancelRide(req.params.id, req.user.userId);
  res.json({ ok: true });
});
router.get('/history', authenticate, async (req,res) =>
  res.json(await RideService.getHistory(req.user.userId)));
module.exports = router;