import React, { useState, useRef, useEffect } from "react";
import { ImageIcon, Send, MoreVertical } from "lucide-react";
import {
  getUsersToChat,
  getMessages,
  sendMessages,
} from "../../axios/trainerApi";
import { RawMessage } from "../../types/chat.types";
import {
  connectTrainerSocket,
  disconnectTrainerSocket,
  getTrainerSocket,
  sendMessageToTrainerSocket,
  subscribeToTrainerMessages,
} from "../../util/trainerSocket";

type Message = {
  id: string;
  text?: string;
  imageUrl?: string | null;
  timestamp: string;
  sender: "user" | "trainer";
  senderName: string;
  date?: string;
};

type ChatPreview = {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
};

export default function TrainerChat() {
  const trainerId = localStorage.getItem("trainerId")!;
  const [chatPreviews, setChatPreviews] = useState<ChatPreview[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isUserOnline, setIsUserOnline] = useState(false);

  // useEffect(() => {
  //   connectTrainerSocket(trainerId);

  //   subscribeToTrainerMessages((message: any) => {
  //     const isTrainer = message.sender === "trainer";
  //     const uiMessage: Message = {
  //       id: message._id || Date.now().toString(),
  //       text: message.text,
  //       imageUrl: message.imageUrl ?? null,
  //       sender: isTrainer ? "trainer" : "user",
  //       senderName: isTrainer ? "You" : message.senderName || "User",
  //       timestamp: new Date().toLocaleTimeString([], {
  //         hour: "2-digit",
  //         minute: "2-digit",
  //       }),
  //       date: new Date().toLocaleDateString(),
  //     };

  //     if (
  //       message.senderId === selectedChatId ||
  //       message.receiverId === selectedChatId
  //     ) {
  //       setMessages((prev) => [...prev, uiMessage]);
  //     }
  //   });

  //   return () => {
  //     disconnectTrainerSocket();
  //   };
  // }, [trainerId, selectedChatId]);

  useEffect(() => {
    if (!trainerId || !selectedChatId) return;

    // 1) connect once
    connectTrainerSocket(trainerId);
    const socket = getTrainerSocket();
    if (!socket) return;

    // 2) subscribe to incoming chat messages
    subscribeToTrainerMessages((message: any) => {
      const isTrainer = message.sender === "trainer";
      const uiMessage: Message = {
        id: message._id || Date.now().toString(),
        text: message.text,
        imageUrl: message.imageUrl ?? null,
        sender: isTrainer ? "trainer" : "user",
        senderName: isTrainer ? "You" : message.senderName || "User",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        date: new Date().toLocaleDateString(),
      };

      if (
        message.senderId === selectedChatId ||
        message.receiverId === selectedChatId
      ) {
        setMessages((prev) => [...prev, uiMessage]);
      }
    });

    // 3) subscribe to status changes
    socket.on(
      "user-status-change",
      ({
        userId: changedId,
        isOnline,
      }: {
        userId: string;
        isOnline: boolean;
      }) => {
        if (changedId === selectedChatId) {
          setIsUserOnline(isOnline);
        }
      }
    );

    // cleanup
    return () => {
      socket.off("receive-message");
      socket.off("user-status-change");
      disconnectTrainerSocket();
    };
  }, [trainerId, selectedChatId]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load chat list
  useEffect(() => {
    getUsersToChat()
      .then((data) => {
        const previews = data.map((u: any) => ({
          id: u._id,
          name: u.name,
          avatar: u.profileImageUrl || "/placeholder.svg",
          lastMessage: u.lastMessage || "",
          lastMessageTime: u.lastMessageTime || "",
        }));
        console.log("chat list user details:", previews);

        setChatPreviews(previews);
        if (previews.length) setSelectedChatId(previews[0].id);
      })
      .catch(console.error);
  }, []);

  // Load conversation for selected chat
  useEffect(() => {
    if (!selectedChatId) return;
    getMessages(selectedChatId)
      .then((raw: RawMessage[]) => {
        const ui = raw.map((m) => {
          const isTrainer = m.senderId === trainerId;
          return {
            id: m._id,
            text: m.text,
            imageUrl: m.imageUrl ?? null,
            sender: isTrainer ? "trainer" : "user",
            senderName: isTrainer
              ? "You"
              : chatPreviews.find((c) => c.id === selectedChatId)?.name ||
                "User",
            timestamp: new Date(m.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            date: new Date(m.createdAt).toLocaleDateString(),
          };
        });
        setMessages(ui);
      })
      .catch(console.error);
  }, [selectedChatId, chatPreviews, trainerId]);

  const handleImageClick = () => fileInputRef.current?.click();
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSelectedImage(e.target.files?.[0] || null);

  const handleSendMessage = () => {
    if ((!newMessage.trim() && !selectedImage) || !selectedChatId) return;

    const msgId = Date.now().toString();
    const timestamp = new Date().toISOString();

    setMessages((prev) => [
      ...prev,
      {
        id: msgId,
        text: newMessage,
        imageUrl: selectedImage ? URL.createObjectURL(selectedImage) : null,
        sender: "trainer",
        senderName: "You",
        timestamp: new Date(timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        date: new Date(timestamp).toLocaleDateString(),
      },
    ]);

    const form = new FormData();
    form.append("text", newMessage);
    if (selectedImage) form.append("image", selectedImage);

    // 3) Send to server and then via socket
    sendMessages(selectedChatId, form)
      .then((sent) => {
        sendMessageToTrainerSocket(selectedChatId, {
          ...sent,
          sender: "trainer",
          senderName: "You",
          receiverId: selectedChatId,
        });
      })
      .catch(console.error);

    // 4) Clear inputs
    setNewMessage("");
    setSelectedImage(null);
  };

  const activeChatName =
    chatPreviews.find((c) => c.id === selectedChatId)?.name || "Select a chat";

  // Group by date
  const messagesByDate: Record<string, Message[]> = {};
  messages.forEach((msg) => {
    const key = msg.date || "Today";
    if (!messagesByDate[key]) messagesByDate[key] = [];
    messagesByDate[key].push(msg);
  });

  return (
    <div className="flex flex-col h-full bg-[#121212] text-white">
      <h1 className="text-2xl font-semibold px-6 py-4">Messages</h1>
      <div className="flex flex-1 gap-4 px-6 pb-6 overflow-hidden">
        {/* Chat List */}
        <div className="w-72 bg-[#1A1A1A] rounded-lg flex flex-col">
          <div className="flex-1 overflow-y-auto">
            {chatPreviews.map((chat) => (
              <div
                key={chat.id}
                className={`flex items-center p-3 hover:bg-gray-800 cursor-pointer ${
                  chat.id === selectedChatId ? "bg-gray-700" : ""
                }`}
                onClick={() => setSelectedChatId(chat.id)}
              >
                <img
                  src={chat.avatar}
                  className="w-10 h-10 rounded-full mr-3"
                  alt={chat.name}
                />
                <div>
                  <p className="font-medium text-white">{chat.name}</p>
                  <p className="text-xs text-gray-400">
                    {chat.lastMessageTime}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 bg-[#1A1A1A] rounded-lg flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium">{activeChatName}</span>
              <span
                className={`inline-block w-3 h-3 rounded-full ${
                  isUserOnline ? "bg-green-500" : "bg-gray-500"
                }`}
                title={isUserOnline ? "Online" : "Offline"}
              />
            </div>
            <MoreVertical size={20} className="text-gray-400" />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {Object.entries(messagesByDate).map(([date, msgs]) => (
              <div key={date} className="space-y-4">
                <div className="flex justify-center">
                  <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">
                    {date}
                  </span>
                </div>
                {msgs.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${
                      m.sender === "trainer" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        m.sender === "trainer" ? "bg-blue-600" : "bg-gray-700"
                      }`}
                    >
                      {m.imageUrl ? (
                        <img src={m.imageUrl} className="rounded" alt="" />
                      ) : (
                        <p>{m.text}</p>
                      )}
                      <div className="mt-1 text-xs text-gray-400 flex justify-end">
                        <span>{m.timestamp}</span>
                        <span className="ml-1">{m.senderName}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-800 flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleImageChange}
            />
            <button
              onClick={handleImageClick}
              className="text-gray-400 hover:text-white p-2"
            >
              <ImageIcon size={20} />
            </button>
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 bg-transparent text-white border-none rounded-full py-2 px-4 focus:outline-none"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() && !selectedImage}
              className={`p-2 rounded-full ${
                newMessage || selectedImage
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-400"
              }`}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
