import { useLocation, Link } from "react-router-dom";
import { Search, User } from "lucide-react";
import { Avatar } from "./ui/avatar";
import { Input } from "./ui/input";
import { useTrainerSearchStore } from "../../util/useSearchTrainer";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import NotificationDropdown from "../common/NotificationDropdown";
import { getUserSocket, connectUserSocket } from "../../util/userSocket";

const Header = () => {
  const location = useLocation();
  const { setSearchQuery } = useTrainerSearchStore();
  const [inputValue, setInputValue] = useState("");
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const [socketReady, setSocketReady] = useState(false);
  
  const [profilePic, setProfilePic] = useState("/placeholder.svg");
  
  useEffect(() => {
    const storedPic = localStorage.getItem("profilePic");
    if (storedPic) {
      setProfilePic(storedPic);
    }
  }, []);

  useEffect(() => {
    if (userInfo?._id) {
      connectUserSocket(userInfo._id);
      setSocketReady(true);
    }
  }, [userInfo]);

  const isTrainerListPage = location.pathname === "/user/trainersList";

  useEffect(() => {
    if (!isTrainerListPage) {
      setSearchQuery(""); 
      setInputValue("");
    }
  }, [isTrainerListPage, setSearchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (isTrainerListPage) {
      setSearchQuery(value);
    }
  };

  const getPageTitle = () => {
    const path = location.pathname.split("/").pop();
    if (!path || path === "dashboard") return "Command Center";
    return path.replace(/([A-Z])/g, ' $1').trim().toUpperCase();
  };

  return (
    <header className="bg-black/40 backdrop-blur-md border-b border-gray-900 p-5 sticky top-0 z-40">
      <div className="flex items-center justify-between max-w-[1600px] mx-auto">
        
        {/* Breadcrumb / Title Area */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">
            <span>Protocol</span>
            <span className="text-[#CCFF00]">/</span>
            <span className="text-gray-400">{getPageTitle()}</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Search Bar */}
          <div className={`relative transition-all duration-500 ${isTrainerListPage ? 'w-96' : 'w-64 opacity-50'}`}>
            <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors ${isTrainerListPage ? 'text-[#CCFF00]' : 'text-gray-700'}`} />
            <Input
              placeholder="Search personnel..."
              value={inputValue}
              onChange={handleSearchChange}
              className="pl-12 bg-[#0B0B0B] border border-gray-900 text-white h-11 rounded-xl focus:border-[#CCFF00] focus:ring-0 transition-all placeholder-gray-700 text-xs font-bold uppercase tracking-widest italic"
              disabled={!isTrainerListPage}
            />
          </div>

          <div className="h-6 w-[1px] bg-gray-900 hidden md:block"></div>

          {/* Action Area */}
          <div className="flex items-center gap-4">
            {userInfo && socketReady && (
              <NotificationDropdown 
                userId={userInfo._id} 
                userType="user" 
                getSocket={getUserSocket} 
              />
            )}

            <Link to="/user/userProfile" className="relative group">
              <div className="absolute -inset-1 bg-[#CCFF00] rounded-full blur opacity-0 group-hover:opacity-20 transition-opacity"></div>
              <Avatar className="h-10 w-10 border border-gray-800 cursor-pointer transition-all group-hover:border-[#CCFF00]">
                {profilePic ? (
                  <img
                    src={profilePic}
                    alt="Member Profile"
                    className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                ) : (
                  <div className="bg-gray-900 h-full w-full flex items-center justify-center">
                    <User size={18} className="text-gray-600" />
                  </div>
                )}
              </Avatar>
              
              {/* Tooltip */}
              <span className="absolute -bottom-10 right-0 bg-[#CCFF00] text-black text-[9px] font-black uppercase tracking-widest py-1.5 px-3 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 whitespace-nowrap pointer-events-none">
                Access Profile
              </span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;