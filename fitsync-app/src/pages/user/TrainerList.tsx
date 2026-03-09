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
  yearsOfExperience: number
}

const ITEMS_PER_PAGE = 6;

const TrainersList: React.FC = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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
        setTotalPages(Math.ceil(allTrainers.length / ITEMS_PER_PAGE));
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

  const getCurrentTrainers = () => {
    let filteredTrainers = [...trainers];

    if (searchQuery) {
      filteredTrainers = filteredTrainers.filter((trainer) =>
        trainer.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeFilters.specializations.length > 0) {
      filteredTrainers = filteredTrainers.filter(trainer => {
        const specs = Array.isArray(trainer.specializations) ? trainer.specializations : [trainer.specializations];
        return specs.some((specialization: string) =>
          activeFilters.specializations.some((selectedSpec) => specialization.toLowerCase() === selectedSpec.toLowerCase())
        );
      });
    }

    if (activeFilters.experienceLevels.length > 0) {
      filteredTrainers = filteredTrainers.filter(trainer => {
        const trainerLevel = getExperienceLevel(trainer.yearsOfExperience);
        return activeFilters.experienceLevels.includes(trainerLevel);
      });
    }

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTrainers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

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

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, index) => (
      <Star
        key={index}
        className={`h-3 w-3 ${index < rating ? "text-[#CCFF00] fill-[#CCFF00]" : "text-gray-800"}`}
      />
    ));
  };

  const renderPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          className={`w-10 h-10 flex items-center justify-center rounded-xl font-black transition-all ${currentPage === i ? "bg-[#CCFF00] text-black shadow-[0_0_15px_rgba(204,255,0,0.3)]" : "text-gray-500 hover:text-white hover:bg-gray-900"
            }`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 border-4 border-t-[#CCFF00] border-gray-900 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[#CCFF00]">Scanning Roster</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <p className="text-[#CCFF00] font-black text-xs tracking-widest uppercase mb-1">Elite Marketplace</p>
            <h1 className="text-5xl font-black tracking-tighter uppercase italic">The Trainers List</h1>
          </div>
          {searchQuery && (
            <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">
              Results for: <span className="text-white italic">"{searchQuery}"</span>
            </p>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Filters sidebar - desktop */}
          <div className="hidden lg:block w-72 bg-[#0B0B0B] border border-gray-900 rounded-3xl p-8 h-fit sticky top-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black italic tracking-tighter uppercase">Filters</h2>
              <Filter size={18} className="text-[#CCFF00]" />
            </div>

            <div className="space-y-10">
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Specialization</h3>
                <div className="space-y-3">
                  {specializationsList.map((spec) => (
                    <label key={spec._id} className="flex items-center group cursor-pointer">
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={activeFilters.specializations.includes(spec.name)}
                        onChange={() => handleFilterChange("specializations", spec.name)}
                      />
                      <div className={`w-4 h-4 rounded border flex items-center justify-center mr-3 transition-all ${activeFilters.specializations.includes(spec.name) ? "bg-[#CCFF00] border-[#CCFF00]" : "border-gray-800 group-hover:border-white"}`}>
                        {activeFilters.specializations.includes(spec.name) && <X size={10} className="text-black font-bold" />}
                      </div>
                      <span className={`text-sm font-bold transition-colors ${activeFilters.specializations.includes(spec.name) ? "text-white" : "text-gray-600 group-hover:text-gray-300"}`}>{spec.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Experience Level</h3>
                <div className="space-y-3">
                  {["Beginner", "Intermediate", "Advanced"].map((level) => (
                    <label key={level} className="flex items-center group cursor-pointer">
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={activeFilters.experienceLevels.includes(level)}
                        onChange={() => handleFilterChange("experienceLevels", level)}
                      />
                      <div className={`w-4 h-4 rounded border flex items-center justify-center mr-3 transition-all ${activeFilters.experienceLevels.includes(level) ? "bg-[#CCFF00] border-[#CCFF00]" : "border-gray-800 group-hover:border-white"}`}>
                        {activeFilters.experienceLevels.includes(level) && <X size={10} className="text-black font-bold" />}
                      </div>
                      <span className={`text-sm font-bold transition-colors ${activeFilters.experienceLevels.includes(level) ? "text-white" : "text-gray-600 group-hover:text-gray-300"}`}>{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                className="w-full py-4 bg-gray-900 text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-white hover:text-black transition-all"
                onClick={resetFilters}
              >
                Reset All
              </button>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1">
            {getCurrentTrainers().length === 0 ? (
              <div className="bg-[#0B0B0B] border border-dashed border-gray-900 rounded-3xl py-32 text-center">
                <p className="text-gray-600 font-black uppercase tracking-widest italic mb-6">No Personnel Found</p>
                <button onClick={resetFilters} className="text-[#CCFF00] font-black uppercase text-[10px] tracking-[0.2em] border-b border-[#CCFF00] pb-1">
                  Clear Parameters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {getCurrentTrainers().map((trainer) => (
                  <div key={trainer._id} className="bg-[#0B0B0B] border border-gray-900 rounded-3xl overflow-hidden group hover:border-[#CCFF00]/40 transition-all flex flex-col">
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={trainer.profileImageUrl || "/placeholder.svg"}
                        alt={trainer.name}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                      />
                      <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-gray-800">
                        <div className="flex items-center gap-1.5">
                          {renderStars(trainer.rating)}
                          <span className="text-[10px] font-black text-white ml-1">{trainer.rating > 0 ? trainer.rating : "NEW"}</span>
                        </div>
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <span className="bg-[#CCFF00] text-black text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-md shadow-lg">
                          {getExperienceLevel(trainer.yearsOfExperience)}
                        </span>
                      </div>
                    </div>

                    <div className="p-8 flex-1 flex flex-col">
                      <h3 className="text-2xl font-black tracking-tight uppercase italic mb-1 group-hover:text-[#CCFF00] transition-colors">{trainer.name}</h3>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6">{trainer.specializations}</p>

                      <p className="text-gray-400 text-sm leading-relaxed mb-8 line-clamp-2">
                        {trainer.description}
                      </p>

                      <div className="mt-auto flex items-center justify-between pt-6 border-t border-gray-900">
                        <Link to={`/user/trainerDetails/${trainer._id}`}>
                          <button className="bg-[#CCFF00] text-black text-[10px] font-black uppercase tracking-widest py-3 px-6 rounded-xl hover:shadow-[0_0_15px_rgba(204,255,0,0.3)] transition-all">
                            Book Session
                          </button>
                        </Link>
                        <Link to={`/user/trainerDetails/${trainer._id}`} className="text-white hover:text-[#CCFF00] transition-colors">
                          <Award size={20} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center mt-16 gap-3">
                <button
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-[#CCFF00] disabled:opacity-10"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-2">
                  {renderPageNumbers()}
                </div>
                <button
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-[#CCFF00] disabled:opacity-10"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter button */}
      <button
        className="fixed bottom-8 right-8 lg:hidden z-50 bg-[#CCFF00] text-black rounded-2xl p-4 shadow-2xl active:scale-90 transition-transform"
        onClick={() => setIsFilterOpen(!isFilterOpen)}
      >
        <Filter size={24} />
      </button>

      {/* Mobile filter panel overlay */}
      {isFilterOpen && (
        <div className="fixed inset-0 bg-black/95 z-[60] p-8 flex flex-col lg:hidden overflow-y-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Parameters</h2>
            <button onClick={() => setIsFilterOpen(false)} className="text-[#CCFF00]">
              <X size={32} />
            </button>
          </div>

          <div className="space-y-12">
            {/* Content similar to sidebar but adapted for mobile */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-600 mb-6">Specializations</h3>
              <div className="grid grid-cols-2 gap-4">
                {specializationsList.map(spec => (
                  <button
                    key={spec._id}
                    onClick={() => handleFilterChange("specializations", spec.name)}
                    className={`py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${activeFilters.specializations.includes(spec.name) ? "bg-[#CCFF00] border-[#CCFF00] text-black" : "bg-transparent border-gray-800 text-gray-500"}`}
                  >
                    {spec.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              className="w-full py-5 bg-[#CCFF00] text-black font-black uppercase tracking-widest rounded-2xl"
              onClick={() => setIsFilterOpen(false)}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainersList;