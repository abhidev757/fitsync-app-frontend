import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, UserCog, ClipboardCheck, CreditCard, LogOut, Dumbbell } from 'lucide-react';
import { AppDispatch } from '../../store';
import { useDispatch } from 'react-redux';
import { LogoutAdmin } from '../../axios/adminApi';
import { logoutAdmin } from '../../slices/adminAuthSlice';

const Sidebar = () => {

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await LogoutAdmin()
      dispatch(logoutAdmin());
      navigate('/adminLogin');
    } catch (err) {
      console.log(err);
    }
  };

  const location = useLocation();
  
  const menuItems = [
    { path: '/admin/adminDashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/specialization', label: 'Specialization', icon: Dumbbell },
    { path: '/admin/trainerVerification', label: 'Verification', icon: ClipboardCheck },
    { path: '/admin/trainerManagement', label: 'Trainers', icon: UserCog },
    { path: '/admin/userManagement', label: 'Users', icon: Users },
    { path: '/admin/payments', label: 'Payments', icon: CreditCard },
  ];

  return (
    <div className="w-64 bg-gray-800 text-white">
      <div className="p-4 text-center">
        <h1 className="text-2xl font-bold">
          <span className="text-white">FIT</span>
          <span className="text-gray-300">SYNC</span>
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
          
          <button onClick={() => setIsLogoutModalOpen(true)} className="flex items-center px-4 py-3 rounded-md text-gray-300 hover:bg-gray-700 w-full text-left">
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </button>
        </nav>
      </div>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-6">
          <div className="bg-gray-900 border border-gray-700 rounded-3xl p-8 w-full max-w-sm shadow-[0_0_50px_rgba(255,255,255,0.02)]">
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2 text-center">System Logout?</h3>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest text-center mb-8">Confirm to exit FitSync Administration</p>
            <div className="flex gap-4">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsLogoutModalOpen(false);
                  handleLogout();
                }}
                className="flex-1 py-4 bg-white hover:bg-gray-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
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

export default Sidebar;