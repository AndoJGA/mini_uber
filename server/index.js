const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const authRoutes = require('./controllers/authController');
const rideRoutes = require('./controllers/rideController');
const { initDB } = require('./db');
const NotificationService = require('./services/NotificationService');

const app = express();
app.use(express.json());

// Log HTTP requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let connectionCount = 0;

wss.on('connection', (ws) => {
  connectionCount++;
  console.log(`New WS connection. Total: ${connectionCount}`);

  ws.on('message', (msg) => {
    try {
      const payload = JSON.parse(msg.toString());
      const { type, token } = payload;
      if (type === 'AUTH') {
        NotificationService.register(token, ws);
        console.log(`User authenticated on WS`);
      }
    } catch (err) {
      console.error('WS Message Error:', err);
    }
  });

  ws.on('close', () => {
    connectionCount--;
    NotificationService.unregister(ws);
    console.log(`WS connection closed. Total: ${connectionCount}`);
  });
});

const PORT = 3000;
initDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Mini Uber Backend listening on port ${PORT}`);
    console.log(`Database initialized`);
  });
});
