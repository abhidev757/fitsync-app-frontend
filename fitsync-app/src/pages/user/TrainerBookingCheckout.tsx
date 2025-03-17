"use client"

import type React from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"

// Helper function to parse query parameters
const useQuery = () => {
  return new URLSearchParams(useLocation().search)
}

const BookingCheckout: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const query = useQuery()
  const navigate = useNavigate()

  const time = query.get("time") || ""
  const price = query.get("price") || "0"
  const isPackage = query.get("isPackage") === "true"

  // Mock trainer data
  const trainer = {
    id: 1,
    name: "Sarah M",
    role: "Yoga Instructor",
    image: "https://via.placeholder.com/150",
  }

  // Calculate total based on the package or single session
  const total = isPackage ? Number.parseInt(price) * 10 : Number.parseInt(price) // 10 sessions in a package

  const handleConfirmBooking = () => {
    navigate("/user/paymentSuccess")
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Trainer Details</h1>

        {/* Trainer Profile - Small version */}
        <div className="bg-[#1a1a1a] rounded-lg p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <img
              src={trainer.image || "/placeholder.svg"}
              alt={trainer.name}
              className="w-24 h-24 rounded-full object-cover"
            />
            <div>
              <h2 className="text-xl font-bold text-[#d9ff00]">{trainer.name}</h2>
              <p className="text-gray-300">{trainer.role}</p>
            </div>
          </div>

          {/* Booking details */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Booking Details</h3>

            <div className="bg-[#2a2a2a] rounded-lg p-4">
              {/* Package name */}
              <div className="mb-4">
                <h4 className="text-[#d9ff00] font-medium">Flex Mate</h4>
              </div>

              {/* Date */}
              <div className="grid grid-cols-2 py-2 border-b border-gray-700">
                <span className="text-gray-400">Date :</span>
                <span>{isPackage ? "Oct 1 to Oct 10" : "Oct 1"}</span>
              </div>

              {/* Time */}
              <div className="grid grid-cols-2 py-2 border-b border-gray-700">
                <span className="text-gray-400">Time :</span>
                <span>{time.replace(" - ", " to ")}</span>
              </div>

              {/* Trainer */}
              <div className="grid grid-cols-2 py-2 border-b border-gray-700">
                <span className="text-gray-400">Trainer :</span>
                <span>{trainer.name}</span>
              </div>

              {/* Service */}
              <div className="grid grid-cols-2 py-2 border-b border-gray-700">
                <span className="text-gray-400">Service :</span>
                <span className="text-[#d9ff00]">Yoga & Mindfulness</span>
              </div>

              {/* Plan */}
              <div className="grid grid-cols-2 py-2">
                <span className="text-gray-400">Plan :</span>
                <span>{isPackage ? "Package" : "Single Session"}</span>
              </div>
            </div>
          </div>

          {/* Total price and booking button */}
          <div className="flex justify-between items-center border-t border-gray-700 pt-4">
            <div className="text-lg font-bold">
              Total Price : <span className="text-white">${total}</span>
            </div>
            <button
              className="bg-[#d9ff00] hover:bg-[#c8e600] text-black font-medium py-2 px-8 rounded-lg"
              onClick={handleConfirmBooking}
            >
              Confirm Book
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingCheckout

