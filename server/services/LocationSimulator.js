const UserRepository = require('../repositories/UserRepository');
const NotificationService = require('./NotificationService');

const activeSimulations = new Map(); // requestId → intervalId

/**
 * Moves a point toward a destination by a fixed distance.
 */
function moveToward(lat, lng, destLat, destLng, distanceKm) {
  const R = 6371; // Earth radius in km
  
  // Calculate current distance
  const dLat = (destLat - lat) * Math.PI / 180;
  const dLng = (destLng - lng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat * Math.PI / 180) * Math.cos(destLat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  const currentDist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  if (currentDist <= distanceKm) return { lat: destLat, lng: destLng, reached: true };

  // Simple LERP based on distance ratio for the simulator
  const ratio = distanceKm / currentDist;
  return {
    lat: lat + (destLat - lat) * ratio,
    lng: lng + (destLng - lng) * ratio,
    reached: false
  };
}

function startSimulation(requestId, passengerId, driverId, lat, lng, destLat, destLng) {
  let curLat = lat, curLng = lng;
  const speedKmh = 60;
  const intervalSeconds = 3;
  const distancePerTick = (speedKmh / 3600) * intervalSeconds; // km per tick (~0.05km)

  console.log(`Starting 60km/h simulation for ride ${requestId}`);

  const id = setInterval(() => {
    const next = moveToward(curLat, curLng, destLat, destLng, distancePerTick);
    curLat = next.lat;
    curLng = next.lng;

    UserRepository.updateDriverLocation(driverId, curLat, curLng);
    NotificationService.notifyPassenger(passengerId, 'LOCATION_UPDATE', { lat: curLat, lng: curLng });

    if (next.reached) {
      console.log(`Simulation reached destination for ride ${requestId}`);
      stopSimulation(requestId);
    }
  }, intervalSeconds * 1000);

  activeSimulations.set(requestId, id);
}

function stopSimulation(requestId) {
  const id = activeSimulations.get(requestId);
  if (id) {
    clearInterval(id);
    activeSimulations.delete(requestId);
    console.log(`Simulation stopped for ride ${requestId}`);
  }
}

module.exports = { startSimulation, stopSimulation };
