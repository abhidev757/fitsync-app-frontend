// src/components/trainer/TrainerHeader.tsx
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import NotificationDropdown from '../common/NotificationDropdown';
import { getTrainerSocket, connectTrainerSocket } from '../../util/trainerSocket';

const TrainerHeader = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const trainerInfo = useSelector((state: RootState) => state.trainerAuth.trainerInfo);
  const [socketReady, setSocketReady] = useState(false);

  useEffect(() => {
    if (trainerInfo?._id) {
      connectTrainerSocket(trainerInfo._id);
      setSocketReady(true);
    }
  }, [trainerInfo]);

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
          {trainerInfo && socketReady && (
            <NotificationDropdown 
              userId={trainerInfo._id} 
              userType="trainer" 
              getSocket={getTrainerSocket} 
            />
          )}
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