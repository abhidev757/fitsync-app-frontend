import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectUserSocket = (userId: string) => {
    console.log('userId in connectUserSocket:',userId);
    
  if (!socket || !socket.connected) {
    socket = io("http://localhost:4000", {
      withCredentials: true,
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("🟢 User connected to socket:", socket?.id);
      console.log('userId in connect:',userId);
      socket?.emit("register-user", { userId });
    });

    socket.on("disconnect", () => {
      console.log("❌ User socket disconnected");
    });
  }
  return socket
};

export const sendMessageToUserSocket = (toUserId: string, message: unknown) => {
  if (socket) {
    socket.emit("private-message", { toUserId, message });
    console.log("📤 Sending message from user:", message);
  }
};

export const subscribeToUserMessages = (cb: (message: unknown) => void) => {
  if (socket) {
    socket.off("receive-message"); 
    socket.on("receive-message", (message) => {
      console.log("📥 User received real-time message:", message);
      cb(message);
    });
  }
};

export const disconnectUserSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("🔌 User socket fully disconnected");
  }
};

export const getUserSocket = (): Socket | null => socket;

