"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, ChevronLeft, ChevronRight, Filter, X, Award } from "lucide-react";
import { fetchSpecialization, fetchTrainers } from "../../axios/userApi";
import { useTrainerSearchStore } from "../../util/useSearchTrainer";

interface Trainer {
  _id: string;
  name: string;
  specializations: string;
  profileImageUrl: string;
  rating: number;
  description: string;
  yearsOfExperience: number;
}

const ITEMS_PER_PAGE = 8; // Increased for 2-column layout symmetry

const TrainersList: React.FC = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    specializations: [] as string[],
    experienceLevels: [] as string[],
  });

  const { searchQuery } = useTrainerSearchStore();

  const getExperienceLevel = (years: number): "Beginner" | "Intermediate" | "Advanced" => {
    if (years >= 1 && years <= 2) return "Beginner";
    if (years > 2 && years <= 4) return "Intermediate";
    return "Advanced";
  };

  useEffect(() => {
    const loadTrainers = async () => {
      setIsLoading(true);
      try {
        const allTrainers = await fetchTrainers();
        setTrainers(allTrainers);
      } catch (error) {
        console.error("Failed to fetch trainers:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTrainers();
  }, []);

  const [specializationsList, setSpecializationsList] = useState<{ _id: string; name: string; description: string; isBlock: boolean }[]>([]);

  useEffect(() => {
    const getSpecializations = async () => {
      try {
        const data = await fetchSpecialization();
        setSpecializationsList(data);
      } catch (error) {
        console.error("Error fetching specializations:", error);
      }
    };
    getSpecializations();
  }, []);

  const getFilteredTrainers = () => {
    let filtered = [...trainers];

    if (searchQuery) {
      filtered = filtered.filter((trainer) =>
        trainer.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeFilters.specializations.length > 0) {
      filtered = filtered.filter(trainer => {
        const specs = Array.isArray(trainer.specializations) ? trainer.specializations : [trainer.specializations];
        return specs.some((specialization: string) =>
          activeFilters.specializations.some((selectedSpec) => specialization.toLowerCase() === selectedSpec.toLowerCase())
        );
      });
    }

    if (activeFilters.experienceLevels.length > 0) {
      filtered = filtered.filter(trainer => {
        const trainerLevel = getExperienceLevel(trainer.yearsOfExperience);
        return activeFilters.experienceLevels.includes(trainerLevel);
      });
    }

    return filtered;
  };

  const filteredTrainers = getFilteredTrainers();
  const totalPages = Math.ceil(filteredTrainers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentTrainers = filteredTrainers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleFilterChange = (filterType: keyof typeof activeFilters, value: string) => {
    setActiveFilters((prev) => {
      const currentFilters = [...prev[filterType]];
      const index = currentFilters.indexOf(value);
      if (index === -1) currentFilters.push(value);
      else currentFilters.splice(index, 1);
      return { ...prev, [filterType]: currentFilters };
    });
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setActiveFilters({ specializations: [], experienceLevels: [] });
    setCurrentPage(1);
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5 md:gap-1.5">
      {Array(5).fill(0).map((_, index) => (
        <Star
          key={index}
          className={`h-2 w-2 md:h-3 md:w-3 ${index < rating ? "text-[#CCFF00] fill-[#CCFF00]" : "text-gray-800"}`}
        />
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 md:h-16 md:w-16 border-4 border-t-[#CCFF00] border-gray-900 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#CCFF00]">Scanning Roster</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans p-4 md:p-8 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-16 gap-4">
          <div>
            <p className="text-[#CCFF00] font-black text-[10px] tracking-[0.4em] uppercase mb-1">Elite Marketplace</p>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">The Trainers</h1>
          </div>
          {searchQuery && (
            <p className="text-gray-600 font-bold uppercase text-[9px] tracking-widest italic">
              Filtered for: <span className="text-white">"{searchQuery}"</span>
            </p>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8 md:gap-12">
          {/* Filters sidebar - desktop */}
          <div className="hidden lg:block w-72 bg-[#0B0B0B] border border-gray-900 rounded-[2rem] p-8 h-fit sticky top-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black italic tracking-tighter uppercase text-[#CCFF00]">Parameters</h2>
              <Filter size={18} className="text-[#CCFF00]" />
            </div>

            <div className="space-y-10">
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4 border-l-2 border-[#CCFF00] pl-2">Specialization</h3>
                <div className="space-y-3">
                  {specializationsList.map((spec) => (
                    <label key={spec._id} className="flex items-center group cursor-pointer">
                      <input type="checkbox" className="hidden" checked={activeFilters.specializations.includes(spec.name)} onChange={() => handleFilterChange("specializations", spec.name)} />
                      <div className={`w-4 h-4 rounded border flex items-center justify-center mr-3 transition-all ${activeFilters.specializations.includes(spec.name) ? "bg-[#CCFF00] border-[#CCFF00]" : "border-gray-800"}`}>
                        {activeFilters.specializations.includes(spec.name) && <X size={10} className="text-black font-bold" />}
                      </div>
                      <span className={`text-xs font-bold transition-colors ${activeFilters.specializations.includes(spec.name) ? "text-white" : "text-gray-600 group-hover:text-gray-300"}`}>{spec.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4 border-l-2 border-[#CCFF00] pl-2">Rank</h3>
                <div className="space-y-3">
                  {["Beginner", "Intermediate", "Advanced"].map((level) => (
                    <label key={level} className="flex items-center group cursor-pointer">
                      <input type="checkbox" className="hidden" checked={activeFilters.experienceLevels.includes(level)} onChange={() => handleFilterChange("experienceLevels", level)} />
                      <div className={`w-4 h-4 rounded border flex items-center justify-center mr-3 transition-all ${activeFilters.experienceLevels.includes(level) ? "bg-[#CCFF00] border-[#CCFF00]" : "border-gray-800"}`}>
                        {activeFilters.experienceLevels.includes(level) && <X size={10} className="text-black font-bold" />}
                      </div>
                      <span className={`text-xs font-bold transition-colors ${activeFilters.experienceLevels.includes(level) ? "text-white" : "text-gray-600 group-hover:text-gray-300"}`}>{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button className="w-full py-4 bg-gray-900 text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-white hover:text-black transition-all active:scale-95" onClick={resetFilters}>
                Reset Registry
              </button>
            </div>
          </div>

          {/* Main content grid - 2 columns on mobile */}
          <div className="flex-1">
            {currentTrainers.length === 0 ? (
              <div className="bg-[#0B0B0B] border border-dashed border-gray-900 rounded-[2.5rem] py-24 text-center px-6">
                <p className="text-gray-700 font-black uppercase tracking-widest italic mb-6 text-[10px]">No Matching Operatives</p>
                <button onClick={resetFilters} className="text-[#CCFF00] font-black uppercase text-[9px] tracking-[0.3em] border-b border-[#CCFF00] pb-1">Clear All Parameters</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-8">
                {currentTrainers.map((trainer) => (
                  <div key={trainer._id} className="bg-[#0B0B0B] border border-gray-900 rounded-2xl md:rounded-[2.5rem] overflow-hidden group hover:border-[#CCFF00]/40 transition-all flex flex-col shadow-2xl">
                    <div className="relative h-40 md:h-72 overflow-hidden">
                      <img src={trainer.profileImageUrl || "/placeholder.svg"} alt={trainer.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" />
                      <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-black/80 backdrop-blur-md px-1.5 md:px-3 py-1 rounded-lg border border-gray-800/50">
                        {renderStars(trainer.rating)}
                      </div>
                      <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4">
                        <span className="bg-[#CCFF00] text-black text-[7px] md:text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md shadow-lg">
                          {getExperienceLevel(trainer.yearsOfExperience)}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 md:p-8 flex-1 flex flex-col">
                      <h3 className="text-xs md:text-2xl font-black tracking-tighter uppercase italic mb-0.5 group-hover:text-[#CCFF00] transition-colors truncate">{trainer.name}</h3>
                      <p className="text-[7px] md:text-[9px] font-black text-gray-600 uppercase tracking-widest mb-3 md:mb-6 truncate">{trainer.specializations}</p>
                      
                      <div className="mt-auto flex items-center justify-between pt-3 md:pt-6 border-t border-gray-900">
                        <Link to={`/user/trainerDetails/${trainer._id}`} className="w-full md:w-auto">
                          <button className="w-full bg-[#CCFF00] text-black text-[8px] md:text-[10px] font-black uppercase tracking-wider py-2 md:py-3.5 px-2 md:px-6 rounded-lg md:rounded-xl hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all active:scale-95">Book Now</button>
                        </Link>
                        <Award size={18} className="hidden md:block text-gray-700 hover:text-[#CCFF00] transition-colors" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center mt-12 md:mt-16 gap-2 md:gap-4 overflow-x-auto py-2">
                <button className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-gray-700 hover:text-[#CCFF00] disabled:opacity-5" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                  <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i + 1} className={`min-w-[32px] md:min-w-[40px] h-8 md:h-10 flex items-center justify-center rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black transition-all ${currentPage === i + 1 ? "bg-[#CCFF00] text-black" : "bg-[#0B0B0B] text-gray-600 border border-gray-900"}`} onClick={() => handlePageChange(i + 1)}>{i + 1}</button>
                  ))}
                </div>
                <button className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-gray-700 hover:text-[#CCFF00] disabled:opacity-5" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Mobile Filter Button */}
      <button className="fixed bottom-24 right-6 lg:hidden z-50 bg-[#CCFF00] text-black rounded-2xl p-4 shadow-2xl active:scale-90 transition-all border-4 border-black" onClick={() => setIsFilterOpen(true)}>
        <Filter size={24} />
      </button>

      {/* Mobile Filter Overlay */}
      {isFilterOpen && (
        <div className="fixed inset-0 bg-black/95 z-[100] p-6 flex flex-col lg:hidden animate-in slide-in-from-bottom duration-500 overflow-y-auto">
          <div className="flex justify-between items-center mb-10">
            <div>
              <p className="text-[#CCFF00] font-black text-[10px] tracking-[0.4em] uppercase">Tactical</p>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">Parameters</h2>
            </div>
            <button onClick={() => setIsFilterOpen(false)} className="bg-gray-900 p-3 rounded-2xl text-[#CCFF00]"><X size={24} /></button>
          </div>

          <div className="space-y-12">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-6 italic border-l-2 border-[#CCFF00] pl-3">Domains</h3>
              <div className="grid grid-cols-2 gap-3">
                {specializationsList.map(spec => (
                  <button key={spec._id} onClick={() => handleFilterChange("specializations", spec.name)} className={`py-4 px-2 rounded-xl text-[9px] font-black uppercase border transition-all ${activeFilters.specializations.includes(spec.name) ? "bg-[#CCFF00] border-[#CCFF00] text-black" : "bg-black border-gray-900 text-gray-600"}`}>{spec.name}</button>
                ))}
              </div>
            </div>
            <button className="w-full py-5 bg-[#CCFF00] text-black font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-2xl" onClick={() => setIsFilterOpen(false)}>Apply Roster</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainersList;