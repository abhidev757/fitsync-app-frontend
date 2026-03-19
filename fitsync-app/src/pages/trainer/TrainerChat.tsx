import { useState, useRef, useEffect } from "react";
import { ImageIcon, Send, MoreVertical, User, X } from "lucide-react";
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

  useEffect(() => {
    if (!trainerId || !selectedChatId) return;

    connectTrainerSocket(trainerId);
    const socket = getTrainerSocket();
    if (!socket) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

      if (message.senderId === selectedChatId || message.receiverId === selectedChatId) {
        setMessages((prev) => [...prev, uiMessage]);
      }
    });

    socket.on("user-status-change", ({ userId: changedId, isOnline }: { userId: string; isOnline: boolean; }) => {
      if (changedId === selectedChatId) {
        setIsUserOnline(isOnline);
      }
    });

    return () => {
      socket.off("receive-message");
      socket.off("user-status-change");
      disconnectTrainerSocket();
    };
  }, [trainerId, selectedChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  useEffect(() => {
    getUsersToChat()
      .then((data) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const previews = data.map((u: any) => ({
          id: u._id,
          name: u.name,
          avatar: u.profileImageUrl || "",
          lastMessage: u.lastMessage || "",
          lastMessageTime: u.lastMessageTime || "",
        }));
        setChatPreviews(previews);
        setSelectedChatId((prev) => prev || (previews.length > 0 ? previews[0].id : null));
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedChatId) return;
    getMessages(selectedChatId)
      .then((raw: RawMessage[]) => {
        if (!Array.isArray(raw)) {
          console.error("Expected an array of messages, got:", raw);
          return;
        }
        const ui: Message[] = raw.map((m) => {
          const isTrainer = m.senderId === trainerId;
          return {
            id: m._id,
            text: m.text,
            imageUrl: m.imageUrl ?? null,
            sender: (isTrainer ? "trainer" : "user") as "trainer" | "user",
            senderName: isTrainer ? "You" : chatPreviews.find((c) => c.id === selectedChatId)?.name || "User",
            timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            date: new Date(m.createdAt).toLocaleDateString(),
          };
        });
        setMessages(ui);
      })
      .catch(console.error);
  }, [selectedChatId, chatPreviews, trainerId]);

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
        timestamp: new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        date: new Date(timestamp).toLocaleDateString(),
      },
    ]);

    const form = new FormData();
    form.append("text", newMessage);
    if (selectedImage) form.append("image", selectedImage);

    sendMessages(selectedChatId, form)
      .then((sentResponse) => {
        const sent = sentResponse.data || sentResponse;
        sendMessageToTrainerSocket(selectedChatId, {
          ...sent,
          sender: "trainer",
          senderName: "You",
          receiverId: selectedChatId,
        });
      })
      .catch(console.error);

    setNewMessage("");
    setSelectedImage(null);
  };

  const activeChat = chatPreviews.find((c) => c.id === selectedChatId);

  const messagesByDate: Record<string, Message[]> = {};
  messages.forEach((msg) => {
    const key = msg.date || "Today";
    if (!messagesByDate[key]) messagesByDate[key] = [];
    messagesByDate[key].push(msg);
  });

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-black text-white font-sans overflow-hidden">
      <header className="px-8 py-6">
        <p className="text-[#CCFF00] font-black text-[10px] tracking-[0.4em] uppercase mb-1">Encrypted Communication</p>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">Comms Grid</h1>
      </header>

      <div className="flex flex-1 gap-6 px-8 pb-8 overflow-hidden">
        {/* Personnel Roster (Chat List) */}
        <div className="w-80 bg-[#0B0B0B] border border-gray-900 rounded-[2.5rem] flex flex-col overflow-hidden">
          <div className="p-6 border-b border-gray-900">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Active Channels</h3>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {chatPreviews.map((chat) => (
              <div
                key={chat.id}
                className={`flex items-center p-4 cursor-pointer transition-all border-l-2 ${chat.id === selectedChatId
                  ? "bg-[#CCFF00]/5 border-[#CCFF00]"
                  : "border-transparent hover:bg-gray-900"
                  }`}
                onClick={() => setSelectedChatId(chat.id)}
              >
                <div className="relative shrink-0 mr-4">
                  {chat.avatar ? (
                    <img src={chat.avatar} className="w-11 h-11 rounded-2xl object-cover grayscale" alt="" />
                  ) : (
                    <div className="w-11 h-11 rounded-2xl bg-gray-900 flex items-center justify-center border border-gray-800">
                      <User size={18} className="text-gray-600" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className={`font-black uppercase italic tracking-tight text-sm truncate ${chat.id === selectedChatId ? "text-[#CCFF00]" : "text-white"}`}>
                    {chat.name}
                  </p>
                  <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest truncate">
                    Last Contact: {chat.lastMessageTime || "N/A"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tactical Terminal (Chat Window) */}
        <div className="flex-1 bg-[#0B0B0B] border border-gray-900 rounded-[2.5rem] flex flex-col overflow-hidden relative shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-900 bg-black/40 backdrop-blur-md relative z-10">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className={`absolute -inset-1 rounded-full blur-sm opacity-20 ${isUserOnline ? "bg-[#CCFF00]" : "bg-gray-600"}`}></div>
                <div className={`relative w-3 h-3 rounded-full border-2 border-black ${isUserOnline ? "bg-[#CCFF00]" : "bg-gray-700"}`} />
              </div>
              <div>
                <h2 className="text-lg font-black uppercase italic tracking-tighter text-white">
                  {activeChat?.name || "Initializing..."}
                </h2>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#CCFF00]">
                  {isUserOnline ? "Signal Active" : "Signal Lost"}
                </p>
              </div>
            </div>
            <button className="p-2 text-gray-600 hover:text-white transition-colors">
              <MoreVertical size={20} />
            </button>
          </div>

          {/* Messages Grid */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar relative">
            {Object.entries(messagesByDate).map(([date, msgs]) => (
              <div key={date} className="space-y-6">
                <div className="flex justify-center">
                  <span className="bg-gray-900/80 border border-gray-800 text-gray-500 font-black px-4 py-1 rounded-full text-[9px] uppercase tracking-[0.3em] backdrop-blur-sm">
                    {date}
                  </span>
                </div>
                {msgs.map((m) => (
                  <div key={m.id} className={`flex ${m.sender === "trainer" ? "justify-end" : "justify-start"}`}>
                    <div className={`group relative max-w-[70%] ${m.sender === "trainer" ? "items-end" : "items-start"}`}>
                      <div className={`p-4 rounded-2xl transition-all ${m.sender === "trainer"
                        ? "bg-[#CCFF00] text-black font-bold rounded-tr-none shadow-[0_0_20px_rgba(204,255,0,0.1)]"
                        : "bg-gray-900 border border-gray-800 text-white rounded-tl-none"
                        }`}>
                        {m.imageUrl ? (
                          <img
                            src={m.imageUrl}
                            className="max-w-[200px] max-h-[200px] w-auto h-auto rounded-xl border border-black/10 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            alt=""
                            onClick={() => window.open(m.imageUrl!, '_blank')}
                          />
                        ) : (
                          <p className="text-sm leading-relaxed tracking-tight font-medium italic">{m.text}</p>
                        )}
                      </div>
                      <div className={`mt-2 flex items-center gap-2 text-[8px] font-black uppercase tracking-widest ${m.sender === "trainer" ? "flex-row-reverse text-gray-500" : "text-gray-600"}`}>
                        <span>{m.timestamp}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-800"></span>
                        <span>{m.senderName}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Interface */}
          <div className="p-6 bg-black/40 backdrop-blur-md border-t border-gray-900">
            {selectedImage && (
              <div className="mb-4 relative inline-block group">
                <img src={URL.createObjectURL(selectedImage)} className="h-20 w-20 object-cover rounded-xl border-2 border-[#CCFF00]" alt="" />
                <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-red-600 p-1 rounded-full shadow-lg">
                  <X size={12} />
                </button>
              </div>
            )}
            <div className="flex items-center gap-4 bg-black border border-gray-800 rounded-2xl p-2 px-4 focus-within:border-[#CCFF00]/50 transition-all">
              <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={(e) => setSelectedImage(e.target.files?.[0] || null)} />
              <button onClick={() => fileInputRef.current?.click()} className="text-gray-600 hover:text-[#CCFF00] transition-colors p-2">
                <ImageIcon size={20} />
              </button>

              <input
                type="text"
                placeholder="Secure transmission..."
                className="flex-1 bg-transparent text-sm font-bold italic tracking-tight text-white focus:outline-none placeholder-gray-800"
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
                className={`p-3 rounded-xl transition-all active:scale-95 ${newMessage || selectedImage
                  ? "bg-[#CCFF00] text-black shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                  : "bg-gray-900 text-gray-700"
                  }`}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}