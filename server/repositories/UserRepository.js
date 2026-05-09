const { db } = require('../db');

function save(user) {
  db.prepare(`INSERT INTO users (
    user_id, name, email, password_hash, role,
    vehicle_plate, vehicle_model, driver_status,
    current_lat, current_lng, created_at
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP
  )`).run(
    user.userId, user.name, user.email, user.passwordHash, user.role,
    user.vehiclePlate, user.vehicleModel, user.driverStatus,
    user.currentLat, user.currentLng
  );
}

function findByEmail(email) {
  const row = db.prepare('SELECT * FROM users WHERE email=?').get(email);
  return row ? mapRow(row) : null;
}

function findById(id) {
  const row = db.prepare('SELECT * FROM users WHERE user_id=?').get(id);
  return row ? mapRow(row) : null;
}

function findAvailableDrivers() {
  return db.prepare(
    "SELECT * FROM users WHERE role='driver' AND driver_status='available'"
  ).all().map(mapRow);
}

function updateDriverStatus(userId, status) {
  db.prepare("UPDATE users SET driver_status=? WHERE user_id=?")
    .run(status, userId);
}

function updateDriverLocation(userId, lat, lng) {
  db.prepare("UPDATE users SET current_lat=?, current_lng=? WHERE user_id=?")
    .run(lat, lng, userId);
}

function mapRow(r) {
  return {
    userId: r.user_id,
    name: r.name,
    email: r.email,
    passwordHash: r.password_hash,
    role: r.role,
    vehiclePlate: r.vehicle_plate,
    vehicleModel: r.vehicle_model,
    driverStatus: r.driver_status,
    currentLat: r.current_lat,
    currentLng: r.current_lng
  };
}

module.exports = {
  save,
  findByEmail,
  findById,
  findAvailableDrivers,
  updateDriverStatus,
  updateDriverLocation
};
