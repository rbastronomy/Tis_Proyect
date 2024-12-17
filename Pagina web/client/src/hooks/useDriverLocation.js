import { useEffect, useState, useRef, useCallback } from 'react';
import { useSocketContext } from '../context/SocketContext';
import { useGeolocation } from './useGeolocation';

const KALMAN_FILTER_R = 0.1; // Measurement noise
const KALMAN_FILTER_Q = 0.1; // Process noise

export function useDriverLocation({ 
  isOnline, 
  driverId, 
  patente, 
  onError 
}) {
  const { socket, isConnected, isConnecting } = useSocketContext();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [smoothedPosition, setSmoothedPosition] = useState(null);
  const positionBuffer = useRef([]);
  const kalmanState = useRef({ x: 0, P: 1 });
  const BUFFER_SIZE = 5; // Increased buffer size for better smoothing
  const authTimeoutRef = useRef(null);
  const authAttemptedRef = useRef(false);
  const lastEmitTime = useRef(0);
  const EMIT_INTERVAL = 2000; // Minimum interval between emissions

  // Enhanced geolocation configuration
  const { position, error: geoError, loading } = useGeolocation({ 
    skip: !isOnline || !isAuthenticated,
    enableHighAccuracy: true,
    timeout: 30000,
    maximumAge: 0,
    retryOnError: true,
    maxRetries: 5,
    minUpdateInterval: 1000,
    accuracyLevels: {
      high: 20,
      medium: 50,
      low: 100
    },
    minDistance: 2,
    maxAge: 10000
  });

  // New: Kalman filter implementation
  const applyKalmanFilter = useCallback((measurement, state) => {
    // Prediction
    const xPred = state.x;
    const pPred = state.P + KALMAN_FILTER_Q;

    // Update
    const K = pPred / (pPred + KALMAN_FILTER_R);
    const x = xPred + K * (measurement - xPred);
    const P = (1 - K) * pPred;

    return { x, P };
  }, []);

  // Enhanced position smoothing
  useEffect(() => {
    if (!position) return;

    // Validate position
    if (!position.lat || !position.lng || 
        isNaN(position.lat) || isNaN(position.lng)) {
      console.warn('Invalid position received:', position);
      return;
    }

    // Add new position to buffer
    positionBuffer.current.push(position);
    
    if (positionBuffer.current.length > BUFFER_SIZE) {
      positionBuffer.current.shift();
    }

    // Apply Kalman filter and position smoothing
    if (positionBuffer.current.length >= 2) {
      const validPositions = positionBuffer.current.filter(pos => 
        pos && pos.lat && pos.lng && 
        !isNaN(pos.lat) && !isNaN(pos.lng)
      );

      if (validPositions.length >= 2) {
        // Apply Kalman filter to latitude and longitude
        const latState = applyKalmanFilter(position.lat, { 
          x: kalmanState.current.x, 
          P: kalmanState.current.P 
        });
        const lngState = applyKalmanFilter(position.lng, { 
          x: kalmanState.current.x, 
          P: kalmanState.current.P 
        });

        // Calculate weighted average for smoothing
        const weights = validPositions.map((_, i) => 
          Math.exp(-0.5 * (validPositions.length - 1 - i))
        );
        const weightSum = weights.reduce((a, b) => a + b, 0);

        const smoothed = {
          lat: validPositions.reduce((sum, pos, i) => 
            sum + (pos.lat * weights[i]), 0) / weightSum,
          lng: validPositions.reduce((sum, pos, i) => 
            sum + (pos.lng * weights[i]), 0) / weightSum,
          accuracy: position.accuracy,
          accuracyLevel: position.accuracyLevel,
          speed: position.speed,
          heading: position.heading,
          timestamp: position.timestamp,
          altitude: position.altitude,
          altitudeAccuracy: position.altitudeAccuracy
        };

        // Apply Kalman filtered values
        smoothed.lat = latState.x;
        smoothed.lng = lngState.x;

        kalmanState.current = { x: latState.x, P: latState.P };
        setSmoothedPosition(smoothed);
      }
    } else {
      setSmoothedPosition(position);
    }
  }, [position, applyKalmanFilter]);

  // Reset auth state when connection is lost or going offline
  useEffect(() => {
    if (!isConnected || !isOnline) {
      setIsAuthenticated(false);
      authAttemptedRef.current = false;
    }
  }, [isConnected, isOnline]);

  // Handle driver authentication
  useEffect(() => {
    if (!socket || !isConnected || !isOnline) {
      console.log('🚖 Skipping auth - not ready:', { isConnected, isOnline });
      return;
    }

    if (isAuthenticated || authAttemptedRef.current) {
      console.log('🚖 Auth already attempted or authenticated');
      return;
    }

    const authenticate = () => {
      console.log('🚖 Attempting driver authentication:', { 
        driverId, 
        patente,
        socketId: socket?.id,
        socketConnected: socket?.connected
      });
      
      authAttemptedRef.current = true;
      
      socket.emit('taxi:auth', { 
        driverId, 
        patente,
        timestamp: Date.now() 
      });

      authTimeoutRef.current = setTimeout(() => {
        console.warn('⚠️ Authentication timed out:', {
          driverId,
          patente,
          socketId: socket?.id
        });
        setIsAuthenticated(false);
        authAttemptedRef.current = false;
        onError?.('Authentication timed out');
      }, 10000);
    };

    const handleAuthSuccess = (data) => {
      console.log('🚖 Authentication success received:', {
        data,
        socketId: socket?.id,
        timestamp: Date.now()
      });
      if (authTimeoutRef.current) {
        clearTimeout(authTimeoutRef.current);
      }
      setIsAuthenticated(true);
    };

    const handleAuthError = (error) => {
      console.error('🚖 Authentication error received:', {
        error,
        socketId: socket?.id,
        timestamp: Date.now()
      });
      if (authTimeoutRef.current) {
        clearTimeout(authTimeoutRef.current);
      }
      setIsAuthenticated(false);
      authAttemptedRef.current = false;
      onError?.(typeof error === 'string' ? error : error.message || 'Authentication failed');
    };

    socket.on('taxi:auth:success', handleAuthSuccess);
    socket.on('taxi:online', (data) => {
      console.log('🚖 Taxi online event received:', data);
    });
    socket.on('error', handleAuthError);

    authenticate();

    // Cleanup function
    return () => {
      if (authTimeoutRef.current) {
        clearTimeout(authTimeoutRef.current);
      }
      if (socket) {
        socket.off('taxi:auth:success', handleAuthSuccess);
        socket.off('taxi:online');
        socket.off('error', handleAuthError);
      }
    };
  }, [socket, isConnected, isOnline, driverId, patente, onError]);

  // Handle cleanup when component unmounts or taxi goes offline
  useEffect(() => {
    return () => {
      if (socket && isAuthenticated) {
        console.log('🚖 Cleaning up driver connection:', {
          socketId: socket.id,
          timestamp: Date.now()
        });
        socket.emit('driver:offline');
        setIsAuthenticated(false);
        authAttemptedRef.current = false;
      }
    };
  }, [socket, isAuthenticated]);

  // Enhanced location emission
  useEffect(() => {
    if (!isAuthenticated || !smoothedPosition || !isOnline || !socket) return;

    const now = Date.now();
    if (now - lastEmitTime.current < EMIT_INTERVAL) return;

    try {
      const locationData = {
        patente,
        lat: smoothedPosition.lat,
        lng: smoothedPosition.lng,
        accuracy: smoothedPosition.accuracy,
        accuracyLevel: smoothedPosition.accuracyLevel,
        speed: smoothedPosition.speed,
        heading: smoothedPosition.heading,
        altitude: smoothedPosition.altitude,
        altitudeAccuracy: smoothedPosition.altitudeAccuracy,
        timestamp: now,
        estado: 'DISPONIBLE'
      };

      socket.volatile.emit('taxi:location', locationData);
      lastEmitTime.current = now;
    } catch (error) {
      console.error('Error sending location update:', error);
      onError?.(error.message || 'Failed to send location update');
    }
  }, [smoothedPosition, socket, isOnline, isAuthenticated, patente, onError]);

  return {
    position: smoothedPosition,
    error: geoError,
    loading,
    isConnected,
    isConnecting,
    isAuthenticated,
    socket
  };
} 