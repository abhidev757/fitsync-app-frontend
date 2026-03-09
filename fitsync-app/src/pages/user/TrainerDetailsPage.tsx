"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, ChevronLeft, Award, Clock, Calendar, ShieldCheck } from "lucide-react";
import { fetchTrainer, getTrainerReviews } from "../../axios/userApi";
import { format } from "date-fns";

interface Trainer {
  _id: string;
  name: string;
  specializations: string;
  profileImageUrl: string;
  description: string;
  bio?: string;
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
    _id: string;
    userId: {
      name: string;
      profileImageUrl: string;
    };
    rating: number;
    review: string;
    createdAt?: string;
  }[];
}

const TrainerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trainerData, setTrainerData] = useState<Trainer | null>(null);
  const [trainerReviews, setTrainerReviews] = useState<Trainer['reviews']>([]);
  const [visibleReviews, setVisibleReviews] = useState(3);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainerData = async () => {
      try {
        if (!id) return;
        const [trainerRes, reviewsRes] = await Promise.all([
          fetchTrainer(id),
          getTrainerReviews(id)
        ]);
        setTrainerData(trainerRes);
        setTrainerReviews(reviewsRes);
      } catch (error) {
        console.error("Error fetching trainer data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainerData();
  }, [id]);

  const avgRating = trainerReviews && trainerReviews.length > 0
    ? Number((trainerReviews.reduce((sum, r) => sum + r.rating, 0) / trainerReviews.length).toFixed(1))
    : 0;

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, index) => (
      <Star
        key={index}
        className={`h-3 w-3 ${index < rating ? "text-[#CCFF00] fill-[#CCFF00]" : "text-gray-800"}`}
      />
    ));
  };

  const handleBookNow = (time: string, price: number, startDate: string, isPackage = false) => {
    if (isPackage) {
      navigate(`/user/bookingCheckout/${id}`);
    } else {
      navigate(`/user/bookingCheckout/${id}`, { state: { time, price, startDate, isPackage } });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-2 border-t-[#CCFF00] border-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#CCFF00]">Retrieving Expert Profile</p>
        </div>
      </div>
    );
  }

  if (!trainerData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-black uppercase italic tracking-tighter text-3xl">
        Trainer Not Found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header Breadcrumb */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 bg-gray-900 rounded-xl text-gray-400 hover:text-[#CCFF00] transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div>
            <p className="text-[#CCFF00] font-black text-[10px] tracking-[0.3em] uppercase mb-0.5">Elite Coaching Roster</p>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">Personnel Profile</h1>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-[#0B0B0B] border border-gray-900 rounded-[2rem] p-10 mb-10 overflow-hidden relative shadow-2xl">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#CCFF00] opacity-5 blur-[120px] pointer-events-none"></div>

          <div className="flex flex-col lg:flex-row gap-12 items-start relative z-10">
            <div className="relative group">
              <div className="absolute -inset-1 bg-[#CCFF00] rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition-opacity"></div>
              <img
                src={trainerData.profileImageUrl || "/placeholder.svg"}
                alt={trainerData.name}
                className="relative w-48 h-64 rounded-[1.5rem] object-cover grayscale hover:grayscale-0 transition-all duration-500 brightness-90 border border-gray-800 cursor-pointer"
              />
              <div className="absolute -bottom-3 -right-3 bg-black p-3 rounded-2xl border border-gray-800 shadow-xl">
                <ShieldCheck className="text-[#CCFF00]" size={24} />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                  <h2 className="text-5xl font-black tracking-tighter uppercase italic mb-2">
                    {trainerData.name}
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className="text-[#CCFF00] text-[10px] font-black uppercase tracking-widest bg-[#CCFF00]/10 px-3 py-1.5 rounded-lg border border-[#CCFF00]/20">
                      {trainerData.specializations}
                    </span>
                    <div className="flex items-center gap-2 bg-gray-900/50 px-3 py-1 rounded-lg">
                      {renderStars(avgRating)}
                      <span className="text-[10px] font-black text-white mt-0.5">{avgRating > 0 ? avgRating : "NEW"}</span>
                      <span className="text-[10px] font-black text-gray-500 mt-0.5 italic">({trainerReviews?.length || 0} REVIEWS)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-10">
                <h3 className="text-xs font-black uppercase text-gray-600 tracking-[0.3em] mb-4">Professional Dossier</h3>
                <p className="text-gray-400 text-lg leading-relaxed max-w-4xl italic border-l-2 border-[#CCFF00]/30 pl-6">
                  "{trainerData.bio}"
                </p>
              </div>

              {trainerData.experience && trainerData.experience.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trainerData.experience.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 bg-black border border-gray-900 p-4 rounded-2xl group hover:border-[#CCFF00]/30 transition-all">
                      <Award className="text-[#CCFF00] opacity-50 group-hover:opacity-100" size={18} />
                      <span className="text-sm font-bold text-gray-300 uppercase tracking-tight">{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Booking & Feedback Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">

          {/* Sessions Column */}
          <div className="xl:col-span-8 space-y-10">
            <section className="bg-[#0B0B0B] border border-gray-900 rounded-[2rem] overflow-hidden">
              <div className="p-8 border-b border-gray-900 flex items-center justify-between">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Mission Deployment</h2>
                <Clock className="text-[#CCFF00] opacity-40" />
              </div>

              <div className="p-8 space-y-10">
                {/* Single Sessions */}
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mb-6">Individual Ops</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {trainerData.timeSlots && trainerData.timeSlots.length > 0 ? (
                      trainerData.timeSlots.map((slot, i) => (
                        <div key={i} className="flex flex-col sm:flex-row items-center justify-between p-6 bg-black border border-gray-900 rounded-2xl hover:border-[#CCFF00]/40 transition-all group">
                          <div className="flex items-center gap-6 mb-4 sm:mb-0">
                            <Calendar className="text-[#CCFF00] hidden sm:block" size={24} />
                            <div>
                              <p className="font-black text-xl italic uppercase tracking-tighter group-hover:text-[#CCFF00] transition-colors">
                                {format(new Date(slot.startDate), "MMMM dd, yyyy")}
                              </p>
                              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{slot.time}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="text-2xl font-black text-[#CCFF00] tracking-tighter italic">${slot.price}</p>
                              <p className="text-[8px] font-black text-gray-600 uppercase">Single Session</p>
                            </div>
                            <button
                              onClick={() => handleBookNow(slot.time, slot.price, slot.startDate)}
                              className="bg-[#CCFF00] text-black px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all"
                            >
                              Reserve
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center border-2 border-dashed border-gray-900 rounded-2xl italic text-gray-600 font-bold uppercase text-xs">No Active Slots</div>
                    )}
                  </div>
                </div>

                {/* Packages */}
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mb-6">Bulk Integration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {trainerData.packages?.map((pkg, i) => (
                      <div key={i} className="p-6 bg-black border border-gray-900 rounded-2xl hover:border-[#CCFF00]/40 transition-all flex flex-col justify-between">
                        <div className="mb-6">
                          <p className="text-[#CCFF00] text-[10px] font-black uppercase tracking-widest mb-1">{pkg.sessions} Sessions</p>
                          <h4 className="text-2xl font-black italic uppercase tracking-tighter">{pkg.time}</h4>
                          <p className="text-[10px] text-gray-600 font-bold mt-2 uppercase">{pkg.dateRange}</p>
                        </div>
                        <div className="flex items-center justify-between pt-6 border-t border-gray-900/50">
                          <p className="text-2xl font-black tracking-tighter italic">${pkg.price}</p>
                          <button
                            onClick={() => handleBookNow(pkg.time, pkg.price, pkg.dateRange, true)}
                            className="bg-white text-black px-6 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-[#CCFF00] transition-colors"
                          >
                            Select
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Reviews Column */}
          <div className="xl:col-span-4 space-y-8">
            <section className="bg-[#0B0B0B] border border-gray-900 rounded-[2rem] p-8">
              <h2 className="text-xl font-black italic uppercase tracking-tighter mb-8 border-b border-gray-900 pb-4">Social Proof</h2>

              <div className="space-y-6">
                {trainerReviews && trainerReviews.length > 0 ? (
                  trainerReviews.slice(0, visibleReviews).map((review) => (
                    <div key={review._id} className="p-6 bg-black border border-gray-900 rounded-2xl relative overflow-hidden">
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src={review.userId?.profileImageUrl || "/placeholder.svg"}
                          alt="Reviewer"
                          className="w-10 h-10 rounded-lg object-cover grayscale"
                        />
                        <div>
                          <p className="text-xs font-black uppercase tracking-tight">{review.userId?.name}</p>
                          <div className="flex gap-0.5">{renderStars(review.rating)}</div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 leading-relaxed italic">"{review.review}"</p>
                      <div className="absolute top-0 right-0 p-3 opacity-10">
                        <Award size={40} className="text-[#CCFF00]" />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-700 font-black uppercase text-[10px] tracking-widest text-center py-10 italic">Awaiting Feedback Logs</p>
                )}

                {trainerReviews && trainerReviews.length > visibleReviews && (
                  <button
                    onClick={() => setVisibleReviews(v => v + 3)}
                    className="w-full py-4 border border-gray-900 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-[#CCFF00] hover:border-[#CCFF00] transition-all"
                  >
                    View More Reports
                  </button>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div >
  );
};

export default TrainerDetails;