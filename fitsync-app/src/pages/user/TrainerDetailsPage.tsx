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
        className={`h-2.5 w-2.5 md:h-3 md:w-3 ${index < rating ? "text-[#CCFF00] fill-[#CCFF00]" : "text-gray-800"}`}
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
          <div className="h-10 w-10 border-2 border-t-[#CCFF00] border-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#CCFF00]">Analyzing Dossier</p>
        </div>
      </div>
    );
  }

  if (!trainerData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter">Personnel Not Found</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans p-4 md:p-8 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto">

        {/* Header Navigation */}
        <div className="flex items-center gap-4 mb-6 md:mb-10">
          <button onClick={() => navigate(-1)} className="p-2.5 bg-gray-900 rounded-xl text-gray-400 hover:text-[#CCFF00] active:scale-90 transition-all">
            <ChevronLeft size={20} />
          </button>
          <div>
            <p className="text-[#CCFF00] font-black text-[9px] tracking-[0.4em] uppercase mb-0.5">Tactical Deployment</p>
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic">Agent Profile</h1>
          </div>
        </div>

        {/* Hero Section - Mobile Stacked */}
        <div className="bg-[#0B0B0B] border border-gray-900 rounded-[2rem] p-6 md:p-10 mb-8 md:mb-12 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#CCFF00] opacity-5 blur-[80px] pointer-events-none"></div>

          <div className="flex flex-col lg:flex-row gap-8 md:gap-12 items-center lg:items-start relative z-10 text-center lg:text-left">
            <div className="relative group shrink-0">
              <div className="absolute -inset-1 bg-[#CCFF00] rounded-[2rem] blur opacity-10"></div>
              <img
                src={trainerData.profileImageUrl || "/placeholder.svg"}
                alt={trainerData.name}
                className="relative w-40 h-56 md:w-56 md:h-72 rounded-[1.5rem] object-cover grayscale brightness-90 border border-gray-800"
              />
              <div className="absolute -bottom-2 -right-2 bg-black p-2.5 rounded-2xl border border-gray-800 shadow-xl">
                <ShieldCheck className="text-[#CCFF00]" size={20} />
              </div>
            </div>

            <div className="flex-1 w-full">
              <div className="mb-6">
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic mb-3 leading-none">
                  {trainerData.name}
                </h2>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <span className="text-[#CCFF00] text-[9px] font-black uppercase tracking-widest bg-[#CCFF00]/10 px-3 py-1.5 rounded-lg border border-[#CCFF00]/20">
                    {trainerData.specializations}
                  </span>
                  <div className="flex items-center gap-2 bg-gray-950 px-3 py-1.5 rounded-lg border border-gray-900">
                    {renderStars(avgRating)}
                    <span className="text-[10px] font-black text-white mt-0.5">{avgRating > 0 ? avgRating : "NEW"}</span>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-[10px] font-black uppercase text-gray-600 tracking-[0.3em] mb-4">Professional Dossier</h3>
                <p className="text-gray-400 text-sm md:text-lg leading-relaxed italic border-l-2 border-[#CCFF00]/30 pl-4 md:pl-6 text-left">
                  "{trainerData.bio}"
                </p>
              </div>

              {trainerData.experience && trainerData.experience.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  {trainerData.experience.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 bg-black/40 border border-gray-900 p-4 rounded-xl hover:border-[#CCFF00]/20 transition-all text-left">
                      <Award className="text-[#CCFF00] shrink-0" size={16} />
                      <span className="text-[10px] md:text-xs font-bold text-gray-300 uppercase tracking-tight">{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action & Feedback Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 md:gap-12">

          {/* Sessions Column */}
          <div className="xl:col-span-8 space-y-8 md:space-y-12">
            <section className="bg-[#0B0B0B] border border-gray-900 rounded-[2rem] overflow-hidden">
              <div className="p-6 md:p-8 border-b border-gray-900 flex items-center justify-between bg-black/20">
                <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter">Grid Deployment</h2>
                <Clock className="text-[#CCFF00] opacity-30" size={20} />
              </div>

              <div className="p-6 md:p-8 space-y-10">
                {/* Single Sessions */}
                <div>
                  <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-600 mb-6">Unit Operations</h3>
                  <div className="space-y-4">
                    {(() => {
                      const getFutureSlots = () => {
                        if (!trainerData.timeSlots) return [];
                        const now = new Date();
                        return trainerData.timeSlots.filter(slot => {
                          const slotDate = new Date(slot.startDate);
                          const timeStr = slot.time.split('-')[0].trim();
                          const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
                          if (timeMatch) {
                            let hours = parseInt(timeMatch[1], 10);
                            const minutes = parseInt(timeMatch[2], 10);
                            const period = timeMatch[3].toUpperCase();
                            if (period === 'PM' && hours < 12) hours += 12;
                            if (period === 'AM' && hours === 12) hours = 0;
                            slotDate.setHours(hours, minutes, 0, 0);
                          }
                          return slotDate > now;
                        });
                      };
                      const futureSlots = getFutureSlots();

                      return futureSlots.length > 0 ? (
                        futureSlots.map((slot, i) => (
                          <div key={i} className="flex flex-col sm:flex-row items-center justify-between p-5 md:p-6 bg-black border border-gray-900 rounded-2xl hover:border-[#CCFF00]/40 transition-all group gap-4">
                            <div className="flex items-center gap-4 md:gap-6 w-full sm:w-auto">
                              <Calendar className="text-[#CCFF00] shrink-0" size={20} />
                              <div className="text-left">
                                <p className="font-black text-lg md:text-xl italic uppercase tracking-tighter group-hover:text-[#CCFF00] transition-colors">
                                  {format(new Date(slot.startDate), "MMM dd, yyyy")}
                                </p>
                                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{slot.time}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-0 border-gray-900">
                              <div className="text-left sm:text-right">
                                <p className="text-xl md:text-2xl font-black text-[#CCFF00] tracking-tighter italic">₹{slot.price}</p>
                                <p className="text-[8px] font-black text-gray-600 uppercase">Per Session</p>
                              </div>
                              <button
                                onClick={() => handleBookNow(slot.time, slot.price, slot.startDate)}
                                className="bg-[#CCFF00] text-black px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-[0.1em] hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all active:scale-95"
                              >
                                Reserve
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-12 text-center border-2 border-dashed border-gray-900 rounded-2xl italic text-gray-700 font-black uppercase text-[10px] tracking-widest">No Active Telemetry</div>
                      );
                    })()}
                  </div>
                </div>

                {/* Packages - Mobile Friendly Grid */}
                <div>
                  <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-600 mb-6 italic">Tactical Bundles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {trainerData.packages?.map((pkg, i) => (
                      <div key={i} className="p-6 bg-black border border-gray-900 rounded-2xl hover:border-[#CCFF00]/40 transition-all flex flex-col justify-between group">
                        <div className="mb-8">
                          <p className="text-[#CCFF00] text-[10px] font-black uppercase tracking-[0.2em] mb-2">{pkg.sessions} Deployment Sessions</p>
                          <h4 className="text-2xl font-black italic uppercase tracking-tighter group-hover:text-white transition-colors">{pkg.time}</h4>
                          <p className="text-[9px] text-gray-600 font-bold mt-2 uppercase tracking-widest">{pkg.dateRange}</p>
                        </div>
                        <div className="flex items-center justify-between pt-6 border-t border-gray-900">
                          <p className="text-2xl font-black tracking-tighter italic">₹{pkg.price}</p>
                          <button
                            onClick={() => handleBookNow(pkg.time, pkg.price, pkg.dateRange, true)}
                            className="bg-white text-black px-6 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-[#CCFF00] transition-colors active:scale-95"
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
            <section className="bg-[#0B0B0B] border border-gray-900 rounded-[2rem] p-6 md:p-8">
              <h2 className="text-lg md:text-xl font-black italic uppercase tracking-tighter mb-8 border-b border-gray-900 pb-4">Social Intel</h2>

              <div className="space-y-6">
                {trainerReviews && trainerReviews.length > 0 ? (
                  trainerReviews.slice(0, visibleReviews).map((review) => (
                    <div key={review._id} className="p-5 bg-black/50 border border-gray-900 rounded-2xl relative overflow-hidden group">
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src={review.userId?.profileImageUrl || "/placeholder.svg"}
                          alt="Reviewer"
                          className="w-10 h-10 rounded-lg object-cover grayscale group-hover:grayscale-0 transition-all"
                        />
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-tight leading-none mb-1">{review.userId?.name}</p>
                          <div className="flex gap-0.5">{renderStars(review.rating)}</div>
                        </div>
                      </div>
                      <p className="text-xs md:text-sm text-gray-500 leading-relaxed italic">"{review.review}"</p>
                      <div className="absolute -top-1 -right-1 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                        <Award size={64} className="text-[#CCFF00]" />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-800 font-black uppercase text-[10px] tracking-[0.3em] text-center py-12 italic">Awaiting Feedback Logs</p>
                )}

                {trainerReviews && trainerReviews.length > visibleReviews && (
                  <button
                    onClick={() => setVisibleReviews(v => v + 3)}
                    className="w-full py-4 border border-gray-800 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 hover:text-[#CCFF00] hover:border-[#CCFF00] transition-all active:scale-95"
                  >
                    Load More Reports
                  </button>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerDetails;