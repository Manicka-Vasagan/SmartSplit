// Singleton Socket.IO client hook.
// Creates one persistent connection for the entire app lifetime.
// GroupDetail registers join/leave-group events per room; this hook just returns the socket.

import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

// Derive the base URL (strip /api if VITE_API_URL is set)
const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000';

// Module-level singleton — shared across all hook calls
let socketInstance = null;

const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
  }
  return socketInstance;
};

const useSocket = () => {
  const socketRef = useRef(getSocket());

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket.connected) socket.connect();
    // Do NOT disconnect on unmount — singleton stays alive for the session
  }, []);

  return socketRef.current;
};

export default useSocket;
