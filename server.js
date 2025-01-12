import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import dotenv from 'dotenv';
dotenv.config();

// App initialization
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', 
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const DB_URI = 'mongodb+srv://ekpomachi:PiUHryuvFDwWNO1s@cluster0.4jssa.mongodb.net/';
mongoose
  .connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Stream status
let isStreamActive = false;

// Test route
app.get('/', (req, res) => {
  res.send({ message: 'Welcome to the Streaming App API!' });
});

// Stream status endpoint
app.get('/stream/status', (req, res) => {
  res.send({ isStreamActive });
});

// Start stream endpoint
app.post('/stream/start', (req, res) => {
  isStreamActive = true;
  io.emit('stream_started', { message: 'A new stream has started!' });
  res.send({ message: 'Stream started' });
});

// Stop stream endpoint
app.post('/stream/stop', (req, res) => {
  isStreamActive = false;
  io.emit('stream_stopped', { message: 'The stream has stopped!' });
  res.send({ message: 'Stream stopped' });
});

// Socket.IO integration
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('audio_stream', (data) => {
    socket.broadcast.emit('audio_stream', data);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// Server configuration
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});