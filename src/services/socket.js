import { io } from 'socket.io-client';

// Determine Socket URL based on environment
const getSocketUrl = () => {
  // If explicitly set via environment variable, use it
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  
  // If running on Firebase hosting, use Firebase Functions URL (Socket.IO not supported in Functions v1, would need v2)
  // For now, Socket.IO will only work in local development
  if (window.location.hostname.includes('web.app') || window.location.hostname.includes('firebaseapp.com')) {
    // Note: Socket.IO requires WebSocket support which Firebase Functions v1 doesn't support
    // You would need to upgrade to Functions v2 or use a different real-time solution
    console.warn('Socket.IO is not available in production. Real-time features will be limited.');
    return null; // Disable socket in production for now
  }
  
  // Default to localhost for local development
  return 'http://localhost:5000';
};

const SOCKET_URL = getSocketUrl();

export const socket = SOCKET_URL ? io(SOCKET_URL, {
  autoConnect: false,
}) : null;

export const connectSocket = (userId) => {
  if (!socket) {
    console.warn('Socket.IO is not available. Real-time features disabled.');
    return;
  }
  try {
    socket.connect();
    if (userId) socket.emit('join-user-room', userId);
  } catch (error) {
    console.error('Error connecting socket:', error);
  }
};

export const disconnectSocket = () => {
  if (!socket) return;
  try {
    socket.disconnect();
  } catch (error) {
    console.error('Error disconnecting socket:', error);
  }
};

export default socket;

