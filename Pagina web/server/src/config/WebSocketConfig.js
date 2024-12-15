import { Server } from 'socket.io';
import { WebSocketController } from '../controllers/WebSocketController.js';

export class WebSocketConfig {
  constructor(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: (origin, callback) => {
          console.log('Incoming socket connection from:', origin);
          // Allow all origins in development
          callback(null, true);
        },
        credentials: true,
        methods: ["GET", "POST"],
      },
      path: '/socket.io',
      transports: ['websocket']
    });
  }

  initialize() {
    const wsController = new WebSocketController(this.io);
    wsController.initialize();
    console.log('🔌 WebSocket server initialized');
    return this.io;
  }
} 