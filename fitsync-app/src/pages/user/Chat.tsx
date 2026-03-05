import React, { useState, useRef, useEffect } from "react";
import { Send, Video, Phone, ImageIcon, ChevronLeft, MoreVertical, X } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
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
          avatar: trainerRes.profileImageUrl || "/placeholder.svg",
        });

        setUserInfo({
          name: userRes.name,
          avatar: userRes.profileImageUrl || "/placeholder.svg",
        });
      } catch (err) {
        console.error("Failed to fetch info:", err);
      }
    };

    fetchData();
  }, [trainerId, myUserId]);

  useEffect(() => {
    if (!myUserId || !trainerId) return;
    connectUserSocket(myUserId);
    const socket = getUserSocket();
    if (!socket) return;
    socket.on("user-status-change", ({ userId, isOnline }: StatusChangePayload) => {
      if (userId === trainerId) setIsOnline(isOnline);
    });
    return () => {
      socket.off("user-status-change");
      disconnectUserSocket();
    };
  }, [myUserId, trainerId]);

  useEffect(() => {
    if (!myUserId) return;
    connectUserSocket(myUserId);
    subscribeToUserMessages((message: unknown) => {
      const socketMessage = message as { data: RawMessage };
      const data = socketMessage.data;
      const formattedMessage: Message = {
        _id: data._id || crypto.randomUUID(),
        text: data.text || "",
        imageUrl: data.imageUrl ?? undefined,
        sender: data.senderId === myUserId ? "user" : "trainer",
        senderName: data.senderId === myUserId ? "You" : trainer.name,
        timestamp: new Date(data.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, formattedMessage]);
    });
    return () => disconnectUserSocket();
  }, [myUserId, trainer.name]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!trainerId) return;
    getMessages(trainerId).then((raw: RawMessage[]) => {
      const uiMessages: Message[] = raw.map((m) => ({
        _id: m._id,
        text: m.text,
        imageUrl: m.imageUrl ?? undefined,
        sender: m.senderId === myUserId ? "user" : "trainer",
        senderName: m.senderId === myUserId ? "You" : trainer.name,
        timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }));
      setMessages(uiMessages);
    }).catch(console.error);
  }, [trainerId, myUserId, trainer.name]);

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
        timestamp: new Date(sent.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, uiMessage]);
      setNewMessage("");
      setSelectedImage(null);
      sendMessageToUserSocket(trainerId, { text: newMessage, senderId: myUserId });
    } catch (err) {
      console.error("Send failed", err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black font-sans">
      <div className="flex-1 flex flex-col md:mx-4 md:my-4 bg-[#0B0B0B] md:rounded-[2rem] border border-gray-900 overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-900 bg-black/40 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 text-gray-500 hover:text-white transition-colors">
              <ChevronLeft size={24} />
            </button>
            <div className="relative">
              <div className="absolute -inset-1 bg-[#CCFF00] rounded-full blur opacity-10"></div>
              <img src={trainer.avatar} alt={trainer.name} className="relative w-12 h-12 rounded-full border border-gray-800 object-cover" />
              {isOnline && (
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#CCFF00] rounded-full border-2 border-[#0B0B0B] shadow-[0_0_10px_rgba(204,255,0,0.5)]"></span>
              )}
            </div>
            <div>
              <h3 className="text-white font-black uppercase italic tracking-tighter text-lg leading-none">{trainer.name}</h3>
              <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${isOnline ? 'text-[#CCFF00]' : 'text-gray-600'}`}>
                {isOnline ? "Link Established" : "Signal Offline"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-3 text-gray-400 hover:text-[#CCFF00] transition-colors"><Video size={20} /></button>
            <button className="p-3 text-gray-400 hover:text-[#CCFF00] transition-colors"><Phone size={20} /></button>
            <button className="p-3 text-gray-400 hover:text-white transition-colors"><MoreVertical size={20} /></button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
          {messages.map((msg) => (
            <div key={msg._id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>

              {/* Trainer Message Bubble */}
              {msg.sender === "trainer" && (
                <div className="flex gap-3 max-w-[80%]">
                  <div className="bg-[#CCFF00] text-black p-4 rounded-2xl rounded-tl-none shadow-[0_5px_15px_rgba(204,255,0,0.1)]">
                    {msg.imageUrl ? (
                      <img src={msg.imageUrl} alt="attachment" className="max-w-full rounded-lg mb-2" />
                    ) : (
                      <p className="text-sm font-bold leading-relaxed">{msg.text}</p>
                    )}
                    <p className="text-[9px] font-black uppercase tracking-widest mt-2 opacity-40 text-right">{msg.timestamp}</p>
                  </div>
                </div>
              )}

              {/* User Message Bubble */}
              {msg.sender === "user" && (
                <div className="flex items-end gap-3 max-w-[80%]">
                  <div className="bg-gray-900 border border-gray-800 text-white p-4 rounded-2xl rounded-tr-none">
                    {msg.imageUrl ? (
                      <img src={msg.imageUrl} alt="attachment" className="max-w-full rounded-lg mb-2" />
                    ) : (
                      <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                    )}
                    <p className="text-[9px] font-black uppercase tracking-widest mt-2 text-gray-600 text-right">{msg.timestamp}</p>
                  </div>
                  <img src={userInfo.avatar} alt={userInfo.name} className="w-8 h-8 rounded-full border border-gray-800 hidden md:block" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-6 bg-black/40 backdrop-blur-md border-t border-gray-900">
          {selectedImage && (
            <div className="mb-4 p-2 bg-gray-900 rounded-xl flex items-center justify-between w-max gap-4 animate-in zoom-in-95">
              <span className="text-[10px] font-black uppercase tracking-widest px-2 text-[#CCFF00]">Image Selected</span>
              <button onClick={() => setSelectedImage(null)} className="text-red-500 hover:text-white"><X size={14} /></button>
            </div>
          )}
          <form onSubmit={handleSend} className="flex items-center gap-4 bg-black border border-gray-800 p-2 rounded-2xl focus-within:border-[#CCFF00] transition-all">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-500 hover:text-[#CCFF00] transition-colors">
              <ImageIcon size={22} />
              <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={(e) => setSelectedImage(e.target.files?.[0] || null)} />
            </button>

            <input
              type="text"
              placeholder="Transmit message..."
              className="flex-1 bg-transparent text-white px-2 py-2 focus:outline-none text-sm placeholder-gray-700 font-medium italic"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />

            <button
              type="submit"
              disabled={!newMessage.trim() && !selectedImage}
              className={`p-4 rounded-xl transition-all ${newMessage.trim() || selectedImage
                ? "bg-[#CCFF00] text-black shadow-[0_0_15px_rgba(204,255,0,0.3)] hover:scale-105 active:scale-95"
                : "bg-gray-900 text-gray-700 opacity-50 cursor-not-allowed"
                }`}
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;