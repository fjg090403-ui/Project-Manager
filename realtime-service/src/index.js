import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

const port = Number(process.env.REALTIME_PORT || 4000);
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:4200')
  .split(',')
  .map((origin) => origin.trim());

const app = express();
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'realtime-service' });
});

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

const events = ['taskCreated', 'taskUpdated', 'taskMoved', 'taskDeleted', 'commentCreated', 'notificationCreated'];

io.on('connection', (socket) => {
  socket.emit('connected', { socketId: socket.id });

  socket.on('joinBoard', (boardId) => {
    socket.join(`board:${boardId}`);
  });

  events.forEach((eventName) => {
    socket.on(eventName, (payload = {}) => {
      const room = payload.boardId ? `board:${payload.boardId}` : undefined;
      if (room) {
        socket.to(room).emit(eventName, payload);
      } else {
        socket.broadcast.emit(eventName, payload);
      }
    });
  });
});

server.listen(port, () => {
  console.log(`Realtime service listening on ${port}`);
});
