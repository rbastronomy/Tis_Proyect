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

  const { position, error: geoError } = useGeolocation({ 
    skip: !isOnline || !isAuthenticated,
    enableHighAccuracy: true,
    timeout: 30000,
    maximumAge: 0,
    retryOnError: true,
    maxRetries: 3,
    minUpdateInterval: 1000,
    validateAccuracy: (accuracy) => {
      if (accuracy > 100) {
        if (!lastLoggedAccuracy.current || Math.abs(lastLoggedAccuracy.current - accuracy) > 50) {
          console.warn(`Low accuracy: ${accuracy.toFixed(0)}m - Retrying...`);
          lastLoggedAccuracy.current = accuracy;
        }
        return false;
      }
      return true;
    }
  });

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

  // Send location updates when position changes
  useEffect(() => {
    if (!isAuthenticated || !position || !isOnline || !socket) return;

    try {
      socket.volatile.emit('location:update', {
        patente,
        latitude: position.latitude,
        longitude: position.longitude,
        accuracy: position.accuracy,
        speed: position.speed,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error sending location update:', error);
      onError?.(error);
    }
  }, [position, socket, isOnline, isAuthenticated, patente, onError]);

  return {
    position,
    error: geoError,
    isConnected,
    isConnecting,
    isAuthenticated
  };
} 