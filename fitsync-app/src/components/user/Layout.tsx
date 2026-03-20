import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import Header from "./Header"

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-[#121212] text-white">
      <Sidebar />
      <div className="flex-1 overflow-x-hidden">
        <Header />
        <main className="p-0 md:p-6 w-full">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout

