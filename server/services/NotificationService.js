const jwt = require('jsonwebtoken');
const UserRepository = require('../repositories/UserRepository');
const SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

const connections = new Map(); // userId → ws
const wsToUser  = new Map(); // ws → userId (for fast unregister)

function register(token, ws) {
  try {
    const { userId } = jwt.verify(token, SECRET);
    connections.set(userId, ws);
    wsToUser.set(ws, userId);
    console.log(`User ${userId} registered for notifications. Total connections: ${connections.size}`);
  } catch (err) { 
    console.error('WS Register Error:', err.message);
    ws.close(); 
  }
}

function unregister(ws) {
  const userId = wsToUser.get(ws);
  if (userId) { 
    connections.delete(userId); 
    wsToUser.delete(ws); 
    console.log(`User ${userId} unregistered. Total connections: ${connections.size}`);
  }
}

function send(userId, event, data) {
  const ws = connections.get(userId);
  if (ws?.readyState === 1) {
    console.log(`Sending ${event} to user ${userId}`);
    ws.send(JSON.stringify({ event, data }));
  } else {
    console.log(`Failed to send ${event} to user ${userId} (not connected or readyState: ${ws?.readyState})`);
  }
}

function broadcastToDrivers(event, data) {
  const availableDrivers = UserRepository.findAvailableDrivers();
  console.log(`Broadcasting ${event} to ${availableDrivers.length} available drivers in DB: ${availableDrivers.map(d => d.userId).join(', ')}`);
  availableDrivers.forEach(d => send(d.userId, event, data));
}
module.exports = { register, unregister,
  notifyPassenger: send, notifyDriver: send, broadcastToDrivers };