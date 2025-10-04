"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import { fetchTrainer } from "../../axios/userApi";
import { format } from "date-fns";

interface Trainer {
  _id: string;
  name: string;
  specializations: string;
  profileImageUrl: string;
  rating: number;
  description: string;
  experience?: string[];
  timeSlots?: {
    time: string;
    price: number;
    startDate: string;
  }[];
  packages?: {
    time: string;
    sessions: number;
    price: number;
    dateRange: string;
  }[];
  reviews?: {
    id: number;
    author: string;
    avatar: string;
    rating: number;
    text: string;
  }[];
}

const TrainerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"sessions" | "packages">(
    "sessions"
  );
  const [userReview, setUserReview] = useState("");
  const [userRating, setUserRating] = useState(5);
  const [trainerData, setTrainerData] = useState<Trainer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainerData = async () => {
      try {
        if (!id) return;
        const response = await fetchTrainer(id);
        setTrainerData(response);
      } catch (error) {
        console.error("Error fetching trainer data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainerData();
  }, [id]);

  const renderStars = (rating: number, interactive = false) => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <Star
          key={index}
          className={`h-5 w-5 ${
            index < rating ? "text-[#d9ff00] fill-[#d9ff00]" : "text-gray-400"
          } ${interactive ? "cursor-pointer" : ""}`}
          onClick={interactive ? () => setUserRating(index + 1) : undefined}
        />
      ));
  };

  const handleBookNow = (time: string, price: number,startDate: string, isPackage = false) => {
    if (isPackage) {
      navigate(`/user/bookingCheckout/${id}`);
    } else {
      console.log('Booking Data:',time,price,startDate,isPackage);
      navigate(`/user/bookingCheckout/${id}`,{state:{time,price,startDate,isPackage}});
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
        <div className="animate-pulse">Loading trainer details...</div>
      </div>
    );
  }

  if (!trainerData) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
        <div>Trainer not found</div>
      </div>
    );
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
                src={trainerData.profileImageUrl || "/placeholder.svg"}
                alt={trainerData.name}
                className="w-28 h-28 rounded-full object-cover mb-2"
              />
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-bold text-[#d9ff00] mb-1">
                {trainerData.name}
              </h2>
              <p className="text-gray-300 mb-2">
                {trainerData.specializations}
              </p>

              <div className="flex mb-4">{renderStars(trainerData.rating)}</div>

              <div className="mb-6">
                <h3 className="text-[#d9ff00] font-semibold mb-2">About</h3>
                <p className="text-sm text-gray-300">
                  {trainerData.description}
                </p>
              </div>

              {trainerData.experience && trainerData.experience.length > 0 && (
                <div>
                  <h3 className="text-[#d9ff00] font-semibold mb-2">
                    Experience
                  </h3>
                  <ul className="text-sm text-gray-300">
                    {trainerData.experience.map((item, index) => (
                      <li key={index} className="mb-1 flex items-start">
                        <span className="text-[#d9ff00] mr-2">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Booking Tabs */}
        <div className="bg-[#d9ff00] rounded-lg overflow-hidden mb-6">
          <div className="flex">
            <button
              className={`flex-1 py-3 font-medium ${
                activeTab === "sessions"
                  ? "bg-[#d9ff00] text-black"
                  : "bg-[#3a3a3a] text-white"
              }`}
              onClick={() => setActiveTab("sessions")}
            >
              Single Sessions
            </button>
            <button
              className={`flex-1 py-3 font-medium ${
                activeTab === "packages"
                  ? "bg-[#d9ff00] text-black"
                  : "bg-[#3a3a3a] text-white"
              }`}
              onClick={() => setActiveTab("packages")}
            >
              Packages
            </button>
          </div>

          <div className="p-6">
            {activeTab === "sessions" ? (
              /* Single Sessions */
              <div className="space-y-4">
  {trainerData.timeSlots && trainerData.timeSlots.length > 0 ? (
    <div className="relative">
      {/* Container with max height and scroll */}
      <div className={`space-y-4 ${trainerData.timeSlots.length > 3 ? "max-h-60 overflow-y-auto pr-2" : ""}`}>
        {trainerData.timeSlots.map((timeSlot, index) => (
          <div
            key={index}
            className="border-b border-[#b0ca00] py-4 last:border-0"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-black">
                  Date: {format(new Date(timeSlot.startDate), "dd/MM/yyyy")}
                </p>
                <p className="font-medium text-black">
                  Time: {timeSlot.time}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-medium text-black">
                  Price: ${timeSlot.price}
                </p>
                <button
                  className="bg-black text-white py-1 px-4 rounded-md text-sm hover:bg-gray-800"
                  onClick={() => handleBookNow(timeSlot.time, timeSlot.price,timeSlot.startDate,false)}
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Gradient fade effect (only when there are more than 3 slots) */}
      {trainerData.timeSlots.length > 3 && (
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#121212] to-transparent pointer-events-none" />
      )}
    </div>
  ) : (
    <p className="text-gray-700">No sessions available</p>
  )}
</div>
            ) : (
              /* Packages */
              <div className="space-y-4">
                {trainerData.packages && trainerData.packages.length > 0 ? (
                  trainerData.packages.map((pkg, index) => (
                    <div
                      key={index}
                      className="border-b border-[#b0ca00] py-4 last:border-0"
                    >
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <div>
                          <p className="font-medium">Time: {pkg.time}</p>
                          <p className="text-sm">
                            Number of Sessions: {pkg.sessions}
                          </p>
                          <p className="text-xs text-gray-700">
                            ({pkg.dateRange})
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-medium">Price: ${pkg.price}</p>
                          <button
                            className="bg-black text-white py-1 px-4 rounded-md text-sm hover:bg-gray-800"
                            onClick={() =>
                              handleBookNow(pkg.time, pkg.price,pkg.dateRange, true)
                            }
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-700">No packages available</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-[#1a1a1a] rounded-lg p-6">
          <h2 className="text-[#d9ff00] font-bold mb-4">Feedback to Trainer</h2>

          {/* Review Form */}
          <div className="mb-6 border border-gray-700 rounded-lg p-4">
            <div className="flex justify-center mb-4">
              {renderStars(userRating, true)}
            </div>
            <textarea
              className="w-full bg-[#2a2a2a] border-none rounded-md p-3 text-white resize-none placeholder-gray-500 focus:ring-1 focus:ring-[#d9ff00] focus:outline-none"
              rows={3}
              placeholder="Write Your review"
              value={userReview}
              onChange={(e) => setUserReview(e.target.value)}
            ></textarea>
            <div className="flex justify-end gap-2 mt-2">
              <button className="bg-gray-600 text-white py-1 px-4 rounded-md text-sm hover:bg-gray-700">
                Cancel
              </button>
              <button className="bg-[#d9ff00] text-black py-1 px-4 rounded-md text-sm hover:bg-[#c8e600]">
                Post
              </button>
            </div>
          </div>

          {/* Review List */}
          {trainerData.reviews && trainerData.reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {trainerData.reviews.map((review) => (
                <div key={review.id} className="bg-[#2a2a2a] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={review.avatar || "/placeholder.svg"}
                      alt={review.author}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="text-sm font-medium">{review.author}</p>
                      <div className="flex">{renderStars(review.rating)}</div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-300">{review.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center">No reviews yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainerDetails;
