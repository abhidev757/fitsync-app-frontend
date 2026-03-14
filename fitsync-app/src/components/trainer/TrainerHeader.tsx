// src/components/trainer/TrainerHeader.tsx
import { useState, useEffect } from 'react';
import { Search, User, LayoutGrid, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import NotificationDropdown from '../common/NotificationDropdown';
import { getTrainerSocket, connectTrainerSocket } from '../../util/trainerSocket';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchTrainerProfile } from '../../axios/trainerApi';

const TrainerHeader = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
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
          if (profile?.profileImageUrl) setProfileImage(profile.profileImageUrl);
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
    <header className="bg-black/60 backdrop-blur-xl border-b border-gray-900 p-3 md:p-5 sticky top-0 z-40 w-full overflow-hidden">
      <div className="flex items-center justify-between mx-auto gap-2 md:gap-4 w-full">
        
        {/* Breadcrumb - Hidden on very small screens to favor logo/title */}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-gray-600 truncate">
            <LayoutGrid size={12} className="text-[#CCFF00] shrink-0" />
            <span className="hidden sm:inline">OPS</span>
            <span className="text-[#CCFF00] hidden sm:inline">/</span>
            <span className="text-gray-400 truncate max-w-full">{getPageTitle()}</span>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        {isSearchOpen && (
          <div className="absolute inset-0 bg-black z-50 flex items-center px-4 animate-in fade-in duration-200">
            <Search className="text-[#CCFF00] mr-3" size={18} />
            <input 
              autoFocus
              placeholder="SEARCH PERSONNEL..." 
              className="flex-1 bg-transparent border-none outline-none text-white text-xs font-black uppercase tracking-widest"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button onClick={() => setIsSearchOpen(false)} className="text-gray-500 p-2"><X size={20} /></button>
          </div>
        )}

        <div className="flex items-center gap-2 md:gap-6 shrink-0">
          {/* Tactical Search Bar - Desktop */}
          <div className="relative w-48 lg:w-80 group hidden md:block">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-700 group-focus-within:text-[#CCFF00] transition-colors" />
            <input
              type="text"
              placeholder="Search personnel..."
              className="w-full pl-12 pr-4 py-2.5 bg-[#0B0B0B] border border-gray-900 rounded-xl text-white focus:outline-none focus:border-[#CCFF00] transition-all text-[10px] font-black uppercase italic"
            />
          </div>

          {/* Mobile Search Toggle */}
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="p-2.5 bg-gray-900 rounded-xl text-gray-500 md:hidden active:scale-90 transition-transform"
          >
            <Search size={18} />
          </button>

          <div className="h-6 w-[1px] bg-gray-900 hidden sm:block"></div>

          {/* Action Area */}
          <div className="flex items-center gap-2 md:gap-4">
            {trainerInfo && socketReady && (
              <NotificationDropdown
                userId={trainerInfo._id}
                userType="trainer"
                getSocket={getTrainerSocket}
              />
            )}
            
            <div 
              className="relative group cursor-pointer active:scale-90 transition-transform"
              onClick={() => navigate('/trainer/trainerProfile')}
            >
              <div className="relative h-9 w-9 md:h-10 md:w-10 rounded-full border border-gray-800 overflow-hidden group-hover:border-[#CCFF00] bg-gray-900 flex items-center justify-center">
                {avatarSrc ? (
                  <img src={avatarSrc} className="h-full w-full object-cover grayscale md:group-hover:grayscale-0" alt="Profile" />
                ) : (
                  <User size={18} className="text-gray-600" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TrainerHeader;