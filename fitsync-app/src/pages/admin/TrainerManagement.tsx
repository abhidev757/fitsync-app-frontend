import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../../components/admin/SearchBar";
import ActionButton from "../../components/admin/ActionButton";
import Pagination from "../../components/admin/Pagination";
import { getAllTrainer, updateTrainerStatus } from "../../axios/adminApi";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { motion } from "framer-motion";

interface Trainer {
  _id: string;
  name: string;
  specializations: string[];
  isBlocked: boolean
  createdAt: string;
}

const ITEMS_PER_PAGE = 7;

const TrainerManagement = () => {
  const navigate = useNavigate();
  const { adminInfo } = useSelector((state: RootState) => state.adminAuth);

  useEffect(() => {
    if (!adminInfo) {
      navigate("/adminLogin");
    }
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
        const formattedTrainers = data.map((trainer: Trainer) => ({
          ...trainer,
          status: trainer.isBlocked ? "Unblock" : "Block",
        }));
        setTrainers(formattedTrainers);
        setTotalPages(Math.ceil(formattedTrainers.length / ITEMS_PER_PAGE));
      } catch (error) {
        console.error("Error fetching trainers:", error);
        toast.error("Failed to fetch trainers");
      } finally {
        setLoading(false);
      }
    };
    fetchTrainers();
  }, []);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleViewTrainer = (id: string) => {
    navigate(`/admin/trainerDetails/${id}`);
  };

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

      setTrainers((prev) =>
        prev.map((t) =>
          t._id === selectedTrainer._id ? { ...t, isBlocked: newStatus } : t
        )
      );
      toast.success(`Trainer ${pendingAction === "Block" ? "blocked" : "unblocked"} successfully`);
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update trainer status");
    } finally {
      setShowConfirmModal(false);
      setSelectedTrainer(null);
      setPendingAction(null);
    }
  };

  // Filter trainers based on search term
  const filteredTrainers = trainers.filter((trainer) => 
    trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (Array.isArray(trainer.specializations) &&
      trainer.specializations.some((spec) =>
        spec.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  );

  // Calculate pagination
  const paginatedTrainers = filteredTrainers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Update total pages when search term changes
  useEffect(() => {
    const newTotalPages = Math.max(1, Math.ceil(filteredTrainers.length / ITEMS_PER_PAGE));
    setTotalPages(newTotalPages);
    if (currentPage > newTotalPages) {
      setCurrentPage(1);
    }
  }, [filteredTrainers.length, currentPage]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-white mb-6">Trainer List</h1>
      <SearchBar onChange={handleSearch} />

      <div className="bg-gray-800 rounded-lg overflow-hidden mt-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white">Loading trainers...</p>
          </div>
        ) : filteredTrainers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white">No trainers found matching your search.</p>
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Specializations</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {paginatedTrainers.map((trainer) => (
                  <tr key={trainer._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{trainer.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {trainer.specializations?.join(", ") || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        trainer.isBlocked ? "bg-red-500 text-white" : "bg-green-500 text-white"
                      }`}>
                        {trainer.isBlocked}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {new Date(trainer.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <ActionButton variant="view" onClick={() => handleViewTrainer(trainer._id)}>
                        View
                      </ActionButton>
                      <ActionButton
                        variant={trainer.isBlocked ? "Unblock" : "Block"}
                        onClick={() => handleToggleStatus(trainer)}
                      >
                        {trainer.isBlocked ? "Unblock" : "Block"}
                      </ActionButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-700">
                <Pagination 
                  currentPage={currentPage} 
                  totalPages={totalPages} 
                  onPageChange={handlePageChange} 
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedTrainer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.2 }}
            className="bg-gray-800 rounded-lg p-6 w-full max-w-md text-white"
          >
            <h2 className="text-lg font-semibold mb-4">
              {pendingAction === "Block" ? "Block" : "Unblock"} Trainer
            </h2>
            <p className="mb-6">
              Are you sure you want to {pendingAction?.toLowerCase()}{" "}
              <strong>{selectedTrainer.name}</strong>?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmToggle}
                className={`px-4 py-2 rounded ${
                  pendingAction === "Block" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                }`}
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TrainerManagement;