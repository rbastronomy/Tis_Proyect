import { useEffect, useState, useRef } from 'react';
import { useSocketContext } from '../context/SocketContext';
import { useGeolocation } from './useGeolocation';

export function useDriverLocation({ 
  isOnline, 
  driverId, 
  patente, 
  onError 
}) {
  const { socket, isConnected, isConnecting } = useSocketContext();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const authTimeoutRef = useRef(null);
  const authAttemptedRef = useRef(false);
  const lastLoggedAccuracy = useRef(null);

  const { position, error: geoError, loading } = useGeolocation({ 
    skip: !isOnline || !isAuthenticated,
    enableHighAccuracy: true,
    timeout: 30000,
    maximumAge: 0,
    retryOnError: true,
    maxRetries: 5,
    minUpdateInterval: 2000,
    validateAccuracy: (accuracy) => {
      if (accuracy > 50) {
        console.warn(`Low accuracy: ${accuracy.toFixed(0)}m - Retrying...`);
        return false;
      }
      return true;
    }
  });

  // Add position smoothing
  const [smoothedPosition, setSmoothedPosition] = useState(null);
  const positionBuffer = useRef([]);
  const BUFFER_SIZE = 3;

  useEffect(() => {
    if (!position) return;

    // Add new position to buffer
    positionBuffer.current.push(position);
    
    // Keep buffer size limited
    if (positionBuffer.current.length > BUFFER_SIZE) {
      positionBuffer.current.shift();
    }

    // Calculate smoothed position (average of buffer)
    if (positionBuffer.current.length >= 2) {
      const smoothed = {
        lat: positionBuffer.current.reduce((sum, pos) => sum + pos.latitude, 0) / positionBuffer.current.length,
        lng: positionBuffer.current.reduce((sum, pos) => sum + pos.longitude, 0) / positionBuffer.current.length,
        accuracy: position.accuracy,
        speed: position.speed,
        heading: position.heading,
        timestamp: position.timestamp
      };
      setSmoothedPosition(smoothed);
    } else {
      setSmoothedPosition({
        lat: position.latitude,
        lng: position.longitude,
        accuracy: position.accuracy,
        speed: position.speed,
        heading: position.heading,
        timestamp: position.timestamp
      });
    }
  }, [position]);

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
        onError?.(new Error('Authentication timed out'));
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
      onError?.(error);
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

  // Update the location emission logic
  useEffect(() => {
    if (!isAuthenticated || !smoothedPosition || !isOnline || !socket) return;

    try {
      const locationData = {
        patente,
        lat: smoothedPosition.lat,
        lng: smoothedPosition.lng,
        accuracy: smoothedPosition.accuracy,
        speed: smoothedPosition.speed,
        heading: smoothedPosition.heading,
        timestamp: Date.now(),
        estado: 'DISPONIBLE'
      };

      socket.volatile.emit('taxi:location', locationData);
    } catch (error) {
      console.error('Error sending location update:', error);
      onError?.(error);
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