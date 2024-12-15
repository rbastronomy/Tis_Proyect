/**
 * @enum {string}
 */
export const WS_EVENTS = {
  // Taxi events
  TAXI_AUTH: 'taxi:auth',
  TAXI_AUTH_SUCCESS: 'taxi:auth:success',
  TAXI_LOCATION: 'taxi:location',
  TAXI_LOCATION_UPDATE: 'taxi:location:update',
  TAXI_ONLINE: 'taxi:online',
  TAXI_OFFLINE: 'taxi:offline',
  DRIVER_OFFLINE: 'driver:offline',
  
  // Room events
  JOIN_ADMIN_ROOM: 'join:admin',
  LEAVE_ADMIN_ROOM: 'leave:admin',
  
  // System events
  ERROR: 'error',
  CONNECT: 'connection',
  DISCONNECT: 'disconnect'
}; 