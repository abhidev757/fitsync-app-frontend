"use client"

import type React from "react"
import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Star } from "lucide-react"

// Mock data for trainer
const trainerData = {
  id: 1,
  name: "Sarah M",
  role: "Yoga Instructor",
  image: "https://via.placeholder.com/150",
  rating: 5,
  about:
    "I am a certified yoga instructor with over 8 years of experience in teaching various yoga styles, including Vinyasa, Hatha, and Ashtanga. My approach focuses on integrating breath, movement, and mindfulness to help students achieve both physical and mental balance.",
  experience: [
    "8+ years of teaching yoga in diverse settings",
    "Former lead yoga instructor at Wellness Studio",
    "Specialized in yoga for stress relief and mindfulness training",
    "Conducted over 500 group and private sessions",
  ],
  sessions: [
    { time: "9:00 - 10:00", price: 50 },
    { time: "10:00 - 11:00", price: 55 },
    { time: "12:00 - 1:00", price: 55 },
  ],
  packages: [
    { time: "9:00 - 10:00", sessions: 10, price: 50, dateRange: "Oct 1 to Oct 10" },
    { time: "10:00 - 11:00", sessions: 10, price: 55, dateRange: "Oct 1 to Oct 10" },
    { time: "12:00 - 1:00", sessions: 10, price: 55, dateRange: "Oct 1 to Oct 10" },
  ],
  reviews: [
    {
      id: 1,
      author: "Vibin",
      avatar: "https://via.placeholder.com/50",
      rating: 5,
      text: "The sessions were just excellent and I realized exactly what I needed. I'm now a lot happier!",
    },
    {
      id: 2,
      author: "Vibin",
      avatar: "https://via.placeholder.com/50",
      rating: 5,
      text: "The sessions were just excellent and I realized exactly what I needed. I'm now a lot happier!",
    },
    {
      id: 3,
      author: "Sarah M",
      avatar: "https://via.placeholder.com/50",
      rating: 5,
      text: "The sessions were just excellent and I realized exactly what I needed. I'm now a lot happier!",
    },
    {
      id: 4,
      author: "Tomas",
      avatar: "https://via.placeholder.com/50",
      rating: 5,
      text: "The sessions were just excellent and I realized exactly what I needed. I'm now a lot happier!",
    },
  ],
}

const TrainerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<"sessions" | "packages">("sessions")
  const [userReview, setUserReview] = useState("")
  const [userRating, setUserRating] = useState(5)

  // Generate stars based on rating
  const renderStars = (rating: number, interactive = false) => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <Star
          key={index}
          className={`h-5 w-5 ${index < rating ? "text-[#d9ff00] fill-[#d9ff00]" : "text-gray-400"} ${interactive ? "cursor-pointer" : ""}`}
          onClick={interactive ? () => setUserRating(index + 1) : undefined}
        />
      ))
  }

  const handleBookNow = (time: string, price: number, isPackage = false) => {
    // In a real app, you'd probably want to store the selected session in state or context
    // For now, we'll just navigate to the booking page with query params
    if (isPackage) {
      navigate(`/user/bookingCheckout`)
      // navigate(`/booking/${id}?time=${time}&price=${price}&isPackage=true`)
    } else {
      navigate(`/user/bookingCheckout`)
      // navigate(`/booking/${id}?time=${time}&price=${price}`)
    }
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Trainer Details</h1>

        {/* Trainer Profile */}
        <div className="bg-[#1a1a1a] rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center">
              <img
                src={trainerData.image || "/placeholder.svg"}
                alt={trainerData.name}
                className="w-28 h-28 rounded-full object-cover mb-2"
              />
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-bold text-[#d9ff00] mb-1">{trainerData.name}</h2>
              <p className="text-gray-300 mb-2">{trainerData.role}</p>

              <div className="flex mb-4">{renderStars(trainerData.rating)}</div>

              <div className="mb-6">
                <h3 className="text-[#d9ff00] font-semibold mb-2">About</h3>
                <p className="text-sm text-gray-300">{trainerData.about}</p>
              </div>

              <div>
                <h3 className="text-[#d9ff00] font-semibold mb-2">Experience</h3>
                <ul className="text-sm text-gray-300">
                  {trainerData.experience.map((item, index) => (
                    <li key={index} className="mb-1 flex items-start">
                      <span className="text-[#d9ff00] mr-2">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Tabs */}
        <div className="bg-[#d9ff00] rounded-lg overflow-hidden mb-6">
          <div className="flex">
            <button
              className={`flex-1 py-3 font-medium ${activeTab === "sessions" ? "bg-[#d9ff00]" : "bg-[#3a3a3a] text-white"}`}
              onClick={() => setActiveTab("sessions")}
            >
              Single Sessions
            </button>
            <button
              className={`flex-1 py-3 font-medium ${activeTab === "packages" ? "bg-[#d9ff00]" : "bg-[#3a3a3a] text-white"}`}
              onClick={() => setActiveTab("packages")}
            >
              Packages
            </button>
          </div>

          <div className="p-6">
            {activeTab === "sessions" ? (
              /* Single Sessions */
              <div className="space-y-4">
                {trainerData.sessions.map((session, index) => (
                  <div key={index} className="border-b border-[#b0ca00] py-4 last:border-0">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Time: {session.time}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-medium">Price: ${session.price}</p>
                        <button
                          className="bg-black text-white py-1 px-4 rounded-md text-sm hover:bg-gray-800"
                          onClick={() => handleBookNow(session.time, session.price)}
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Packages */
              <div className="space-y-4">
                {trainerData.packages.map((pkg, index) => (
                  <div key={index} className="border-b border-[#b0ca00] py-4 last:border-0">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <div>
                        <p className="font-medium">Time: {pkg.time}</p>
                        <p className="text-sm">Number of Sessions: {pkg.sessions}</p>
                        <p className="text-xs text-gray-700">({pkg.dateRange})</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-medium">Price: ${pkg.price}</p>
                        <button
                          className="bg-black text-white py-1 px-4 rounded-md text-sm hover:bg-gray-800"
                          onClick={() => handleBookNow(pkg.time, pkg.price, true)}
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-[#1a1a1a] rounded-lg p-6">
          <h2 className="text-[#d9ff00] font-bold mb-4">Feedback to Trainer</h2>

          {/* Review Form */}
          <div className="mb-6 border border-gray-700 rounded-lg p-4">
            <div className="flex justify-center mb-4">{renderStars(userRating, true)}</div>
            <textarea
              className="w-full bg-[#2a2a2a] border-none rounded-md p-3 text-white resize-none placeholder-gray-500 focus:ring-1 focus:ring-[#d9ff00] focus:outline-none"
              rows={3}
              placeholder="Write Your review"
              value={userReview}
              onChange={(e) => setUserReview(e.target.value)}
            ></textarea>
            <div className="flex justify-end gap-2 mt-2">
              <button className="bg-gray-600 text-white py-1 px-4 rounded-md text-sm hover:bg-gray-700">Cancel</button>
              <button className="bg-[#d9ff00] text-black py-1 px-4 rounded-md text-sm hover:bg-[#c8e600]">Post</button>
            </div>
          </div>

          {/* Review List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {trainerData.reviews.map((review) => (
              <div key={review.id} className="bg-[#2a2a2a] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <img src={review.avatar || "/placeholder.svg"} alt={review.author} className="w-8 h-8 rounded-full" />
                  <div>
                    <p className="text-sm font-medium">{review.author}</p>
                    <div className="flex">{renderStars(review.rating)}</div>
                  </div>
                </div>
                <p className="text-xs text-gray-300">{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrainerDetails

