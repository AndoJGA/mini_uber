const { v4: uuidv4 } = require('uuid');
const RideRepository = require('../repositories/RideRepository');
const UserRepository = require('../repositories/UserRepository');
const NotificationService = require('./NotificationService');
const LocationSimulator = require('./LocationSimulator');

const RATE_PER_KM = 20; // ETB

async function createRideRequest(passengerId, pickupLabel, destLabel, pickupLat, pickupLng, destLat, destLng) {
  const ride = {
    requestId: uuidv4(),
    passengerId: passengerId,
    driverId: null,
    pickupLat: pickupLat,
    pickupLng: pickupLng,
    pickupLabel: pickupLabel,
    destLat: destLat,
    destLng: destLng,
    destLabel: destLabel,
    status: 'pending',
    fareAmount: null,
    distanceKm: haversine(pickupLat, pickupLng, destLat, destLng)
  };
  console.log(`Creating ride request for passenger ${passengerId}`);
  RideRepository.save(ride);
  console.log(`Broadcasting ride request ${ride.requestId} to drivers`);
  NotificationService.broadcastToDrivers('NEW_RIDE_REQUEST', ride);

  // 60-second timeout
  setTimeout(() => {
    const current = RideRepository.findById(ride.requestId);
    if (current && current.status === 'pending') {
      RideRepository.updateStatus(ride.requestId, 'cancelled');
      NotificationService.notifyPassenger(passengerId, 'RIDE_TIMEOUT', {});
    }
  }, 60000);

  return ride;
}

async function acceptRide(driverId, requestId) {
  const accepted = RideRepository.atomicAccept(requestId, driverId);
  if (!accepted) throw new Error('ALREADY_TAKEN');

  UserRepository.updateDriverStatus(driverId, 'busy');
  const driver = UserRepository.findById(driverId);
  const ride = RideRepository.findById(requestId);

  NotificationService.notifyPassenger(ride.passengerId, 'DRIVER_ASSIGNED', { driver });
  NotificationService.broadcastToDrivers('REQUEST_TAKEN', { requestId });

  return ride;
}

async function startRide(requestId) {
  const ride = RideRepository.findById(requestId);
  if (!ride) throw new Error('Ride not found');

  RideRepository.updateStatus(requestId, 'in_progress', { started_at: new Date().toISOString() });
  
  const driver = UserRepository.findById(ride.driverId);
  LocationSimulator.startSimulation(
    requestId,
    ride.passengerId,
    ride.driverId,
    driver.currentLat,
    driver.currentLng,
    ride.destLat,
    ride.destLng
  );

  NotificationService.notifyPassenger(ride.passengerId, 'RIDE_STARTED', {});
  return { status: 'in_progress' };
}

async function completeRide(requestId) {
  const ride = RideRepository.findById(requestId);
  if (!ride) throw new Error('Ride not found');

  LocationSimulator.stopSimulation(requestId);

  const fare = ride.distanceKm * RATE_PER_KM;
  RideRepository.updateStatus(requestId, 'completed', {
    completed_at: new Date().toISOString(),
    fare_amount: fare
  });

  UserRepository.updateDriverStatus(ride.driverId, 'available');

  NotificationService.notifyPassenger(ride.passengerId, 'RIDE_COMPLETED', { fare });
  return { status: 'completed', fare };
}

async function cancelRide(requestId, actorId) {
  const ride = RideRepository.findById(requestId);
  if (!ride) throw new Error('Ride not found');

  const user = UserRepository.findById(actorId);
  
  RideRepository.updateStatus(requestId, 'cancelled');
  
  if (ride.driverId) {
    UserRepository.updateDriverStatus(ride.driverId, 'available');
    LocationSimulator.stopSimulation(requestId);
  }

  if (user.role === 'driver') {
    NotificationService.notifyPassenger(ride.passengerId, 'RIDE_CANCELLED', { reason: 'Driver cancelled' });
  } else {
    if (ride.driverId) {
      NotificationService.notifyDriver(ride.driverId, 'RIDE_CANCELLED', { reason: 'Passenger cancelled' });
    }
  }

  return { status: 'cancelled' };
}

async function getHistory(userId) {
  const user = UserRepository.findById(userId);
  return RideRepository.findByUserId(userId, user.role);
}

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

module.exports = {
  createRideRequest,
  acceptRide,
  startRide,
  completeRide,
  cancelRide,
  getHistory
};
