// src/components/trainer/TrainerHeader.tsx
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import NotificationDropdown from '../common/NotificationDropdown';
import { getTrainerSocket, connectTrainerSocket } from '../../util/trainerSocket';
import { useNavigate } from 'react-router-dom';
import { fetchTrainerProfile } from '../../axios/trainerApi';

const TrainerHeader = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const trainerInfo = useSelector((state: RootState) => state.trainerAuth.trainerInfo);
  const [socketReady, setSocketReady] = useState(false);
  const [profileImage, setProfileImage] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    if (trainerInfo?._id) {
      connectTrainerSocket(trainerInfo._id);
      setSocketReady(true);

      // Fetch profile to get the latest profileImageUrl
      fetchTrainerProfile(trainerInfo._id)
        .then((profile) => {
          if (profile?.profileImageUrl) {
            setProfileImage(profile.profileImageUrl);
          }
        })
        .catch((err) => console.error('Failed to fetch trainer profile image:', err));
    }
  }, [trainerInfo]);

  const avatarSrc =
    profileImage ||
    trainerInfo?.profileImageUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(trainerInfo?.name || 'T')}&background=d9ff00&color=000&size=40`;

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
            src={avatarSrc}
            alt="Profile"
            className="h-10 w-10 rounded-full cursor-pointer object-cover ring-2 ring-transparent hover:ring-[#d9ff00] transition-all"
            onClick={() => navigate('/trainer/trainerProfile')}
          />
        </div>
      </div>
    </header>
  );
};

export default TrainerHeader;