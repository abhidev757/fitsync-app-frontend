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
  
  const [profilePic, setProfilePic] = useState("/images/pro-pic.svg");
  
  useEffect(() => {
    const storedPic = localStorage.getItem("profilePic");
    if (storedPic && storedPic !== "undefined" && storedPic !== "null" && storedPic.trim() !== "") {
      setProfilePic(storedPic);
    } else {
      setProfilePic("/images/pro-pic.svg");
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
    <header className="bg-black/60 backdrop-blur-xl border-b border-gray-900 p-4 md:p-5 sticky top-0 z-40">
      <div className="flex items-center justify-between max-w-[1600px] mx-auto gap-4">
        
        {/* Brand/Title - Hidden title on tiny mobile to save space */}
        <div className="flex flex-col shrink-0">
          <div className="flex items-center gap-2 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">
            <span className="hidden sm:inline">Protocol</span>
            <span className="hidden sm:inline text-[#CCFF00]">/</span>
            <span className="text-[#CCFF00] sm:text-gray-400">{getPageTitle()}</span>
          </div>
        </div>

        {/* Search Bar - Flexible width */}
        <div className={`relative flex-1 transition-all duration-500 max-w-sm md:max-w-none ${isTrainerListPage ? 'opacity-100' : 'opacity-40 md:opacity-50'}`}>
          <Search className={`absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 md:h-4 md:w-4 transition-colors ${isTrainerListPage ? 'text-[#CCFF00]' : 'text-gray-700'}`} />
          <Input
            placeholder={isTrainerListPage ? "Search unit..." : "Locked"}
            value={inputValue}
            onChange={handleSearchChange}
            className="pl-9 md:pl-12 bg-[#0B0B0B] border border-gray-900 text-white h-9 md:h-11 rounded-xl focus:border-[#CCFF00] focus:ring-0 transition-all placeholder-gray-800 text-[10px] md:text-xs font-bold uppercase tracking-widest italic"
            disabled={!isTrainerListPage}
          />
        </div>

        {/* Action Area */}
        <div className="flex items-center gap-3 md:gap-6 shrink-0">
          <div className="h-6 w-[1px] bg-gray-900 hidden md:block"></div>

          <div className="flex items-center gap-2 md:gap-4">
            {userInfo && socketReady && (
              <NotificationDropdown 
                userId={userInfo._id} 
                userType="user" 
                getSocket={getUserSocket} 
              />
            )}

            <Link to="/user/userProfile" className="relative group">
              <div className="absolute -inset-1 bg-[#CCFF00] rounded-full blur opacity-0 group-hover:opacity-20 transition-opacity"></div>
              <Avatar className="h-8 w-8 md:h-10 md:w-10 border border-gray-800 cursor-pointer transition-all group-hover:border-[#CCFF00]">
                {profilePic ? (
                  <img
                    src={profilePic}
                    alt="Member Profile"
                    className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                ) : (
                  <div className="bg-gray-900 h-full w-full flex items-center justify-center">
                    <User size={16} className="text-gray-600" />
                  </div>
                )}
              </Avatar>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;