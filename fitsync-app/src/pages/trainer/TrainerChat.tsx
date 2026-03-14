import { useState, useRef, useEffect } from "react";
import { ImageIcon, Send, MoreVertical, User, X, ChevronLeft } from "lucide-react";
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
  const [showMobileChat, setShowMobileChat] = useState(false);

  useEffect(() => {
    if (!trainerId) return;
    connectTrainerSocket(trainerId);
    const socket = getTrainerSocket();
    if (!socket) return;

    subscribeToTrainerMessages((message: any) => {
      const isTrainer = message.sender === "trainer";
      const uiMessage: Message = {
        id: message._id || Date.now().toString(),
        text: message.text,
        imageUrl: message.imageUrl ?? null,
        sender: isTrainer ? "trainer" : "user",
        senderName: isTrainer ? "You" : message.senderName || "User",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        date: new Date().toLocaleDateString(),
      };

      if (message.senderId === selectedChatId || message.receiverId === selectedChatId) {
        setMessages((prev) => [...prev, uiMessage]);
      }
    });

    socket.on("user-status-change", ({ userId: changedId, isOnline }: { userId: string; isOnline: boolean; }) => {
      if (changedId === selectedChatId) setIsUserOnline(isOnline);
    });

    return () => {
      socket.off("receive-message");
      socket.off("user-status-change");
      disconnectTrainerSocket();
    };
  }, [trainerId, selectedChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    getUsersToChat().then((data) => {
      const previews = data.map((u: any) => ({
        id: u._id,
        name: u.name,
        avatar: u.profileImageUrl || "",
        lastMessage: u.lastMessage || "",
        lastMessageTime: u.lastMessageTime || "",
      }));
      setChatPreviews(previews);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedChatId) return;
    getMessages(selectedChatId).then((raw: RawMessage[]) => {
      const ui: Message[] = raw.map((m) => {
        const isTrainer = m.senderId === trainerId;
        return {
          id: m._id,
          text: m.text,
          imageUrl: m.imageUrl ?? null,
          sender: isTrainer ? "trainer" : "user",
          senderName: isTrainer ? "You" : chatPreviews.find((c) => c.id === selectedChatId)?.name || "User",
          timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          date: new Date(m.createdAt).toLocaleDateString(),
        };
      });
      setMessages(ui);
    }).catch(console.error);
  }, [selectedChatId, trainerId, chatPreviews]);

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

    sendMessages(selectedChatId, form).then((sentResponse) => {
      const sent = sentResponse.data || sentResponse;
      sendMessageToTrainerSocket(selectedChatId, { ...sent, sender: "trainer", senderName: "You", receiverId: selectedChatId });
    }).catch(console.error);

    setNewMessage("");
    setSelectedImage(null);
  };

  const selectChat = (id: string) => {
    setSelectedChatId(id);
    setShowMobileChat(true);
  };

  const activeChat = chatPreviews.find((c) => c.id === selectedChatId);
  const messagesByDate: Record<string, Message[]> = {};
  messages.forEach((msg) => {
    const key = msg.date || "Today";
    if (!messagesByDate[key]) messagesByDate[key] = [];
    messagesByDate[key].push(msg);
  });

  return (
    <div className="flex flex-col h-[calc(100dvh-140px)] md:h-[calc(100dvh-120px)] bg-black text-white font-sans overflow-hidden rounded-bl-none md:rounded-3xl border border-gray-900 border-b-0 md:border-b">
      
      {/* Dynamic Header */}
      <header className="px-6 md:px-8 py-4 md:py-6 shrink-0">
        <p className="text-[#CCFF00] font-black text-[9px] md:text-[10px] tracking-[0.4em] uppercase mb-1">Encrypted Comms</p>
        <h1 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter">Comms Grid</h1>
      </header>

      <div className="flex flex-1 gap-0 md:gap-6 px-0 md:px-8 pb-0 md:pb-8 overflow-hidden relative">
        
        {/* Personnel Roster - Hidden on mobile when chat is active */}
        <div className={`
          ${showMobileChat ? 'hidden' : 'flex'} 
          md:flex w-full md:w-80 bg-[#0B0B0B] md:border md:border-gray-900 md:rounded-[2.5rem] flex-col overflow-hidden transition-all
        `}>
          <div className="p-6 border-b border-gray-900 flex justify-between items-center">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 italic">Active Channels</h3>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {chatPreviews.length === 0 ? (
              <p className="text-center py-10 text-gray-700 text-[10px] font-black uppercase tracking-widest">No Signals Detected</p>
            ) : (
              chatPreviews.map((chat) => (
                <div
                  key={chat.id}
                  className={`flex items-center p-5 cursor-pointer transition-all border-l-4 md:border-l-2 ${chat.id === selectedChatId ? "bg-[#CCFF00]/5 border-[#CCFF00]" : "border-transparent hover:bg-gray-900"}`}
                  onClick={() => selectChat(chat.id)}
                >
                  <div className="relative shrink-0 mr-4">
                    {chat.avatar ? (
                      <img src={chat.avatar} className="w-12 h-12 rounded-2xl object-cover grayscale" alt="" />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center border border-gray-800"><User size={20} className="text-gray-700" /></div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className={`font-black uppercase italic tracking-tight text-sm truncate ${chat.id === selectedChatId ? "text-[#CCFF00]" : "text-white"}`}>{chat.name}</p>
                    <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest truncate">Contact: {chat.lastMessageTime || "Syncing..."}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tactical Terminal - Full screen on mobile when active */}
        <div className={`
          ${!showMobileChat ? 'hidden' : 'flex'} 
          md:flex flex-1 bg-[#0B0B0B] md:border md:border-gray-900 md:rounded-[2.5rem] flex-col overflow-hidden relative shadow-2xl transition-all
        `}>
          {selectedChatId ? (
            <>
              {/* Terminal Header */}
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-900 bg-black/40 backdrop-blur-md shrink-0 z-10">
                <div className="flex items-center gap-3 md:gap-4">
                  <button onClick={() => setShowMobileChat(false)} className="md:hidden p-1 text-[#CCFF00] active:scale-90 transition-transform">
                    <ChevronLeft size={24} />
                  </button>
                  <div className="relative">
                    <div className={`absolute -inset-1 rounded-full blur-sm opacity-20 ${isUserOnline ? "bg-[#CCFF00]" : "bg-gray-600"}`}></div>
                    <div className={`relative w-2.5 h-2.5 md:w-3 md:h-3 rounded-full border-2 border-black ${isUserOnline ? "bg-[#CCFF00]" : "bg-gray-700"}`} />
                  </div>
                  <div>
                    <h2 className="text-sm md:text-lg font-black uppercase italic tracking-tighter text-white truncate max-w-[120px] md:max-w-none">{activeChat?.name}</h2>
                    <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-[#CCFF00]">{isUserOnline ? "Live Link" : "Signal Offline"}</p>
                  </div>
                </div>
                <button className="p-2 text-gray-600 hover:text-white"><MoreVertical size={20} /></button>
              </div>

              {/* Messages Engine */}
              <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                {Object.entries(messagesByDate).map(([date, msgs]) => (
                  <div key={date} className="space-y-6">
                    <div className="flex justify-center">
                      <span className="bg-gray-900/80 border border-gray-800 text-gray-500 font-black px-4 py-1 rounded-full text-[8px] md:text-[9px] uppercase tracking-[0.3em] backdrop-blur-sm">{date}</span>
                    </div>
                    {msgs.map((m) => (
                      <div key={m.id} className={`flex ${m.sender === "trainer" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                        <div className={`group relative max-w-[85%] md:max-w-[70%] ${m.sender === "trainer" ? "items-end" : "items-start"}`}>
                          <div className={`p-3 md:p-4 rounded-2xl transition-all ${m.sender === "trainer" ? "bg-[#CCFF00] text-black font-bold rounded-tr-none shadow-lg" : "bg-gray-900 border border-gray-800 text-white rounded-tl-none"}`}>
                            {m.imageUrl ? (
                              <img src={m.imageUrl} className="rounded-xl border border-black/10 shadow-lg max-h-[300px] object-contain" alt="" />
                            ) : (
                              <p className="text-xs md:text-sm leading-relaxed tracking-tight font-medium italic">{m.text}</p>
                            )}
                          </div>
                          <div className={`mt-1.5 flex items-center gap-2 text-[7px] md:text-[8px] font-black uppercase tracking-widest ${m.sender === "trainer" ? "flex-row-reverse text-gray-600" : "text-gray-700"}`}>
                            <span>{m.timestamp}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-900"></span>
                            <span>{m.senderName}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Control */}
              <div className="p-4 md:p-6 bg-black/60 backdrop-blur-md border-t border-gray-900 shrink-0">
                {selectedImage && (
                  <div className="mb-4 relative inline-block animate-in zoom-in-95">
                    <img src={URL.createObjectURL(selectedImage)} className="h-16 w-16 md:h-20 md:w-20 object-cover rounded-xl border-2 border-[#CCFF00] shadow-2xl" alt="" />
                    <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-red-600 p-1.5 rounded-full shadow-lg active:scale-75 transition-transform"><X size={12} /></button>
                  </div>
                )}
                <div className="flex items-center gap-2 md:gap-4 bg-black border border-gray-800 rounded-2xl p-1.5 md:p-2 pl-3 md:pl-4 focus-within:border-[#CCFF00]/50 transition-all">
                  <button onClick={() => fileInputRef.current?.click()} className="text-gray-600 hover:text-[#CCFF00] transition-colors p-2 shrink-0"><ImageIcon size={20} /></button>
                  <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={(e) => setSelectedImage(e.target.files?.[0] || null)} />
                  <input
                    type="text"
                    placeholder="Communicate..."
                    className="flex-1 bg-transparent text-xs md:text-sm font-bold italic text-white focus:outline-none placeholder-gray-800"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() && !selectedImage}
                    className={`p-3 md:p-4 rounded-xl transition-all active:scale-95 shrink-0 ${newMessage || selectedImage ? "bg-[#CCFF00] text-black shadow-[0_0_15px_rgba(204,255,0,0.3)]" : "bg-gray-900 text-gray-700 opacity-50"}`}
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
               <Activity className="text-gray-800 mb-4 animate-pulse" size={48} />
               <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-700 italic">Select Personnel to initiate Comms</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const Activity = ({ size, className }: { size: number, className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);