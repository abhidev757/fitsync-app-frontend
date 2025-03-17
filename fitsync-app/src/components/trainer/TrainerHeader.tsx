// src/components/trainer/TrainerHeader.tsx
import { useState } from 'react';
import { Search, Bell } from 'lucide-react';

const TrainerHeader = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(3);

  return (
    <header className="bg-gray-800 border-b border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search Task"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative">
            <Bell className="h-6 w-6 text-gray-400" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                {notifications}
              </span>
            )}
          </button>
          <img
            src="/placeholder.svg?height=40&width=40"
            alt="Profile"
            className="h-10 w-10 rounded-full"
          />
        </div>
      </div>
    </header>
  );
};

export default TrainerHeader;