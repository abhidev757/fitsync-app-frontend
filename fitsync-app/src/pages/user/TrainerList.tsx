"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
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
    if (years >= 1 && years <= 2) {
      return "Beginner";
    } else if (years > 2 && years <= 4) {
      return "Intermediate";
    } else {
      // Assuming that 4+ years is Advanced
      return "Advanced";
    }
  };
  

  useEffect(() => {
    const loadTrainers = async () => {
      setIsLoading(true);
      try {
        const allTrainers = await fetchTrainers();
        console.log("Trainer data :", allTrainers);

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

  // State to hold fetched specializations
  const [specializationsList, setSpecializationsList] = useState<
    { _id: string; name: string; description: string; isBlock: boolean }[]
  >([]);

  // Fetch specializations when component mounts
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

    // 2. Apply Specialization filter
  if (activeFilters.specializations.length > 0) {
    filteredTrainers = filteredTrainers.filter(trainer => {
      // Normalize trainer.specializations to an array:
      const specs = Array.isArray(trainer.specializations)
        ? trainer.specializations
        : [trainer.specializations];
      
      // Check if any of the trainer's specializations match a selected filter
      return specs.some((specialization: string) =>
        activeFilters.specializations.some(
          (selectedSpec) => specialization.toLowerCase() === selectedSpec.toLowerCase()
        )
      );
    });
  }
// 3. Apply Experience Level filter using yearsOfExperience
if (activeFilters.experienceLevels.length > 0) {
  filteredTrainers = filteredTrainers.filter(trainer => {
    const trainerLevel = getExperienceLevel(trainer.yearsOfExperience);
    return activeFilters.experienceLevels.includes(trainerLevel);
  });
}

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredTrainers.slice(startIndex, endIndex);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleFilterChange = (
    filterType: keyof typeof activeFilters,
    value: string
  ) => {
    setActiveFilters((prev) => {
      const currentFilters = [...prev[filterType]];
      const index = currentFilters.indexOf(value);

      if (index === -1) {
        currentFilters.push(value);
      } else {
        currentFilters.splice(index, 1);
      }

      return {
        ...prev,
        [filterType]: currentFilters,
      };
    });
    setCurrentPage(1); // Reset to first page when filters change
  };

  const resetFilters = () => {
    setActiveFilters({
      specializations: [],
      experienceLevels: [],
    });
    setCurrentPage(1);
  };

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${
            index < rating ? "text-[#d9ff00] fill-[#d9ff00]" : "text-gray-400"
          }`}
        />
      ));
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = 1;
    let endPage = totalPages;

    if (totalPages > maxVisiblePages) {
      const half = Math.floor(maxVisiblePages / 2);
      startPage = Math.max(currentPage - half, 1);
      endPage = Math.min(currentPage + half, totalPages);

      if (currentPage <= half + 1) {
        endPage = maxVisiblePages;
      } else if (currentPage >= totalPages - half) {
        startPage = totalPages - maxVisiblePages + 1;
      }
    }

    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          className={`w-8 h-8 flex items-center justify-center rounded-full mx-1 ${
            currentPage === 1 ? "bg-[#2a2a2a]" : "hover:bg-[#2a2a2a]"
          }`}
          onClick={() => handlePageChange(1)}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="start-ellipsis" className="mx-1">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`w-8 h-8 flex items-center justify-center rounded-full mx-1 ${
            currentPage === i ? "bg-[#2a2a2a]" : "hover:bg-[#2a2a2a]"
          }`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="end-ellipsis" className="mx-1">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          className={`w-8 h-8 flex items-center justify-center rounded-full mx-1 ${
            currentPage === totalPages ? "bg-[#2a2a2a]" : "hover:bg-[#2a2a2a]"
          }`}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d9ff00] mx-auto mb-4"></div>
          <p>Loading trainers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Trainers List</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main content */}
          <div className="flex-1">
            {getCurrentTrainers().length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg">
                  No trainers found matching your filters.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-4 bg-[#d9ff00] hover:bg-[#c8e600] text-black font-medium py-2 px-4 rounded-md text-sm"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getCurrentTrainers().map((trainer) => (
                    <div
                      key={trainer._id}
                      className="bg-[#1a1a1a] rounded-lg overflow-hidden relative"
                    >
                      <div className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <img
                            src={trainer.profileImageUrl || "/placeholder.svg"}
                            alt={trainer.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                          <div>
                            <h3 className="text-[#d9ff00] font-bold">
                              {trainer.name}
                            </h3>
                            <p className="text-sm text-gray-300">
                              {trainer.specializations}
                            </p>
                          </div>
                        </div>

                        <div className="flex mb-2">
                          {renderStars(trainer.rating)}
                        </div>

                        <p className="text-sm text-gray-300 mb-4 line-clamp-2">
                          {trainer.description}
                        </p>

                        <div className="flex justify-between items-center">
                          <Link to={`/user/trainerDetails/${trainer._id}`}>
                            <button className="bg-[#2a2a2a] hover:bg-[#333333] text-xs font-medium py-1 px-4 rounded-full">
                              Book Session
                            </button>
                          </Link>
                          <Link
                            to={`/user/trainerDetails/${trainer._id}`}
                            className="text-[#d9ff00] text-xs"
                          >
                            View Profile
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center mt-8 text-sm">
                    <button
                      className="p-1 text-gray-400 hover:text-white disabled:opacity-30"
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                    >
                      <span className="flex items-center">
                        <ChevronLeft size={14} />
                        <ChevronLeft size={14} className="-ml-1" />
                      </span>
                    </button>
                    <button
                      className="p-1 mx-1 text-gray-400 hover:text-white disabled:opacity-30"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {renderPageNumbers()}

                    <button
                      className="p-1 mx-1 text-gray-400 hover:text-white disabled:opacity-30"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight size={16} />
                    </button>
                    <button
                      className="p-1 text-gray-400 hover:text-white disabled:opacity-30"
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      <span className="flex items-center">
                        <ChevronRight size={14} />
                        <ChevronRight size={14} className="-ml-1" />
                      </span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Filters sidebar - desktop */}
          <div className="hidden lg:block w-64 bg-[#1a1a1a] rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Filters</h2>

            {/* Specialization Filter */}
            <div className="mb-4">
              <h3 className="font-medium text-[#d9ff00] mb-2">
                Specialization
              </h3>
              <div className="space-y-1">
                {specializationsList.map(
                  (spec) => (
                    <label
                      key={spec._id}
                      className="flex items-center space-x-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        className="form-checkbox bg-gray-700 border-gray-600 rounded"
                        checked={activeFilters.specializations.includes(spec.name)}
                        onChange={() =>
                          handleFilterChange("specializations", spec.name)
                        }
                      />
                      <span>{spec.name  }</span>
                    </label>
                  )
                )}
              </div>
            </div>

            {/* Experience Level Filter */}
            <div className="mb-4">
              <h3 className="font-medium text-[#d9ff00] mb-2">
                Experience Level
              </h3>
              <div className="space-y-1">
                {["Beginner", "Intermediate", "Advanced"].map((level) => (
                  <label
                    key={level}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      className="form-checkbox bg-gray-700 border-gray-600 rounded"
                      checked={activeFilters.experienceLevels.includes(level)}
                      onChange={() =>
                        handleFilterChange("experienceLevels", level)
                      }
                    />
                    <span>{level}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex space-x-2">
              {/* <button
                className="flex-1 bg-[#d9ff00] hover:bg-[#c8e600] text-black font-medium py-2 px-4 rounded-md text-sm"
                onClick={() => setIsFilterOpen(false)}
              >
                Apply Filters
              </button> */}
              <button
                className="bg-[#2a2a2a] hover:bg-[#333333] text-white font-medium py-2 px-4 rounded-md text-sm"
                onClick={resetFilters}
              >
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
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Specialization */}
                <div className="mb-4">
                  <h3 className="font-medium text-[#d9ff00] mb-2">
                    Specialization
                  </h3>
                  <div className="space-y-1">
                    {[
                      "Strength Training",
                      "Yoga",
                      "Nutrition",
                      "Meditation",
                    ].map((spec) => (
                      <label
                        key={spec}
                        className="flex items-center space-x-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          className="form-checkbox bg-gray-700 border-gray-600 rounded"
                          checked={activeFilters.specializations.includes(spec)}
                          onChange={() =>
                            handleFilterChange("specializations", spec)
                          }
                        />
                        <span>{spec}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Experience Level */}
                <div className="mb-4">
                  <h3 className="font-medium text-[#d9ff00] mb-2">
                    Experience Level
                  </h3>
                  <div className="space-y-1">
                    {["Beginner", "Intermediate", "Advanced"].map((level) => (
                      <label
                        key={level}
                        className="flex items-center space-x-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          className="form-checkbox bg-gray-700 border-gray-600 rounded"
                          checked={activeFilters.experienceLevels.includes(
                            level
                          )}
                          onChange={() =>
                            handleFilterChange("experienceLevels", level)
                          }
                        />
                        <span>{level}</span>
                      </label>
                    ))}
                  </div>
                </div>

               

                <div className="flex space-x-2 mt-6">
                  <button
                    className="flex-1 bg-[#d9ff00] hover:bg-[#c8e600] text-black font-medium py-2 px-4 rounded-md text-sm"
                    onClick={() => setIsFilterOpen(false)}
                  >
                    Apply Filters
                  </button>
                  <button
                    className="bg-[#2a2a2a] hover:bg-[#333333] text-white font-medium py-2 px-4 rounded-md text-sm"
                    onClick={() => {
                      resetFilters();
                      setIsFilterOpen(false);
                    }}
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
  );
};

export default TrainersList;
