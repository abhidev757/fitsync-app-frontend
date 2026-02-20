import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
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

    // Fetch initial notifications
    const fetchNotifications = async () => {
      try {
        const response = await axiosInstance.get(`/notifications/${userId}?userType=${userType}`);
        setNotifications(response.data || []);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();

    // Listen for new notifications
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
  }, [userId, getSocket]);

  useEffect(() => {
    // Click outside to close
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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

  const handleToggle = () => {
    setIsOpen(!isOpen);
    // Optionally we can mark all as read here, but keeping it individual is fine
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={handleToggle} className="relative p-2 rounded-full hover:bg-gray-700/50 transition-colors">
        <Bell className="h-5 w-5 text-gray-400 hover:text-white" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-xl overflow-hidden z-50">
          <div className="p-4 border-b border-[#2a2a2a] flex justify-between items-center bg-[#242424]">
            <h3 className="font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded-full">{unreadCount} New</span>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification._id} 
                  onClick={() => handleMarkAsRead(notification._id, notification.isRead)}
                  className={`p-4 border-b border-[#2a2a2a] last:border-0 cursor-pointer transition-colors ${notification.isRead ? 'bg-[#1a1a1a] hover:bg-[#242424]' : 'bg-[#2a2a35] hover:bg-[#323240]'}`}
                >
                  <p className={`text-sm ${notification.isRead ? 'text-gray-300' : 'text-white font-medium'}`}>
                    {notification.message}
                  </p>
                  <span className="text-xs text-gray-500 block mt-2">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
