// src/services/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let lastToken: string | null = null;

export const getSocket = () => socket;

/**
 * Create socket once (lazy singleton)
 */
function ensureSocket() {
  if (socket) return socket;

  socket = io("http://localhost:5000", {
    autoConnect: false,
    withCredentials: true,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    reconnectionDelayMax: 3000,
    timeout: 20000,
  });

  socket.on("connect", () => console.log("✅ socket connected:", socket?.id));
  socket.on("disconnect", (reason) =>
    console.log("⚠️ socket disconnected:", reason)
  );
  socket.on("connect_error", (err) =>
    console.log("❌ socket connect_error:", err.message)
  );

  return socket;
}

/**
 * Connect socket using latest token.
 * Safe to call multiple times (StrictMode etc.)
 */
export const connectSocket = (tokenArg?: string) => {
  const token = tokenArg ?? localStorage.getItem("token");
  if (!token) return null;

  const s = ensureSocket();

  // If token changed, update auth + reconnect if needed
  const tokenChanged = lastToken !== token;
  lastToken = token;

  s.auth = { token };

  // If already connected & token changed, force reconnect so middleware re-runs
  if (s.connected && tokenChanged) {
    s.disconnect();
    s.connect();
    return s;
  }

  // Normal connect
  if (!s.connected) s.connect();
  return s;
};

/**
 * Call this after your access token refresh succeeds.
 * It updates auth and reconnects only if necessary.
 */
export const syncSocketAuth = (token?: string) => {
  const s = socket;
  const nextToken = token ?? localStorage.getItem("token");
  if (!s || !nextToken) return;

  const tokenChanged = lastToken !== nextToken;
  lastToken = nextToken;

  s.auth = { token: nextToken };

  // If connected and token changed -> reconnect so server verifies new token
  if (s.connected && tokenChanged) {
    s.disconnect();
    s.connect();
  }
};

/**
 * Disconnect only on logout.
 */
export const disconnectSocket = () => {
  if (!socket) return;
  socket.disconnect();
};

/**
 * Hard reset (use on logout if you want to fully recreate socket next login)
 */
export const resetSocket = () => {
  if (!socket) return;
  socket.disconnect();
  socket.removeAllListeners();
  socket = null;
  lastToken = null;
};