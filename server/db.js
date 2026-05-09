const Database = require('better-sqlite3');
const db = new Database('./miniuber.db');

function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      user_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('passenger','driver')),
      vehicle_plate TEXT, vehicle_model TEXT,
      driver_status TEXT DEFAULT 'available',
      current_lat REAL, current_lng REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS ride_requests (
      request_id TEXT PRIMARY KEY,
      passenger_id TEXT NOT NULL REFERENCES users(user_id),
      driver_id TEXT REFERENCES users(user_id),
      pickup_lat REAL, pickup_lng REAL, pickup_label TEXT,
      dest_lat REAL, dest_lng REAL, dest_label TEXT,
      status TEXT DEFAULT 'pending',
      fare_amount REAL, distance_km REAL,
      requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      accepted_at DATETIME, started_at DATETIME, completed_at DATETIME
    );
    CREATE INDEX IF NOT EXISTS idx_rides_status ON ride_requests(status);
    CREATE INDEX IF NOT EXISTS idx_rides_passenger ON ride_requests(passenger_id);
    CREATE INDEX IF NOT EXISTS idx_rides_driver   ON ride_requests(driver_id);
  `);
  return Promise.resolve();
}
module.exports = { db, initDB };