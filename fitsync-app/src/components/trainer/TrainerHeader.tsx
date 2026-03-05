// src/components/trainer/TrainerHeader.tsx
import { useState, useEffect } from 'react';
import { Search, User, LayoutGrid } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import NotificationDropdown from '../common/NotificationDropdown';
import { getTrainerSocket, connectTrainerSocket } from '../../util/trainerSocket';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchTrainerProfile } from '../../axios/trainerApi';

const TrainerHeader = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const trainerInfo = useSelector((state: RootState) => state.trainerAuth.trainerInfo);
  const [socketReady, setSocketReady] = useState(false);
  const [profileImage, setProfileImage] = useState<string>('');
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (trainerInfo?._id) {
      connectTrainerSocket(trainerInfo._id);
      setSocketReady(true);

      fetchTrainerProfile(trainerInfo._id)
        .then((profile) => {
          if (profile?.profileImageUrl) {
            setProfileImage(profile.profileImageUrl);
          }
        })
        .catch((err) => console.error('Failed to fetch trainer profile image:', err));
    }
  }, [trainerInfo]);

  const avatarSrc = profileImage || trainerInfo?.profileImageUrl;

  const getPageTitle = () => {
    const path = location.pathname.split("/").pop();
    if (!path || path === "trainerDashboard") return "Command Center";
    return path.replace(/([A-Z])/g, ' $1').trim().toUpperCase();
  };

  return (
    <header className="bg-black/40 backdrop-blur-md border-b border-gray-900 p-5 sticky top-0 z-40">
      <div className="flex items-center justify-between max-w-[1600px] mx-auto">
        
        {/* Breadcrumb / Title Area */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">
            <LayoutGrid size={12} className="text-[#CCFF00]" />
            <span>OPS</span>
            <span className="text-[#CCFF00]">/</span>
            <span className="text-gray-400">{getPageTitle()}</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Tactical Search Bar */}
          <div className="relative w-80 group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-700 group-focus-within:text-[#CCFF00] transition-colors" />
            <input
              type="text"
              placeholder="Search personnel or tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-[#0B0B0B] border border-gray-900 rounded-xl text-white focus:outline-none focus:border-[#CCFF00] transition-all placeholder-gray-800 text-[10px] font-black uppercase tracking-widest italic"
            />
          </div>

          <div className="h-6 w-[1px] bg-gray-900 hidden md:block"></div>

          {/* Action Area */}
          <div className="flex items-center gap-4">
            {trainerInfo && socketReady && (
              <NotificationDropdown
                userId={trainerInfo._id}
                userType="trainer"
                getSocket={getTrainerSocket}
              />
            )}
            
            <div 
              className="relative group cursor-pointer"
              onClick={() => navigate('/trainer/trainerProfile')}
            >
              {/* Profile Glow Effect */}
              <div className="absolute -inset-1 bg-[#CCFF00] rounded-full blur opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
              
              <div className="relative h-10 w-10 rounded-full border border-gray-800 overflow-hidden group-hover:border-[#CCFF00] transition-all duration-300 bg-gray-900 flex items-center justify-center">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt="Expert Profile"
                    className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                ) : (
                  <User size={18} className="text-gray-600 group-hover:text-[#CCFF00]" />
                )}
              </div>

              {/* Tactical Tooltip */}
              <span className="absolute -bottom-10 right-0 bg-[#CCFF00] text-black text-[9px] font-black uppercase tracking-widest py-1.5 px-3 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 whitespace-nowrap pointer-events-none">
                Manage Identity
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TrainerHeader;