// Entry point for the Express server. Connects to MongoDB, registers all routes,
// and starts listening on the configured port. CORS is enabled for the React frontend.
// Socket.IO is integrated for real-time group updates.

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import settlementRoutes from './routes/settlementRoutes.js';

dotenv.config();
connectDB();

const app = express();

const CORS_ORIGINS = [
  'http://localhost:5173',
  'https://smart-split-iota.vercel.app',
];

app.use(cors({ origin: CORS_ORIGINS, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/settlements', settlementRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
app.get('/', (req, res) => {
  res.send('SmartSplit Backend is Running 🚀');
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// ── Socket.IO ────────────────────────────────────────────
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Attach io to app so controllers can emit via req.app.get('io')
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // Client joins a group-specific room to receive real-time updates
  socket.on('join-group', (groupId) => {
    socket.join(`group:${groupId}`);
    console.log(`📥 ${socket.id} joined group:${groupId}`);
  });

  socket.on('leave-group', (groupId) => {
    socket.leave(`group:${groupId}`);
    console.log(`📤 ${socket.id} left group:${groupId}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} with Socket.IO`);
});
