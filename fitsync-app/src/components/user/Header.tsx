import { useLocation, Link } from "react-router-dom"
import { Search, Bell } from "lucide-react"
import { Avatar } from "./ui/avatar"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

const Header = () => {
  const location = useLocation()

  // Extract page title from pathname
  const getPageTitle = () => {
    const path = location.pathname.split("/")[1]
    if (!path) return "Dashboard"
    return path.charAt(0).toUpperCase() + path.slice(1)
  }

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
              className="pl-10 bg-[#1a1a1a] border-none h-10 focus:ring-1 focus:ring-[#d9ff00]"
            />
          </div>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#d9ff00] text-xs text-black">
              1
            </span>
          </Button>

          <Link to="/user/userProfile" className="relative group">
            <Avatar className="cursor-pointer transition-transform hover:scale-105">
              <img src="https://via.placeholder.com/40" alt="User" className="h-full w-full object-cover" />
            </Avatar>
            <span className="absolute -bottom-6 right-0 bg-[#2a2a2a] text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              View Profile
            </span>
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header

