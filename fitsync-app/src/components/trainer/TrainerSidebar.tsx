// src/components/trainer/TrainerSidebar.tsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, MessageSquare, BookOpen, Clock, Wallet, User, LogOut } from 'lucide-react';
import { logoutTrainer } from '../../slices/trainerAuthSlice';
import { LogoutTrainer } from '../../axios/trainerApi';
import { AppDispatch } from '../../store';
import { useDispatch } from 'react-redux';

const TrainerSidebar = () => {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await LogoutTrainer()
      dispatch(logoutTrainer());
      navigate('/trainer/trainerSignin');
    } catch (err) {
      console.log(err);
    }
  };
  
  const menuItems = [
    { path: '/trainer/trainerDashboard', label: 'Home', icon: Home },
    { path: '/trainer/sessions', label: 'Sessions', icon: Calendar },
    { path: '/trainer/chat', label: 'Chat', icon: MessageSquare },
    { path: '/trainer/bookings', label: 'Bookings', icon: BookOpen },
    { path: '/trainer/timeSlots', label: 'Current Schedules', icon: Clock },
    { path: '/trainer/wallet', label: 'Wallet', icon: Wallet },
    { path: '/trainer/trainerProfile', label: 'Account', icon: User },
  ];

  return (
    <div className="w-64 bg-gray-800 text-white h-screen">
      <div className="p-4">
        <h1 className="text-2xl font-bold">
          <span className="text-white">FIT</span>
          <span className="text-gray-400">SYNC</span>
        </h1>
      </div>
      
      <div className="p-4">
        <p className="text-xs text-gray-400 mb-2">Menu</p>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                  isActive 
                    ? 'bg-black text-white' 
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
          <button onClick={handleLogout} className="flex items-center px-4 py-3 rounded-md text-gray-300 hover:bg-gray-700 w-full text-left">
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </button>
        </nav>
      </div>
    </div>
  );
};

export default TrainerSidebar;