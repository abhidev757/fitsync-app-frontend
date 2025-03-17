"use client"

import type React from "react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"

interface Trainer {
  id: number
  name: string
  role: string
  image: string
  rating: number
  description: string
}

const trainers: Trainer[] = [
  {
    id: 1,
    name: "Sarah M",
    role: "Yoga Instructor",
    image: "https://via.placeholder.com/80",
    rating: 5,
    description:
      "Certified yoga instructor with 5 years of experience in diverse styles. Focuses on breath control and mindfulness.",
  },
  {
    id: 2,
    name: "Vibin",
    role: "Personal Trainer",
    image: "https://via.placeholder.com/80",
    rating: 5,
    description: "10 years of experience helping clients achieve their fitness goals through tailored programs.",
  },
  {
    id: 3,
    name: "Tomas",
    role: "Meditation Coach",
    image: "https://via.placeholder.com/80",
    rating: 5,
    description: "Mindfulness and meditation coach with a holistic approach to mental wellness.",
  },
  // Duplicated for demonstration purposes
  {
    id: 4,
    name: "Vibin",
    role: "Personal Trainer",
    image: "https://via.placeholder.com/80",
    rating: 5,
    description: "10 years of experience helping clients achieve their fitness goals through tailored programs.",
  },
  {
    id: 5,
    name: "Sarah M",
    role: "Yoga Instructor",
    image: "https://via.placeholder.com/80",
    rating: 5,
    description:
      "Certified yoga instructor with 5 years of experience in diverse styles. Focuses on breath control and mindfulness.",
  },
  {
    id: 6,
    name: "Tomas",
    role: "Meditation Coach",
    image: "https://via.placeholder.com/80",
    rating: 5,
    description: "Mindfulness and meditation coach with a holistic approach to mental wellness.",
  },
]

