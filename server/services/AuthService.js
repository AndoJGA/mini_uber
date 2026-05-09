const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const UserRepository = require('../repositories/UserRepository');
const SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

async function register(name, email, password, role, plate, model) {
  const existing = UserRepository.findByEmail(email);
  if (existing) throw new Error('Email already registered');
  
  const hash = await bcrypt.hash(password, 10);
  const user = {
    userId: uuidv4(),
    name,
    email,
    passwordHash: hash,
    role,
    vehiclePlate: plate || null,
    vehicleModel: model || null,
    driverStatus: role === 'driver' ? 'available' : null,
    currentLat: 9.0249,
    currentLng: 38.7469
  };
  
  UserRepository.save(user);
  return user;
}

async function login(email, password) {
  const user = UserRepository.findByEmail(email);
  if (!user) throw new Error('Invalid credentials');
  
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error('Invalid credentials');

  if (user.role === 'driver') {
    UserRepository.updateDriverStatus(user.userId, 'available');
    user.driverStatus = 'available';
  }
  
  const token = jwt.sign(
    { userId: user.userId, email: user.email, role: user.role },
    SECRET,
    { expiresIn: '24h' }
  );
  
  return { token, user };
}

module.exports = {
  register,
  login
};
