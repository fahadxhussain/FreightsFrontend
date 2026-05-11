import { io, Socket } from "socket.io-client";

const REALTIME_URL =
  process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:3005";

let socket: Socket | null = null;

export function getSocket(accessToken: string): Socket {
  if (socket && socket.connected) {
    return socket;
  }

  socket = io(REALTIME_URL, {
    auth: { token: accessToken },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
  });

  socket.on("connect", () => {
    console.log("[SOCKET] connected");
  });

  socket.on("disconnect", (reason) => {
    console.log("[SOCKET] disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.error("[SOCKET] connect_error:", err.message);
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export { socket };
