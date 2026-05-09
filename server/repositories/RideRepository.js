const { db } = require('../db');

function save(ride) {
  db.prepare(`INSERT INTO ride_requests (
    request_id, passenger_id, driver_id,
    pickup_lat, pickup_lng, pickup_label,
    dest_lat, dest_lng, dest_label,
    status, fare_amount, distance_km, requested_at
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP
  )`).run(
    ride.requestId, ride.passengerId, ride.driverId,
    ride.pickupLat, ride.pickupLng, ride.pickupLabel,
    ride.destLat, ride.destLng, ride.destLabel,
    ride.status, ride.fareAmount, ride.distanceKm
  );
}

function findById(requestId) {
  const row = db.prepare('SELECT * FROM ride_requests WHERE request_id = ?').get(requestId);
  return row ? mapRow(row) : null;
}

function findByUserId(userId, role) {
  const column = role === 'passenger' ? 'passenger_id' : 'driver_id';
  return db.prepare(`SELECT * FROM ride_requests WHERE ${column} = ? ORDER BY requested_at DESC`)
    .all(userId)
    .map(mapRow);
}

function atomicAccept(requestId, driverId) {
  const result = db.prepare(`
    UPDATE ride_requests
    SET status='accepted', driver_id=?, accepted_at=CURRENT_TIMESTAMP
    WHERE request_id=? AND status='pending'
  `).run(driverId, requestId);
  return result.changes > 0;
}

function updateStatus(requestId, status, extra = {}) {
  const keys = Object.keys(extra);
  const assignments = keys.map(k => `${k} = ?`).join(', ');
  const sql = `
    UPDATE ride_requests
    SET status = ? ${assignments ? ', ' + assignments : ''}
    WHERE request_id = ?
  `;
  db.prepare(sql).run(status, ...Object.values(extra), requestId);
}

function mapRow(r) {
  return {
    requestId: r.request_id,
    passengerId: r.passenger_id,
    driverId: r.driver_id,
    pickupLat: r.pickup_lat,
    pickupLng: r.pickup_lng,
    pickupLabel: r.pickup_label,
    destLat: r.dest_lat,
    destLng: r.dest_lng,
    destLabel: r.dest_label,
    status: r.status,
    fareAmount: r.fare_amount,
    distanceKm: r.distance_km,
    requestedAt: r.requested_at,
    acceptedAt: r.accepted_at,
    startedAt: r.started_at,
    completedAt: r.completed_at
  };
}

function findPending() {
  return db.prepare("SELECT * FROM ride_requests WHERE status='pending'")
    .all()
    .map(mapRow);
}

module.exports = {
  save,
  findById,
  findPending,
  findByUserId,
  atomicAccept,
  updateStatus
};
