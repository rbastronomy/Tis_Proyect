// Instalar: npm install -D socket.io-client jest
// test/websocket.test.js
import { io } from 'socket.io-client';

describe('WebSocket Tests', () => {
  let socket;

  beforeEach((done) => {
    socket = io('http://localhost:3000');
    socket.on('connect', done);
  });

  afterEach(() => {
    socket.close();
  });

  test('should authenticate taxi', (done) => {
    socket.emit('taxi:auth', { patente: 'TEST123' });
    
    socket.on('taxi:online', (data) => {
      expect(data.patente).toBe('TEST123');
      done();
    });
  });

  test('should update location', (done) => {
    const location = {
      patente: 'TEST123',
      latitude: -20.2133,
      longitude: -70.1503
    };

    socket.emit('location:update', location);
    
    socket.on('taxi:location', (data) => {
      expect(data.patente).toBe(location.patente);
      expect(data.location).toMatchObject(location);
      done();
    });
  });
});