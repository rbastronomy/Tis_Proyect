import { WS_EVENTS } from '../constants/WebSocketEvents.js';

/**
 * @typedef {import('socket.io').Socket} Socket
 * @typedef {import('socket.io').Server} Server
 */

export class BaseSocketHandler {
  /**
   * @param {Server} io - Socket.io server instance
   */
  constructor(io) {
    this.io = io;
    this.handlers = new Map();
  }

  /**
   * Register an event handler
   * @param {string} event - Event name from WS_EVENTS
   * @param {Function} handler - Event handler function
   * @returns {this}
   */
  on(event, handler) {
    this.handlers.set(event, handler);
    return this;
  }

  /**
   * Emit event to a room
   * @param {string} room - Room name
   * @param {string} event - Event name from WS_EVENTS
   * @param {*} data - Event data
   */
  emitToRoom(room, event, data) {
    this.io.to(room).emit(event, data);
  }

  /**
   * Handle errors uniformly
   * @param {Socket} socket - Socket instance
   * @param {Error} error - Error object
   */
  handleError(socket, error) {
    console.error('Socket error:', {
      socketId: socket.id,
      error: error.message
    });
    socket.emit(WS_EVENTS.ERROR, { message: error.message });
  }

  /**
   * Initialize all handlers
   * @param {Socket} socket - Socket instance
   */
  initialize(socket) {
    this.handlers.forEach((handler, event) => {
      socket.on(event, async (data) => {
        try {
          await handler.call(this, socket, data);
        } catch (error) {
          this.handleError(socket, error);
        }
      });
    });
  }
} 