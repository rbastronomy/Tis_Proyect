import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

export const useSocket = () => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

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
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        randomizationFactor: 0.5,
        timeout: 20000,
        autoConnect: true,
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
        reconnectAttempts.current = 0;
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('🔌 Socket connection error:', {
          error: error.message,
          id: socketRef.current?.id,
          url: baseUrl,
          attempt: reconnectAttempts.current + 1
        });
        setIsConnected(false);
        setIsConnecting(true);

        reconnectAttempts.current++;
        if (reconnectAttempts.current >= maxReconnectAttempts) {
          console.log('🔌 Max reconnection attempts reached');
          setIsConnecting(false);
          socketRef.current?.close();
        }
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', {
          reason,
          id: socketRef.current?.id
        });
        setIsConnected(false);
        
        // Handle different disconnect reasons
        if (reason === 'io server disconnect') {
          // Server forcefully disconnected, try to reconnect
          socketRef.current?.connect();
        }
        // If the disconnection was clean, don't reconnect automatically
        if (reason === 'io client disconnect') {
          setIsConnecting(false);
        }
      });

      // Handle reconnection attempts
      socketRef.current.on('reconnect_attempt', (attempt) => {
        console.log('🔌 Reconnection attempt:', attempt);
        setIsConnecting(true);
      });

      socketRef.current.on('reconnect', (attempt) => {
        console.log('🔌 Reconnected after', attempt, 'attempts');
        setIsConnecting(false);
        setIsConnected(true);
      });

      socketRef.current.on('reconnect_error', (error) => {
        console.error('🔌 Reconnection error:', error);
      });

      socketRef.current.on('reconnect_failed', () => {
        console.log('🔌 Failed to reconnect');
        setIsConnecting(false);
      });
    }
  }, []);

  useEffect(() => {
    connect();

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isConnected) {
        console.log('🔌 Page became visible, attempting to reconnect');
        socketRef.current?.connect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Handle online/offline events
    const handleOnline = () => {
      console.log('🔌 Browser is online, attempting to reconnect');
      socketRef.current?.connect();
    };

    window.addEventListener('online', handleOnline);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      
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