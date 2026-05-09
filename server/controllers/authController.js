const router = require('express').Router();
const AuthService = require('../services/AuthService');

router.post('/register', async (req, res) => {
  const { name, email, password, role, vehiclePlate, vehicleModel } = req.body;
  if (!name||!email||!password||!role)
    return res.status(400).json({ error: 'Missing fields' });
  try {
    const user = await AuthService.register(
      name,email,password,role,vehiclePlate,vehicleModel);
    res.status(201).json({ userId: user.user_id, role: user.role });
  } catch(e) {
    res.status(409).json({ error: e.message });
  }
});
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await AuthService.login(email, password);
    res.json(result);
  } catch(e) {
    res.status(401).json({ error: e.message });
  }
});
module.exports = router;