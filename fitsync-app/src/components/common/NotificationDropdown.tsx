import { useState, useEffect, useRef } from 'react';
import { Bell, Info, Activity, X } from 'lucide-react';
import { Socket } from 'socket.io-client';
import axiosInstance from '../../axios/axiosInstance';
import { formatDistanceToNow } from 'date-fns';

export interface INotification {
  _id: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationDropdownProps {
  userId: string;
  userType: 'user' | 'trainer' | 'admin';
  getSocket: () => Socket | null;
}

const NotificationDropdown = ({ userId, userType, getSocket }: NotificationDropdownProps) => {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchNotifications = async () => {
      try {
        const response = await axiosInstance.get(`/notifications/${userId}?userType=${userType}`);
        setNotifications(response.data || []);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();

    const socket = getSocket();
    if (socket) {
      socket.on('new-notification', (notification: INotification) => {
        setNotifications((prev) => [notification, ...prev]);
      });
    }

    return () => {
      if (socket) {
        socket.off('new-notification');
      }
    };
  }, [userId, getSocket, userType]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async (notificationId: string, isRead: boolean) => {
    if (isRead) return;
    try {
      await axiosInstance.put(`/notifications/read/${notificationId}`);
      setNotifications(prev => prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* BELL BUTTON */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`relative p-2.5 rounded-xl transition-all duration-300 ${isOpen ? 'bg-[#CCFF00]/10' : 'hover:bg-gray-900'}`}
      >
        <Bell className={`h-5 w-5 transition-colors ${unreadCount > 0 ? 'text-[#CCFF00]' : 'text-gray-500'}`} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#CCFF00] text-[9px] font-black text-black shadow-[0_0_10px_rgba(204,255,0,0.6)] animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* DROPDOWN */}
      {isOpen && (
        <div className="absolute right-0 mt-4 w-80 bg-[#0B0B0B] border border-gray-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
          
          {/* HEADER */}
          <div className="px-5 py-4 border-b border-gray-900 flex justify-between items-center bg-black/60 backdrop-blur-md">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">System Alerts</h3>
            {unreadCount > 0 && (
              <span className="text-[9px] font-black uppercase tracking-widest text-black bg-[#CCFF00] px-2 py-0.5 rounded shadow-[0_0_10px_rgba(204,255,0,0.2)]">
                {unreadCount} NEW
              </span>
            )}
          </div>
          
          {/* NOTIFICATION LIST - Scrollbar Hidden via CSS */}
          <div className="max-h-[380px] overflow-y-auto scrollbar-hide">
            <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
            
            {notifications.length === 0 ? (
              <div className="p-12 text-center">
                <Activity className="text-gray-800 mx-auto mb-3" size={24} />
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-700 italic">No Active Transmissions</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((n) => (
                  <div 
                    key={n._id} 
                    onClick={() => handleMarkAsRead(n._id, n.isRead)}
                    className={`px-5 py-5 cursor-pointer transition-all duration-300 border-b border-gray-900 last:border-0 relative group ${
                      !n.isRead ? 'bg-[#CCFF00]/[0.03]' : 'opacity-40'
                    }`}
                  >
                    {/* Unread Left Border */}
                    {!n.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#CCFF00]"></div>}
                    
                    <div className="flex gap-4 items-start">
                      <div className={`mt-0.5 p-2 rounded-lg border ${!n.isRead ? 'bg-black border-[#CCFF00]/30 text-[#CCFF00]' : 'bg-gray-900 border-gray-800 text-gray-700'}`}>
                         <Info size={14} />
                      </div>
                      <div className="flex-1">
                        <p className={`text-xs leading-relaxed uppercase tracking-tight italic ${!n.isRead ? 'text-white font-black' : 'text-gray-500 font-bold'}`}>
                          {n.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">
                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                          </span>
                          {!n.isRead && (
                             <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] shadow-[0_0_8px_rgba(204,255,0,0.8)]"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="p-4 bg-black/60 border-t border-gray-900 text-center">
             <button className="group flex items-center justify-center gap-2 mx-auto text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 hover:text-[#CCFF00] transition-colors">
                <X size={10} className="group-hover:rotate-90 transition-transform" /> 
                Purge Archive Logs
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;