const TrainersList: React.FC = () => {
  const [filters, setFilters] = useState({
    specialization: "",
    experienceLevel: "",
    availability: "",
    language: "",
  })

  const [sortOption, setSortOption] = useState("price-low")
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Generate stars based on rating
  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <Star key={index} className={`h-4 w-4 ${index < rating ? "text-[#d9ff00] fill-[#d9ff00]" : "text-gray-400"}`} />
      ))
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Trainers List</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main content */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trainers.map((trainer) => (
                <div key={trainer.id} className="bg-[#1a1a1a] rounded-lg overflow-hidden relative">
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <img
                        src={trainer.image || "/placeholder.svg"}
                        alt={trainer.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-[#d9ff00] font-bold">{trainer.name}</h3>
                        <p className="text-sm text-gray-300">{trainer.role}</p>
                      </div>
                    </div>

                    <div className="flex mb-2">{renderStars(trainer.rating)}</div>

                    <p className="text-sm text-gray-300 mb-4 line-clamp-2">{trainer.description}</p>

                    <div className="flex justify-between items-center">
                      <Link to={`/trainers/${trainer.id}`}>
                        <button className="bg-[#2a2a2a] hover:bg-[#333333] text-xs font-medium py-1 px-4 rounded-full">
                          Book Session
                        </button>
                      </Link>
                      <Link to={`/user/trainerDetails`} className="text-[#d9ff00] text-xs">
                        View Profile
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center mt-8 text-sm">
              <button className="p-1 text-gray-400 hover:text-white">
                <span className="flex items-center">
                  <ChevronLeft size={14} />
                  <ChevronLeft size={14} className="-ml-1" />
                </span>
              </button>
              <button className="p-1 mx-1 text-gray-400 hover:text-white">
                <ChevronLeft size={16} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full mx-1 bg-[#2a2a2a]">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full mx-1 hover:bg-[#2a2a2a]">
                2
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full mx-1 hover:bg-[#2a2a2a]">
                3
              </button>
              <span className="mx-1">...</span>
              <button className="w-8 h-8 flex items-center justify-center rounded-full mx-1 hover:bg-[#2a2a2a]">
                100
              </button>
              <button className="p-1 mx-1 text-gray-400 hover:text-white">
                <ChevronRight size={16} />
              </button>
              <button className="p-1 text-gray-400 hover:text-white">
                <span className="flex items-center">
                  <ChevronRight size={14} />
                  <ChevronRight size={14} className="-ml-1" />
                </span>
              </button>
            </div>
          </div>

          {/* Filters sidebar - desktop */}
          <div className="hidden lg:block w-64 bg-[#1a1a1a] rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Filters</h2>

            {/* Specialization */}
            <div className="mb-4">
              <h3 className="font-medium text-[#d9ff00] mb-2">Specialization</h3>
              <div className="space-y-1">
                <label className="flex items-center space-x-2 text-sm">
                  <input type="checkbox" className="form-checkbox bg-gray-700 border-gray-600 rounded" />
                  <span>Strength Training</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <input type="checkbox" className="form-checkbox bg-gray-700 border-gray-600 rounded" />
                  <span>Yoga</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <input type="checkbox" className="form-checkbox bg-gray-700 border-gray-600 rounded" />
                  <span>Nutrition</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <input type="checkbox" className="form-checkbox bg-gray-700 border-gray-600 rounded" />
                  <span>Meditation</span>
                </label>
              </div>
            </div>

            {/* Experience Level */}
            <div className="mb-4">
              <h3 className="font-medium text-[#d9ff00] mb-2">Experience Level</h3>
              <div className="space-y-1">
                <label className="flex items-center space-x-2 text-sm">
                  <input type="checkbox" className="form-checkbox bg-gray-700 border-gray-600 rounded" />
                  <span>Beginner</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <input type="checkbox" className="form-checkbox bg-gray-700 border-gray-600 rounded" />
                  <span>Intermediate</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <input type="checkbox" className="form-checkbox bg-gray-700 border-gray-600 rounded" />
                  <span>Advanced</span>
                </label>
              </div>
            </div>

            {/* Availability */}
            <div className="mb-4">
              <h3 className="font-medium text-[#d9ff00] mb-2">Availability</h3>
              <div className="space-y-1">
                <label className="flex items-center space-x-2 text-sm">
                  <input type="checkbox" className="form-checkbox bg-gray-700 border-gray-600 rounded" />
                  <span>Morning</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <input type="checkbox" className="form-checkbox bg-gray-700 border-gray-600 rounded" />
                  <span>Afternoon</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <input type="checkbox" className="form-checkbox bg-gray-700 border-gray-600 rounded" />
                  <span>Evening</span>
                </label>
              </div>
            </div>

            {/* Language */}
            <div className="mb-4">
              <h3 className="font-medium text-[#d9ff00] mb-2">Language</h3>
              <div className="space-y-1">
                <label className="flex items-center space-x-2 text-sm">
                  <input type="checkbox" className="form-checkbox bg-gray-700 border-gray-600 rounded" />
                  <span>English</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <input type="checkbox" className="form-checkbox bg-gray-700 border-gray-600 rounded" />
                  <span>Malayalam</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <input type="checkbox" className="form-checkbox bg-gray-700 border-gray-600 rounded" />
                  <span>Tamil</span>
                </label>
              </div>
            </div>

            {/* Sorting Options */}
            <div className="mb-4">
              <h3 className="font-medium text-[#d9ff00] mb-2">Sorting Options</h3>
              <div className="mb-2">
                <p className="text-sm mb-1">
                  Sort by: <span className="text-[#d9ff00]">Pricing</span>
                </p>
                <div className="space-y-1">
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="radio"
                      name="sort"
                      value="low-to-high"
                      checked={sortOption === "price-low"}
                      onChange={() => setSortOption("price-low")}
                      className="form-radio bg-gray-700 border-gray-600"
                    />
                    <span>Low to High</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="radio"
                      name="sort"
                      value="high-to-low"
                      checked={sortOption === "price-high"}
                      onChange={() => setSortOption("price-high")}
                      className="form-radio bg-gray-700 border-gray-600"
                    />
                    <span>High to Low</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <button className="flex-1 bg-[#d9ff00] hover:bg-[#c8e600] text-black font-medium py-2 px-4 rounded-md text-sm">
                Apply Filters
              </button>
              <button className="bg-[#2a2a2a] hover:bg-[#333333] text-white font-medium py-2 px-4 rounded-md text-sm">
                Reset
              </button>
            </div>
          </div>

          {/* Mobile filter button */}
          <button
            className="fixed bottom-4 right-4 lg:hidden z-10 bg-[#d9ff00] text-black rounded-full p-3 shadow-lg"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
          </button>

          {/* Mobile filter panel */}
          {isFilterOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden flex justify-end">
              <div className="w-4/5 max-w-md bg-[#1a1a1a] h-full overflow-y-auto p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <button onClick={() => setIsFilterOpen(false)}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Filter content - same as desktop */}
                {/* Specialization */}
                <div className="mb-4">
                  <h3 className="font-medium text-[#d9ff00] mb-2">Specialization</h3>
                  <div className="space-y-1">
                    <label className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" className="form-checkbox bg-gray-700 border-gray-600 rounded" />
                      <span>Strength Training</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" className="form-checkbox bg-gray-700 border-gray-600 rounded" />
                      <span>Yoga</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" className="form-checkbox bg-gray-700 border-gray-600 rounded" />
                      <span>Nutrition</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" className="form-checkbox bg-gray-700 border-gray-600 rounded" />
                      <span>Meditation</span>
                    </label>
                  </div>
                </div>

                {/* Experience Level */}
                <div className="mb-4">
                  <h3 className="font-medium text-[#d9ff00] mb-2">Experience Level</h3>
                  {/* Same content as desktop */}
                </div>

                {/* Apply/Reset buttons */}
                <div className="flex space-x-2 mt-6">
                  <button
                    className="flex-1 bg-[#d9ff00] hover:bg-[#c8e600] text-black font-medium py-2 px-4 rounded-md text-sm"
                    onClick={() => setIsFilterOpen(false)}
                  >
                    Apply Filters
                  </button>
                  <button
                    className="bg-[#2a2a2a] hover:bg-[#333333] text-white font-medium py-2 px-4 rounded-md text-sm"
                    onClick={() => setIsFilterOpen(false)}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TrainersList

