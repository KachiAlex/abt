import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
  autoConnect: false,
});

export const connectSocket = (userId) => {
  try {
    socket.connect();
    if (userId) socket.emit('join-user-room', userId);
  } catch {}
};

export const disconnectSocket = () => {
  try {
    socket.disconnect();
  } catch {}
};

export default socket;

