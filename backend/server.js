require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const { router: stockRoutes, setBroadcastFunction } = require('./routes/stocks');
const tradingRoutes = require('./routes/trading');
const { verifyWebSocketToken } = require('./utils/websocketAuth');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static('../frontend/dist'));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pex')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/trading', tradingRoutes);

// API health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'PEX Backend Server Running' });
});

// React Router fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

const clients = new Map();

wss.on('connection', (ws, req) => {
  const protocol = req.headers['sec-websocket-protocol'];
  const user = verifyWebSocketToken(protocol);

  if (!user) {
    ws.close(1008, 'Unauthorized');
    return;
  }

  clients.set(user.userId, ws);
  console.log(`User ${user.username} connected via WebSocket`);

  ws.on('close', () => {
    clients.delete(user.userId);
    console.log(`User ${user.username} disconnected`);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

const broadcastTickerUpdate = (ticker, price) => {
  const message = JSON.stringify({
    type: 'TICKER_UPDATE',
    payload: {
      ticker,
      price
    }
  });

  clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  });
};

setBroadcastFunction(broadcastTickerUpdate);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
