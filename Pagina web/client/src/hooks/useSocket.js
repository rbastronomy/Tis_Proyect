import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

export const useSocket = () => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);

  const connect = useCallback(() => {
    if (!socketRef.current) {
      console.log('🔌 Initializing socket connection...');
      socketRef.current = io(import.meta.env.VITE_WS_URL || 'http://localhost:3000', {
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current.on('connect', () => {
        console.log('🔌 Socket connected:', {
          id: socketRef.current.id,
          connected: socketRef.current.connected
        });
        setIsConnected(true);
        setIsConnecting(false);
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('🔌 Socket connection error:', {
          error: error.message,
          id: socketRef.current?.id
        });
        setIsConnected(false);
        setIsConnecting(false);
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', {
          reason,
          id: socketRef.current?.id
        });
        setIsConnected(false);
      });
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (socketRef.current) {
        console.log('Cleaning up socket connection');
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
        setIsConnecting(false);
      }
    };
  }, [connect]);

  return {
    socket: socketRef.current,
    isConnected,
    isConnecting
  };
}; 