import { io } from 'socket.io-client';

// In a Capacitor native app window.location.origin is capacitor://localhost,
// so we fall back to the live server URL.
const API_URL = import.meta.env.VITE_API_URL || window.location.origin;

export const socket = io(API_URL, { autoConnect: false });
