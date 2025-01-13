import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

let isStreamActive = false; // Track stream status
let broadcasterId = null; // Store the broadcaster's socket ID

// Route for stream status
app.get('/stream/status', (req, res) => {
  res.send({ isStreamActive });
});

// WebRTC signaling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('start_stream', () => {
    if (!isStreamActive) {
      isStreamActive = true;
      broadcasterId = socket.id;
      io.emit('stream_started');
      console.log('Stream started by:', socket.id);
    }
  });

  socket.on('stop_stream', () => {
    if (socket.id === broadcasterId) {
      isStreamActive = false;
      broadcasterId = null;
      io.emit('stream_stopped');
      console.log('Stream stopped by:', socket.id);
    }
  });

  socket.on('offer', (offer) => {
    if (isStreamActive) {
      socket.broadcast.emit('offer', offer);
    }
  });

  socket.on('answer', (answer) => {
    socket.broadcast.emit('answer', answer);
  });

  socket.on('candidate', (candidate) => {
    socket.broadcast.emit('candidate', candidate);
  });

  socket.on('disconnect', () => {
    if (socket.id === broadcasterId) {
      isStreamActive = false;
      io.emit('stream_stopped');
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
