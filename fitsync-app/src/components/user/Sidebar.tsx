import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Users, BarChart2, LogOut, Wallet, LayoutGrid, XCircle } from "lucide-react"
import { logoutUser } from "../../axios/userApi"
import { useDispatch } from "react-redux"
import { logout } from "../../slices/authSlice"

const Sidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  const isActive = (path: string) => {
    if (path === "/user/dashboard") return location.pathname === path
    return location.pathname.startsWith(path)
  }

  const handleLogout = async () => {
    await logoutUser()
    localStorage.removeItem("userId")
    dispatch(logout())
    navigate("/signin")
  }

  const navItems = [
    { path: "/user/dashboard", icon: <LayoutGrid size={20} />, label: "Grid" },
    { path: "/user/mySessions", icon: <BarChart2 size={20} />, label: "Stats" },
    { path: "/user/trainersList", icon: <Users size={20} />, label: "Unit" },
    { path: "/favorites", icon: <Heart size={20} />, label: "Mark" },
    { path: "/user/userWallet", icon: <Wallet size={20} />, label: "Asset" },
  ]

  return (
    <>
      {/* --- DESKTOP SIDEBAR --- */}
      <div className="hidden md:flex w-24 bg-[#0B0B0B] min-h-screen flex-col items-center py-10 border-r border-gray-900 sticky top-0 left-0 z-50">
        <div className="mb-16">
          <Link to="/user/dashboard" className="group relative">
            <div className="absolute -inset-2 bg-[#CCFF00] rounded-full blur opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <div className="relative text-center leading-none">
              <span className="block text-[10px] font-black tracking-[0.3em] text-white">FIT</span>
              <span className="block text-[10px] font-black tracking-[0.3em] text-[#CCFF00]">SYNC</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 flex flex-col items-center space-y-6 w-full">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className="relative w-full flex justify-center group py-2">
              {isActive(item.path) && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#CCFF00] shadow-[0_0_10px_rgba(204,255,0,0.8)] rounded-r-full"></div>
              )}
              <div className={`p-3.5 rounded-2xl transition-all duration-300 ${isActive(item.path) ? "bg-[#CCFF00]/10 text-[#CCFF00]" : "text-gray-600 hover:text-white"}`}>
                {item.icon}
              </div>
              <span className="absolute left-20 bg-[#CCFF00] text-black text-[9px] font-black uppercase tracking-widest py-1.5 px-3 rounded shadow-2xl opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 whitespace-nowrap z-50">
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        <button onClick={() => setIsLogoutModalOpen(true)} className="group relative flex justify-center w-full py-2 mt-auto">
          <div className="p-3.5 rounded-2xl text-gray-700 hover:text-red-500 hover:bg-red-500/10 transition-all">
            <LogOut size={22} />
          </div>
        </button>
      </div>

      {/* --- MOBILE BOTTOM NAV --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0B0B0B]/80 backdrop-blur-lg border-t border-gray-900 px-4 py-2 z-50">
        <nav className="flex items-center justify-between">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className="relative flex flex-col items-center p-3">
              <div className={`transition-colors duration-300 ${isActive(item.path) ? "text-[#CCFF00]" : "text-gray-600"}`}>
                {item.icon}
              </div>
              {isActive(item.path) && (
                <div className="absolute -bottom-1 w-1 h-1 bg-[#CCFF00] rounded-full shadow-[0_0_8px_#CCFF00]"></div>
              )}
            </Link>
          ))}
          <button onClick={() => setIsLogoutModalOpen(true)} className="p-3 text-gray-700">
            <LogOut size={20} />
          </button>
        </nav>
      </div>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[100] p-6">
          <div className="bg-[#0B0B0B] border border-gray-900 rounded-3xl p-8 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-2 text-center">Terminate?</h3>
            <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest text-center mb-8 italic">Disconnecting from secure grid</p>
            <div className="flex gap-4">
              <button onClick={() => setIsLogoutModalOpen(false)} className="flex-1 py-4 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Cancel</button>
              <button onClick={() => { setIsLogoutModalOpen(false); handleLogout(); }} className="flex-1 py-4 bg-[#CCFF00] text-black rounded-xl text-[10px] font-black uppercase tracking-widest">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Sidebar