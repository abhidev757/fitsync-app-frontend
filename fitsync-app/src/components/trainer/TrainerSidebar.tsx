// src/components/trainer/TrainerSidebar.tsx
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutGrid, MessageSquare, BookOpen, Clock, Wallet, User, LogOut, Video, Star
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
    } catch (err) { console.log(err); }
  };

  // Primary items for mobile bottom bar
  const primaryMenu = [
    { path: '/trainer/trainerDashboard', label: 'Command', icon: LayoutGrid },
    { path: '/trainer/trainerLiveSessions', label: 'Live', icon: Video },
    { path: '/trainer/trainerChat', label: 'Comms', icon: MessageSquare },
    { path: '/trainer/bookings', label: 'Roster', icon: BookOpen },
    { path: '/trainer/timeSlots', label: 'Slots', icon: Clock },
  ];

  // Secondary items (could be in a "More" menu on mobile if needed, but here we list all)
  const secondaryMenu = [
    { path: '/trainer/wallet', label: 'Assets', icon: Wallet },
    { path: '/trainer/trainerReviews', label: 'Feedback', icon: Star },
    { path: '/trainer/trainerProfile', label: 'Identity', icon: User },
  ];

  const allItems = [...primaryMenu, ...secondaryMenu];
  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* DESKTOP SIDEBAR - Hidden on mobile */}
      <div className="hidden md:flex w-24 bg-[#0B0B0B] min-h-screen flex-col items-center py-10 border-r border-gray-900 sticky top-0 left-0 z-50">
        <div className="mb-16">
          <Link to="/trainer/trainerDashboard" className="group relative text-center leading-none">
            <span className="block text-[10px] font-black tracking-[0.3em] text-white uppercase">TS</span>
            <span className="block text-[10px] font-black tracking-[0.3em] text-[#CCFF00] uppercase">Ops</span>
          </Link>
        </div>

        <nav className="flex-1 flex flex-col items-center space-y-6 w-full">
          {allItems.map((item) => (
            <SidebarLink key={item.path} item={item} active={isActive(item.path)} />
          ))}
        </nav>

        <button onClick={() => setIsLogoutModalOpen(true)} className="mt-auto p-3.5 rounded-2xl text-gray-700 hover:text-red-500 hover:bg-red-500/10 transition-all mb-4">
          <LogOut size={22} />
        </button>
      </div>

      {/* MOBILE BOTTOM NAVIGATION - Visible only on mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-lg border-t border-gray-900 px-2 py-2 z-50 flex justify-around items-center">
        {primaryMenu.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link key={item.path} to={item.path} className="flex flex-col items-center p-2 min-w-[64px]">
              <div className={`p-2 rounded-xl transition-all ${active ? "text-[#CCFF00] bg-[#CCFF00]/10 shadow-[0_0_10px_rgba(204,255,0,0.2)]" : "text-gray-500"}`}>
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              </div>
              <span className={`text-[8px] font-black uppercase tracking-widest mt-1 ${active ? "text-[#CCFF00]" : "text-gray-600"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
        {/* Toggle Logout or More */}
        <button onClick={() => setIsLogoutModalOpen(true)} className="flex flex-col items-center p-2 min-w-[64px] text-gray-500">
          <div className="p-2 rounded-xl"><LogOut size={20} /></div>
          <span className="text-[8px] font-black uppercase tracking-widest mt-1">Exit</span>
        </button>
      </div>

      {/* Logout Modal - Universal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-6">
          <div className="bg-[#0B0B0B] border border-gray-900 rounded-[2rem] p-8 w-full max-w-sm animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-2 text-center">Terminate Session?</h3>
            <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest text-center mb-8">Registry disconnect required for exit</p>
            <div className="flex gap-3">
              <button onClick={() => setIsLogoutModalOpen(false)} className="flex-1 py-4 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Cancel</button>
              <button onClick={handleLogout} className="flex-1 py-4 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const SidebarLink = ({ item, active }: { item: any, active: boolean }) => {
  const Icon = item.icon;
  return (
    <Link to={item.path} className="relative w-full flex justify-center group py-2">
      {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#CCFF00] shadow-[0_0_10px_#CCFF00] rounded-r-full"></div>}
      <div className={`p-3.5 rounded-2xl transition-all duration-300 ${active ? "bg-[#CCFF00]/10 text-[#CCFF00]" : "text-gray-600 hover:text-white hover:bg-white/5"}`}>
        <Icon size={22} />
      </div>
      <span className="absolute left-20 bg-[#CCFF00] text-black text-[9px] font-black uppercase tracking-widest py-1.5 px-3 rounded shadow-2xl opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 whitespace-nowrap pointer-events-none z-50">
        {item.label}
      </span>
    </Link>
  );
};

export default TrainerSidebar;