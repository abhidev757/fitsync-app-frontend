import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectTrainerSocket = (trainerId: string) => {
  if (!socket || !socket.connected) {
    socket = io("http://localhost:4000", {
      transports: ["websocket"],
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("🟢 Trainer connected to socket:", socket?.id);
      socket?.emit("register-trainer", {trainerId});
    });

    socket.on("disconnect", () => {
      console.log("❌ Trainer socket disconnected");
    });
  }
};

export const sendMessageToTrainerSocket = (toUserId: string, message: any) => {
  if (socket) {
    socket.emit("private-message", { toUserId, message });
    console.log("📤 Sending message from trainer:", message);
  }
};

export const subscribeToTrainerMessages = (cb: (message: any) => void) => {
  if (socket) {
    socket.off("receive-message"); 
    socket.on("receive-message", (message) => {
      console.log("📥 Trainer received real-time message:", message);
      cb(message);
    });
  }
};

export const disconnectTrainerSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("🔌 Trainer socket fully disconnected");
  }
};


export const getTrainerSocket = (): Socket | null => socket;
