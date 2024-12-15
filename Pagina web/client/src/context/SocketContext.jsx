import { createContext, useContext } from 'react';
import { useSocket } from '../hooks/useSocket';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const socketState = useSocket();

  return (
    <SocketContext.Provider value={socketState}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
}; 