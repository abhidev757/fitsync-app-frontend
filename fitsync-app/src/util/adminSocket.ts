import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectAdminSocket = (adminId: string) => {
  if (!socket || !socket.connected) {
    socket = io("http://localhost:4000", {
      transports: ["websocket"],
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("🟢 Admin connected to socket:", socket?.id);
      socket?.emit("register-admin", { adminId });
    });

    socket.on("disconnect", () => {
      console.log("❌ Admin socket disconnected");
    });
  }
  return socket;
};

export const disconnectAdminSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("🔌 Admin socket fully disconnected");
  }
};

export const getAdminSocket = (): Socket | null => socket;
