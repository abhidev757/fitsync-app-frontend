import { useLocation, Link } from "react-router-dom";
import { Search } from "lucide-react";
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
  
  // New state for the profile image URL.
  // This can come from local storage, a global context, or any user state.
  const [profilePic, setProfilePic] = useState("https://via.placeholder.com/40");
  
  useEffect(() => {
    // Example: Read the profile picture from localStorage
    // (Ensure that you update localStorage when the user updates their profile)
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

  // Extract page title from pathname
  const getPageTitle = () => {
    const path = location.pathname.split("/")[1];
    if (!path) return "Dashboard";
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <header className="border-b border-[#2a2a2a] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>Pages</span>
          <span>/</span>
          <span className="text-white">{getPageTitle()}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search any keywords"
              value={inputValue}
              onChange={handleSearchChange}
              className="pl-10 bg-[#1a1a1a] border-none h-10 focus:ring-1 focus:ring-[#d9ff00]"
              disabled={!isTrainerListPage}
            />
          </div>

          {userInfo && socketReady && (
            <NotificationDropdown 
              userId={userInfo._id} 
              userType="user" 
              getSocket={getUserSocket} 
            />
          )}

          <Link to="/user/userProfile" className="relative group">
            <Avatar className="cursor-pointer transition-transform hover:scale-105">
              <img
                src={profilePic}
                alt="User Profile"
                className="h-full w-full object-cover"
              />
            </Avatar>
            <span className="absolute -bottom-6 right-0 bg-[#2a2a2a] text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              View Profile
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
