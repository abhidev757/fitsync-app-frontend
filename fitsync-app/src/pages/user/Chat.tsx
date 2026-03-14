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

    subscribeToUserMessages((message: unknown) => {
      const data = message as RawMessage;
      const formattedMessage: Message = {
        _id: data._id || crypto.randomUUID(),
        text: data.text || "",
        imageUrl: data.imageUrl ?? undefined,
        sender: data.senderId === myUserId ? "user" : "trainer",
        senderName: data.senderId === myUserId ? "You" : trainer.name,
        timestamp: new Date(data.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, formattedMessage]);
    });

    return () => {
      socket.off("user-status-change");
      socket.off("receive-message");
      disconnectUserSocket();
    };
  }, [myUserId, trainerId, trainer.name]);

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

      const sentResponse = await sendMessages(trainerId, form);
      const sent = sentResponse.data || sentResponse;

      const uiMessage: Message = {
        _id: sent._id,
        text: newMessage || "",
        imageUrl: sent.imageUrl || undefined,
        sender: "user",
        senderName: "You",
        timestamp: new Date(sent.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, uiMessage]);
      setNewMessage("");
      setSelectedImage(null);
      sendMessageToUserSocket(trainerId, {
        ...sent,
        sender: "user",
        senderName: "You",
        receiverId: trainerId,
        senderId: myUserId,
      });
    } catch (err) {
      console.error("Send failed", err);
    }
  };

  return (
    /* Adjust height to account for layout padding, header, and mobile nav to prevent document scrolling */
    <div className="flex flex-col h-[calc(100dvh-150px)] md:h-[calc(100dvh-140px)] bg-black font-sans overflow-hidden">
      
      {/* Container Wrapper */}
      <div className="flex-1 flex flex-col md:m-4 bg-[#0B0B0B] md:rounded-[2rem] border-x md:border border-gray-900 overflow-hidden shadow-2xl relative">

        {/* Header - shrink-0 prevents it from squishing */}
        <div className="shrink-0 flex items-center justify-between p-4 md:p-6 border-b border-gray-900 bg-black/40 backdrop-blur-md z-20">
          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={() => navigate(-1)} className="p-1 md:p-2 text-gray-500 hover:text-white transition-colors">
              <ChevronLeft size={24} />
            </button>
            <div className="relative shrink-0">
              <div className="absolute -inset-1 bg-[#CCFF00] rounded-full blur opacity-10"></div>
              <img src={trainer.avatar} alt={trainer.name} className="relative w-10 h-10 md:w-12 md:h-12 rounded-full border border-gray-800 object-cover" />
              {isOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 md:w-3.5 md:h-3.5 bg-[#CCFF00] rounded-full border-2 border-[#0B0B0B] shadow-[0_0_10px_rgba(204,255,0,0.5)]"></span>
              )}
            </div>
            <div className="overflow-hidden">
              <h3 className="text-white font-black uppercase italic tracking-tighter text-sm md:text-lg leading-none truncate max-w-[120px] md:max-w-none">{trainer.name}</h3>
              <p className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest mt-1 ${isOnline ? 'text-[#CCFF00]' : 'text-gray-600'}`}>
                {isOnline ? "Link Established" : "Signal Offline"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            <button className="p-2 md:p-3 text-gray-400 hover:text-[#CCFF00] transition-colors"><Video size={18} /></button>
            <button className="p-2 md:p-3 text-gray-400 hover:text-[#CCFF00] transition-colors"><Phone size={18} /></button>
            <button className="p-2 md:p-3 text-gray-400 hover:text-white transition-colors"><MoreVertical size={18} /></button>
          </div>
        </div>

        {/* Chat Area - flex-1 and overflow-y-auto makes only THIS part scrollable */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] scroll-smooth">
          {messages.map((msg) => (
            <div key={msg._id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              
              {msg.sender === "trainer" && (
                <div className="flex gap-2 md:gap-3 max-w-[85%] md:max-w-[70%]">
                  <div className="bg-[#CCFF00] text-black p-3 md:p-4 rounded-2xl rounded-tl-none shadow-lg">
                    {msg.imageUrl ? (
                      <img src={msg.imageUrl} alt="attachment" className="max-w-full rounded-lg mb-2 max-h-[300px] object-contain" />
                    ) : (
                      <p className="text-xs md:text-sm font-bold leading-relaxed">{msg.text}</p>
                    )}
                    <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest mt-2 opacity-40 text-right">{msg.timestamp}</p>
                  </div>
                </div>
              )}

              {msg.sender === "user" && (
                <div className="flex items-end gap-2 md:gap-3 max-w-[85%] md:max-w-[70%]">
                  <div className="bg-gray-900 border border-gray-800 text-white p-3 md:p-4 rounded-2xl rounded-tr-none">
                    {msg.imageUrl ? (
                      <img src={msg.imageUrl} alt="attachment" className="max-w-full rounded-lg mb-2 max-h-[300px] object-contain" />
                    ) : (
                      <p className="text-xs md:text-sm font-medium leading-relaxed">{msg.text}</p>
                    )}
                    <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest mt-2 text-gray-600 text-right">{msg.timestamp}</p>
                  </div>
                  <img src={userInfo.avatar} alt={userInfo.name} className="w-6 h-6 md:w-8 md:h-8 rounded-full border border-gray-800 hidden md:block shrink-0" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Section - shrink-0 ensures it stays locked at the bottom */}
        <div className="shrink-0 p-4 md:p-6 bg-black/80 backdrop-blur-md border-t border-gray-900 md:bg-black/40">
          {selectedImage && (
            <div className="mb-3 p-2 bg-gray-900 rounded-xl flex items-center justify-between w-max gap-4 animate-in zoom-in-95 border border-gray-800">
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest px-2 text-[#CCFF00]">Asset Selected</span>
              <button onClick={() => setSelectedImage(null)} className="text-red-500 hover:text-white p-1"><X size={14} /></button>
            </div>
          )}
          <form onSubmit={handleSend} className="flex items-center gap-2 md:gap-4 bg-black border border-gray-800 p-1.5 md:p-2 rounded-2xl focus-within:border-[#CCFF00] transition-all">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 md:p-3 text-gray-500 hover:text-[#CCFF00] transition-colors shrink-0">
              <ImageIcon size={20} />
              <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={(e) => setSelectedImage(e.target.files?.[0] || null)} />
            </button>

            <input
              type="text"
              placeholder="Transmit signal..."
              className="flex-1 bg-transparent text-white px-1 md:px-2 py-2 focus:outline-none text-xs md:text-sm placeholder-gray-800 font-medium italic"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />

            <button
              type="submit"
              disabled={!newMessage.trim() && !selectedImage}
              className={`p-3 md:p-4 rounded-xl transition-all shrink-0 ${newMessage.trim() || selectedImage
                ? "bg-[#CCFF00] text-black shadow-[0_0_15px_rgba(204,255,0,0.3)] hover:scale-105 active:scale-95"
                : "bg-gray-900 text-gray-700 opacity-50 cursor-not-allowed"
                }`}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;