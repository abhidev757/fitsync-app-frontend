import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../../components/admin/SearchBar";
import ActionButton from "../../components/admin/ActionButton";
import Pagination from "../../components/admin/Pagination";
import { getAllTrainer, updateTrainerStatus } from "../../axios/adminApi";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

// Trainer Interface
interface Trainer {
  _id: string; 
  name: string;
  specializations: string[];
  status: "Block" | "Unblock"; 
  createdAt: string;
}

const TrainerManagement = () => {
  const navigate = useNavigate();
  const { adminInfo } = useSelector((state: RootState) => state.adminAuth);

  useEffect(() => {
    if (!adminInfo) {
      navigate('/adminLogin');
    }
  }, [navigate, adminInfo]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const fetchTrainers = async () => {
      setLoading(true);
      try {
        const data = await getAllTrainer();
        
        
        const formattedTrainers = data.map((trainer: Trainer) => ({
          ...trainer,
          status: trainer.status ? "Unblock" : "Block",
        }));

        setTrainers(formattedTrainers);
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
  };

 
  const handleViewTrainer = (id: string) => {
    navigate(`/admin/trainerDetails/${id}`);
  };

  
  const handleToggleStatus = async (id: string, currentStatus: "Block" | "Unblock") => {
    const newStatus = currentStatus === "Block" ? "Unblock" : "Block";

    try {
      await updateTrainerStatus(id, newStatus === "Unblock");

      
      setTrainers((prevTrainers) =>
        prevTrainers.map((trainer) =>
          trainer._id === id ? { ...trainer, status: newStatus } : trainer
        )
      );

      toast.success(`Trainer status updated to ${newStatus}`);
    } catch (error) {
      console.error("Failed to update trainer status:", error);
      toast.error("Failed to update status");
    }
  };

  
  const filteredTrainers = trainers.filter((trainer) =>
    trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (Array.isArray(trainer.specializations) &&
      trainer.specializations.some((spec) => spec.toLowerCase().includes(searchTerm.toLowerCase())))
  );
  

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Trainer List</h1>

      <SearchBar onChange={handleSearch} />

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        {loading ? (
          <p className="text-white text-center py-6">Loading trainers...</p>
        ) : (
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
              {filteredTrainers.map((trainer) => (
                <tr key={trainer._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{trainer.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{Array.isArray(trainer.specializations) ? trainer.specializations.join(", ") : "N/A"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        trainer.status === "Block" ? "bg-red-500 text-white" : "bg-green-500 text-white"
                      }`}
                    >
                      {trainer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{trainer.createdAt}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <ActionButton variant="view" onClick={() => handleViewTrainer(trainer._id)}>
                      View
                    </ActionButton>
                    <ActionButton
                      variant={trainer.status === "Block" ? "Unblock" : "Block"}
                      onClick={() => handleToggleStatus(trainer._id, trainer.status)}
                    >
                      {trainer.status === "Block" ? "Unblock" : "Block"}
                    </ActionButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination currentPage={currentPage} totalPages={3} onPageChange={handlePageChange} />
    </div>
  );
};

export default TrainerManagement;
