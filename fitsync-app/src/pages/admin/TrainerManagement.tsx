import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../../components/admin/SearchBar";
import ActionButton from "../../components/admin/ActionButton";
import Pagination from "../../components/admin/Pagination";
import { getAllTrainer, updateTrainerStatus, getTrainerReviews } from "../../axios/adminApi";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";

interface Trainer {
  _id: string;
  name: string;
  specializations: string[];
  isBlocked: boolean;
  verificationStatus: boolean;
  createdAt: string;
  avgRating?: number;
}

const ITEMS_PER_PAGE = 7;

const TrainerManagement = () => {
  const navigate = useNavigate();
  const { adminInfo } = useSelector((state: RootState) => state.adminAuth);

  useEffect(() => {
    if (!adminInfo) navigate("/adminLogin");
  }, [navigate, adminInfo]);

  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [pendingAction, setPendingAction] = useState<"Block" | "Unblock" | null>(null);

  useEffect(() => {
    const fetchTrainers = async () => {
      setLoading(true);
      try {
        const data = await getAllTrainer();
        const formatted: Trainer[] = data.map((trainer: Trainer) => ({
          ...trainer,
        }));

        const withRatings = await Promise.all(
          formatted.map(async (trainer) => {
            try {
              const reviews = await getTrainerReviews(trainer._id);
              if (Array.isArray(reviews) && reviews.length > 0) {
                const avg = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length;
                return { ...trainer, avgRating: parseFloat(avg.toFixed(1)) };
              }
            } catch { /* fine */ }
            return { ...trainer, avgRating: undefined };
          })
        );

        setTrainers(withRatings);
      } catch (error) {
        toast.error("Failed to fetch trainers");
      } finally {
        setLoading(false);
      }
    };
    fetchTrainers();
  }, []);

  const handleSearch = (value: string) => { setSearchTerm(value); setCurrentPage(1); };
  const handlePageChange = (page: number) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const handleViewTrainer = (id: string) => navigate(`/admin/trainerDetails/${id}`);
  
  const handleToggleStatus = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    setPendingAction(trainer.isBlocked ? "Unblock" : "Block");
    setShowConfirmModal(true);
  };

  const confirmToggle = async () => {
    if (!selectedTrainer || !pendingAction) return;
    try {
      const newStatus = pendingAction === "Block";
      await updateTrainerStatus(selectedTrainer._id, newStatus);
      setTrainers((prev) => prev.map((t) => t._id === selectedTrainer._id ? { ...t, isBlocked: newStatus } : t));
      toast.success(`Trainer ${pendingAction.toLowerCase()}ed successfully`);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setShowConfirmModal(false);
      setSelectedTrainer(null);
      setPendingAction(null);
    }
  };

  const filteredTrainers = trainers
    .filter((trainer) => trainer.verificationStatus === true)
    .filter((trainer) =>
      trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (trainer.specializations?.some((spec) => spec.toLowerCase().includes(searchTerm.toLowerCase())))
    );

  const paginatedTrainers = filteredTrainers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setTotalPages(Math.max(1, Math.ceil(filteredTrainers.length / ITEMS_PER_PAGE)));
  }, [filteredTrainers]);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">Trainer Management</h1>
        <div className="w-full md:w-72">
          <SearchBar onChange={handleSearch} />
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Syncing records...</p>
          </div>
        ) : filteredTrainers.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400">No trainers matching your criteria found.</p>
          </div>
        ) : (
          <>
            {/* Desktop View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Specializations</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Join Date</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {paginatedTrainers.map((trainer) => (
                    <tr key={trainer._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{trainer.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {trainer.specializations?.join(", ") || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {trainer.avgRating ? (
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star size={14} fill="currentColor" /> {trainer.avgRating}
                          </div>
                        ) : <span className="text-gray-500">—</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${trainer.isBlocked ? "bg-red-500/20 text-red-500" : "bg-green-500/20 text-green-500"}`}>
                          {trainer.isBlocked ? "Blocked" : "Active"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(trainer.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                        <ActionButton variant="view" onClick={() => handleViewTrainer(trainer._id)}>View</ActionButton>
                        <ActionButton variant={trainer.isBlocked ? "Unblock" : "Block"} onClick={() => handleToggleStatus(trainer)}>
                          {trainer.isBlocked ? "Unblock" : "Block"}
                        </ActionButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet View (Cards) */}
            <div className="lg:hidden divide-y divide-gray-700">
              {paginatedTrainers.map((trainer) => (
                <div key={trainer._id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-white font-bold">{trainer.name}</h3>
                      <p className="text-xs text-gray-400">{trainer.specializations?.join(", ") || "No specialization"}</p>
                    </div>
                    <span className={`px-2 py-1 text-[9px] font-bold uppercase rounded ${trainer.isBlocked ? "bg-red-500/20 text-red-500" : "bg-green-500/20 text-green-500"}`}>
                      {trainer.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs border-t border-gray-700 pt-3">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-yellow-500">
                            <Star size={12} fill="currentColor" /> {trainer.avgRating || "N/A"}
                        </div>
                        <span className="text-gray-500">{new Date(trainer.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleViewTrainer(trainer._id)} className="text-blue-500 font-bold p-2">View</button>
                      <button 
                        onClick={() => handleToggleStatus(trainer)}
                        className={`font-bold p-2 ${trainer.isBlocked ? "text-green-500" : "text-red-500"}`}
                      >
                        {trainer.isBlocked ? "Unblock" : "Block"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-700 bg-gray-900/20">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && selectedTrainer && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-sm text-center shadow-2xl"
            >
              <h2 className="text-xl font-bold text-white mb-2">{pendingAction} Trainer</h2>
              <p className="text-gray-400 text-sm mb-6">
                Are you sure you want to {pendingAction?.toLowerCase()} <span className="text-white font-bold">{selectedTrainer.name}</span>?
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-3 bg-gray-700 text-white rounded-lg font-bold">Cancel</button>
                <button
                  onClick={confirmToggle}
                  className={`flex-1 py-3 rounded-lg font-bold text-white ${pendingAction === "Block" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TrainerManagement;