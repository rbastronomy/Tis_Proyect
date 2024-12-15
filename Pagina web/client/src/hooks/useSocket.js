import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

export const useSocket = () => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);

  const connect = useCallback(() => {
    if (!socketRef.current) {
      console.log('🔌 Initializing socket connection...');
      
      const protocol = 'ws:';
      const port = '3000';
      const host = import.meta.env.VITE_WS_URL || `${protocol}//${window.location.hostname}:${port}`;

      console.log('🔌 Connecting to WebSocket server:', host);

      socketRef.current = io(host, {
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ['websocket'],
        path: '/socket.io',
        secure: false,
        rejectUnauthorized: false
      });

      socketRef.current.on('connect', () => {
        console.log('🔌 Socket connected:', {
          id: socketRef.current.id,
          connected: socketRef.current.connected,
          transport: socketRef.current.io.engine.transport.name,
          url: host
        });
        setIsConnected(true);
        setIsConnecting(false);
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('🔌 Socket connection error:', {
          error: error.message,
          id: socketRef.current?.id,
          url: host
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