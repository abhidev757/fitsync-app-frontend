"use client"

import type React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { CheckCircle } from "lucide-react"

interface BookingData {
  trainer: {
    name: string;
  };
  clientName: string;
  clientEmail: string;
  time: string;
  startDate: string;
  isPackage: boolean;
  total: number;
}

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get booking data from navigation state
  const bookingData = location.state?.booking as BookingData | undefined
  console.log('Booking Data:', bookingData);

  // Get user info from localStorage
  const userInfoString = localStorage.getItem('userInfo');
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null;

 

  return (
    <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
      <div className="max-w-md w-full p-6">
        <div className="bg-[#1a1a1a] rounded-lg p-8 shadow-lg">
          {/* Success icon */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="bg-[#d9ff00] rounded-full p-2 mb-4">
              <CheckCircle size={40} className="text-black" />
            </div>
            <h1 className="text-2xl font-bold text-[#d9ff00] mb-2">Payment Successful</h1>
            <p className="text-center text-gray-300">
              Thank you for your payment. Your transaction has been completed successfully.
            </p>
          </div>

         

          {/* Booking Information */}
          {bookingData && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-[#d9ff00] mb-2">Booking Details</h2>
              <div className="bg-[#2a2a2a] rounded-lg p-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-gray-400">Trainer:</span>
                  <span>{bookingData.trainer.name}</span>

                  <span className="text-gray-400">Session Time:</span>
                  <span>{bookingData.time}</span>

                  <span className="text-gray-400">Start Date:</span>
                  <span>{bookingData.startDate}</span>

                  <span className="text-gray-400">Type:</span>
                  <span>{bookingData.isPackage ? "Package" : "Single Session"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Billing Information (Now using localStorage userInfo) */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-[#d9ff00] mb-2">Billing Information</h2>
            <div className="bg-[#2a2a2a] rounded-lg p-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-400">Name:</span>
                <span>{userInfo?.name || "Not available"}</span>

                <span className="text-gray-400">Email:</span>
                <span className="truncate" >{userInfo?.email || "Not available"}</span>
              </div>
            </div>
          </div>

          {/* Back to home button */}
          <button
            className="w-full bg-[#d9ff00] hover:bg-[#c8e600] text-black font-medium py-3 rounded-lg"
            onClick={() => navigate("/user/dashboard")}
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccess