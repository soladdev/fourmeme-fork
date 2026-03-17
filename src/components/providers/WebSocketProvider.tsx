import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { Token } from '@/interface/types';

interface WebSocketContextType {
  newTokens: Token[];
  newTransactions: unknown[];
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

const RECONNECT_DELAY_MS = 3000;
const MAX_RECONNECT_ATTEMPTS = 10;

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [newTokens, setNewTokens] = useState<Token[]>([]);
  const [newTransactions, setNewTransactions] = useState<unknown[]>([]);
  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout>>();

  const connect = useCallback(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_BASE_URL;
    if (!wsUrl) return null;

    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      reconnectAttempts.current = 0;
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'tokenCreated') {
          setNewTokens(prev => [data.data, ...prev]);
        } else if (data.type === 'tokensBought' || data.type === 'tokensSold') {
          setNewTransactions(prev => [data.data, ...prev]);
        }
      } catch {
        // Ignore malformed messages
      }
    };

    socket.onclose = () => {
      if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectTimeout.current = setTimeout(() => {
          reconnectAttempts.current += 1;
          connect();
        }, RECONNECT_DELAY_MS);
      }
    };

    socket.onerror = () => {
      socket.close();
    };

    return socket;
  }, []);

  useEffect(() => {
    const socket = connect();
    return () => {
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      socket?.close();
    };
  }, [connect]);

  return (
    <WebSocketContext.Provider value={{ newTokens, newTransactions }}>
      {children}
    </WebSocketContext.Provider>
  );
};