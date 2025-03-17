import { Link, useLocation, useNavigate } from "react-router-dom"
import { Home, Users, BarChart2, Heart, LogOut } from "lucide-react"
import { logoutUser } from "../../axios/userApi"

const Sidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const handleLogout = async () => {
    await logoutUser()
    navigate("/signin") 
  }

  return (
    <div className="w-20 bg-[#1a1a1a] min-h-screen flex flex-col items-center py-8 border-r border-[#2a2a2a]">
      <div className="mb-12">
        <Link to="/user/dashboard">
          <div className="text-xl font-bold">
            <span className="text-white">FIT</span>
            <span className="text-[#d9ff00]">SYNC</span>
          </div>
        </Link>
      </div>

      <nav className="flex flex-col items-center space-y-8">
        <Link to="/user/dashboard" className={`p-3 rounded-lg ${isActive("/") ? "bg-[#2a2a2a]" : "hover:bg-[#2a2a2a]"}`}>
          <Home className="w-6 h-6 text-[#d9ff00]" />
        </Link>

        <Link
          to="/activities"
          className={`p-3 rounded-lg ${isActive("/activities") ? "bg-[#2a2a2a]" : "hover:bg-[#2a2a2a]"}`}
        >
          <BarChart2 className="w-6 h-6 text-[#d9ff00]" />
        </Link>

        <Link
          to="/user/trainersList"
          className={`p-3 rounded-lg ${isActive("/trainers") ? "bg-[#2a2a2a]" : "hover:bg-[#2a2a2a]"}`}
        >
          <Users className="w-6 h-6 text-[#d9ff00]" />
        </Link>

        <Link
          to="/favorites"
          className={`p-3 rounded-lg ${isActive("/favorites") ? "bg-[#2a2a2a]" : "hover:bg-[#2a2a2a]"}`}
        >
          <Heart className="w-6 h-6 text-[#d9ff00]" />
        </Link>
      </nav>

      <div className="mt-auto">
  <button onClick={handleLogout} className="p-3 rounded-lg hover:bg-[#2a2a2a]">
    <LogOut className="w-6 h-6 text-[#d9ff00]" />
  </button>
</div>
    </div>
  )
}

export default Sidebar

