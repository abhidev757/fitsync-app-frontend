import React, { useState, useRef, useEffect } from "react";
import { Send, Video, Phone, ImageIcon } from "lucide-react";
import { useParams } from "react-router-dom";
import {
  fetchTrainer,
  fetchUserProfile,
  getMessages,
  sendMessages,
} from "../../axios/userApi";
import { RawMessage } from "../../types/chat.types";
import {
  connectUserSocket,
  disconnectUserSocket,
  getUserSocket,
  sendMessageToUserSocket,
  subscribeToUserMessages,
} from "../../util/userSocket";

interface Message {
  _id: string;
  text?: string;
  imageUrl?: string;
  sender: "user" | "trainer";
  senderName: string;
  timestamp: string;
}

type StatusChangePayload = {
  userId: string;
  isOnline: boolean;
};

const ChatPage: React.FC = () => {
  const { id: trainerId } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const myUserId = localStorage.getItem("userId");
  const [isOnline, setIsOnline] = useState(false);

  const [trainer, setTrainer] = useState<{ name: string; avatar: string }>({
    name: "",
    avatar: "",
  });
  const [userInfo, setUserInfo] = useState<{ name: string; avatar: string }>({
    name: "",
    avatar: "",
  });

  useEffect(() => {
    if (!trainerId || !myUserId) return;

    const fetchData = async () => {
      try {
        const [trainerRes, userRes] = await Promise.all([
          fetchTrainer(trainerId),
          fetchUserProfile(myUserId),
        ]);

        setTrainer({
          name: trainerRes.name,
          avatar:
            trainerRes.profileImageUrl || "https://via.placeholder.com/40",
        });

        setUserInfo({
          name: userRes.name,
          avatar: userRes.profileImageUrl || "https://via.placeholder.com/40",
        });
      } catch (err) {
        console.error("Failed to fetch user or trainer info:", err);
      }
    };

    fetchData();
  }, [trainerId, myUserId]);

  //Online indicator

  useEffect(() => {
    if (!myUserId || !trainerId) return;

    connectUserSocket(myUserId);

    // Handle status change
    const socket = getUserSocket();
    if (!socket) return;
    socket.on(
      "user-status-change",
      ({ userId, isOnline }: StatusChangePayload) => {
        if (userId === trainerId) {
          setIsOnline(isOnline);
        }
      }
    );
    console.log("online Status:",isOnline)

    return () => {
      socket.off("user-status-change");
      disconnectUserSocket();
    };
  }, [myUserId, trainerId]);

  useEffect(() => {
    if (!myUserId) return;

    // Connect user socket
    connectUserSocket(myUserId);

    // Subscribe to incoming messages
    subscribeToUserMessages((socketMessage: any) => {
      const data = socketMessage.data;

      const formattedMessage: Message = {
        _id: data._id || crypto.randomUUID(),
        text: data.text || "",
        imageUrl: data.imageUrl ?? undefined,
        sender: data.senderId === myUserId ? "user" : "trainer",
        senderName: data.senderId === myUserId ? "You" : trainer.name,
        timestamp: new Date(data.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, formattedMessage]);
    });

    return () => {
      disconnectUserSocket();
    };
  }, [myUserId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load messages
  useEffect(() => {
    if (!trainerId) return;
    getMessages(trainerId)
      .then((raw: RawMessage[]) => {
        const uiMessages: Message[] = raw.map((m) => ({
          _id: m._id,
          text: m.text,
          imageUrl: m.imageUrl ?? undefined,
          sender: m.senderId === myUserId ? "user" : "trainer",
          senderName: m.senderId === myUserId ? "You" : trainer.name,
          timestamp: new Date(m.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));
        setMessages(uiMessages);
      })
      .catch(console.error);
  }, [trainerId]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedImage(e.target.files?.[0] || null);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if ((!newMessage.trim() && !selectedImage) || !trainerId) return;

    try {
      const form = new FormData();
      form.append("text", newMessage);
      if (selectedImage) form.append("image", selectedImage);

      const sent = await sendMessages(trainerId, form);

      const uiMessage: Message = {
        _id: sent._id,
        text: newMessage || "",
        imageUrl: sent.imageUrl || undefined,
        sender: "user",
        senderName: "You",
        timestamp: new Date(sent.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, uiMessage]);

      // Clear inputs
      setNewMessage("");
      setSelectedImage(null);

      // Send message to trainer via socket
      sendMessageToUserSocket(trainerId, {
        text: newMessage,
        senderId: myUserId,
      });
      setNewMessage("");
    } catch (err) {
      console.error("Send failed", err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#121212]">
      <div className="flex-1 flex flex-col mx-4 my-2 bg-[#1a1a1a] rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a]">
          <div className="flex items-center">
            <img
              src={trainer.avatar}
              alt={trainer.name}
              className="w-10 h-10 rounded-full mr-3"
            />
            {isOnline && (
              <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1a1a1a]" ></span>
            )}
            <div>
              <h3 className="text-[#d9ff00] font-medium">{trainer.name}</h3>
              <p className="text-gray-400 text-sm">{isOnline ? "Online" : "Offline"}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="bg-blue-500 hover:bg-blue-600 p-2 rounded-full">
              <Video size={20} className="text-white" />
            </button>
            <button className="bg-green-500 hover:bg-green-600 p-2 rounded-full">
              <Phone size={20} className="text-white" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "trainer" && (
                <div className="flex max-w-[80%]">
                  <div className="bg-[#d9ff00] text-black p-3 rounded-lg rounded-tl-none">
                    {msg.imageUrl ? (
                      <img
                        src={msg.imageUrl}
                        alt="attachment"
                        className="max-w-full rounded"
                      />
                    ) : (
                      msg.text
                    )}
                    <div className="mt-1 text-xs text-gray-400 flex justify-end">
                      <span>{msg.timestamp}</span>
                    </div>
                  </div>
                </div>
              )}
              {msg.sender === "user" && (
                <div className="flex items-end max-w-[80%]">
                  <div className="bg-[#2a2a2a] text-white p-3 rounded-lg rounded-tr-none mr-2">
                    {msg.imageUrl ? (
                      <img
                        src={msg.imageUrl}
                        alt="attachment"
                        className="max-w-full rounded"
                      />
                    ) : (
                      msg.text
                    )}
                    <div className="mt-1 text-xs text-gray-400 flex justify-end">
                      <span>{msg.timestamp}</span>
                    </div>
                  </div>
                  <img
                    src={userInfo.avatar}
                    alt={userInfo.name}
                    className="w-8 h-8 rounded-full"
                  />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSend}
          className="p-4 border-t border-[#2a2a2a] flex items-center gap-2"
        >
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleImageChange}
          />
          <button
            type="button"
            onClick={handleImageClick}
            className="text-gray-400 hover:text-white p-2"
          >
            <ImageIcon size={20} />
          </button>
          <input
            type="text"
            placeholder="Type a message…"
            className="flex-1 bg-[#2a2a2a] text-white px-4 py-2 rounded-full focus:outline-none"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            type="submit"
            className={`p-2 rounded-full ${
              newMessage.trim() || selectedImage
                ? "bg-[#2a2a2a] hover:bg-[#3a3a3a] text-[#d9ff00]"
                : "bg-[#2a2a2a] text-gray-600 cursor-not-allowed"
            }`}
            disabled={!newMessage.trim() && !selectedImage}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
