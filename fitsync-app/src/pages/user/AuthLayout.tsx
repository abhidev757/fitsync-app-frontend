import type React from "react"
import authBackground from '../../assets/authLayout.png'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title }) => {
  return (
    <div
      className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage:
          `url(${authBackground})`,
        backgroundSize: "cover",
      }}
    >
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-white">{title}</h2>
          {/* <img className="mx-auto h-10 w-auto" src="/FitsyncIcon.svg" alt="FITSYNC" /> */}
        </div>
        {children}
      </div>
    </div>
  )
}

export default AuthLayout

