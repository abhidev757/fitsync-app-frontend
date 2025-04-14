import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, UserCog, ClipboardCheck, Star, CreditCard, LogOut, Dumbbell } from 'lucide-react';
import { AppDispatch } from '../../store';
import { useDispatch } from 'react-redux';
import { LogoutAdmin } from '../../axios/adminApi';
import { logoutAdmin } from '../../slices/adminAuthSlice';

const Sidebar = () => {

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
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
    { path: '/reviews', label: 'Reviews', icon: Star },
    { path: '/payments', label: 'Payments', icon: CreditCard },
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
          
          <button onClick={handleLogout} className="flex items-center px-4 py-3 rounded-md text-gray-300 hover:bg-gray-700 w-full text-left">
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;