import { Socket } from "socket.io-client";

export interface SendMessagePayload {
    receiverId: string;
    message: string;
    image?: File;
  }

  export interface RawMessage {
    _id: string;
    text?: string;
    imageUrl?: string;
    senderId: string;
    createdAt: string;
  }

  declare global {
    interface Window {
      socket: Socket;
    }
  }
  