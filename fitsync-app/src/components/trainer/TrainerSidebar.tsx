// src/components/trainer/TrainerSidebar.tsx
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  MessageSquare,
  BookOpen,
  Clock,
  Wallet,
  User,
  LogOut,
  Video,
  Star
} from 'lucide-react';
import { logoutTrainer } from '../../slices/trainerAuthSlice';
import { LogoutTrainer } from '../../axios/trainerApi';
import { AppDispatch } from '../../store';
import { useDispatch } from 'react-redux';

const TrainerSidebar = () => {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await LogoutTrainer();
      dispatch(logoutTrainer());
      localStorage.removeItem('trainerId');
      navigate('/trainer/trainerSignin');
    } catch (err) {
      console.log(err);
    }
  };

  const menuItems = [
    { path: '/trainer/trainerDashboard', label: 'Command', icon: LayoutGrid },
    { path: '/trainer/trainerLiveSessions', label: 'Live Link', icon: Video },
    { path: '/trainer/trainerChat', label: 'Comms', icon: MessageSquare },
    { path: '/trainer/bookings', label: 'Roster', icon: BookOpen },
    { path: '/trainer/timeSlots', label: 'Schedule', icon: Clock },
    { path: '/trainer/wallet', label: 'Assets', icon: Wallet },
    { path: '/trainer/trainerReviews', label: 'Feedback', icon: Star },
    { path: '/trainer/trainerProfile', label: 'Identity', icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-24 bg-[#0B0B0B] min-h-screen flex flex-col items-center py-10 border-r border-gray-900 sticky top-0 left-0 z-50">

      {/* Brand Identity */}
      <div className="mb-16">
        <Link to="/trainer/trainerDashboard" className="group relative">
          <div className="absolute -inset-2 bg-[#CCFF00] rounded-full blur opacity-0 group-hover:opacity-10 transition-opacity"></div>
          <div className="relative text-center leading-none">
            <span className="block text-[10px] font-black tracking-[0.3em] text-white">TS</span>
            <span className="block text-[10px] font-black tracking-[0.3em] text-[#CCFF00]">OPS</span>
          </div>
        </Link>
      </div>

      {/* Tactical Navigation */}
      <nav className="flex-1 flex flex-col items-center space-y-6 w-full">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative w-full flex justify-center group py-2"
            >
              {/* Active Protocol Indicator */}
              {active && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#CCFF00] shadow-[0_0_10px_rgba(204,255,0,0.8)] rounded-r-full animate-in slide-in-from-left-2 duration-300"></div>
              )}

              <div className={`p-3.5 rounded-2xl transition-all duration-300 ${active
                  ? "bg-[#CCFF00]/10 text-[#CCFF00] shadow-[inset_0_0_15px_rgba(204,255,0,0.05)]"
                  : "text-gray-600 hover:text-white hover:bg-white/5"
                }`}>
                <Icon size={22} />
              </div>

              {/* Tactical Tooltip */}
              <span className="absolute left-20 bg-[#CCFF00] text-black text-[9px] font-black uppercase tracking-widest py-1.5 px-3 rounded shadow-2xl opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 whitespace-nowrap pointer-events-none z-50">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Termination Area */}
      <div className="mt-auto w-full flex flex-col items-center pb-4">
        <div className="w-8 h-[1px] bg-gray-900 mb-8"></div>
        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className="group relative flex justify-center w-full py-2"
        >
          <div className="p-3.5 rounded-2xl text-gray-700 hover:text-red-500 hover:bg-red-500/10 transition-all">
            <LogOut size={22} />
          </div>

          <span className="absolute left-20 bg-red-500 text-white text-[9px] font-black uppercase tracking-widest py-1.5 px-3 rounded shadow-2xl opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 whitespace-nowrap pointer-events-none z-50">
            Terminate
          </span>
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-6">
          <div className="bg-[#0B0B0B] border border-gray-900 rounded-3xl p-8 w-full max-w-sm shadow-[0_0_50px_rgba(204,255,0,0.05)]">
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2 text-center">Terminate Session?</h3>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest text-center mb-8">Confirm to exit FitSync Command Center</p>
            <div className="flex gap-4">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsLogoutModalOpen(false);
                  handleLogout();
                }}
                className="flex-1 py-4 bg-[#CCFF00] hover:shadow-[0_0_20px_rgba(204,255,0,0.3)] text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TrainerSidebar;