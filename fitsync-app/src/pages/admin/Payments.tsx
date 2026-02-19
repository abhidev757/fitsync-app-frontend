import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Pagination from "../../components/admin/Pagination";
import { 
  getPayoutRequests, 
  approvePayoutRequest, 
  rejectPayoutRequest,
  getAllUserPayoutRequests, 
  approveUserPayoutRequest, 
  rejectUserPayoutRequest 
} from "../../axios/adminApi";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { motion, AnimatePresence } from "framer-motion";

interface PayoutRequest {
  _id: string;
  trainerId?: {
    _id: string;
    name: string;
    email: string;
  };
  userId?: {
      _id: string;
      name: string;
      email: string;
  };
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

const ITEMS_PER_PAGE = 10;

const Payments = () => {
  const navigate = useNavigate();
  const { adminInfo } = useSelector((state: RootState) => state.adminAuth);

  useEffect(() => {
    if (!adminInfo) {
      navigate("/adminLogin");
    }
  }, [navigate, adminInfo]);

  const [activeTab, setActiveTab] = useState<'trainer' | 'user'>('trainer');
  const [requests, setRequests] = useState<PayoutRequest[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<PayoutRequest | null>(null);
  const [modalType, setModalType] = useState<'approve' | 'reject' | null>(null);

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let data;
      if (activeTab === 'trainer') {
          data = await getPayoutRequests();
      } else {
          data = await getAllUserPayoutRequests();
      }
      setRequests(data);
      setTotalPages(Math.ceil(data.length / ITEMS_PER_PAGE));
      setCurrentPage(1); 
    } catch (error) {
      console.error("Error fetching payout requests:", error);
      toast.error("Failed to fetch payout requests");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openModal = (request: PayoutRequest, type: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setModalType(type);
  };

  const closeModal = () => {
    setSelectedRequest(null);
    setModalType(null);
  };

  const handleAction = async () => {
    if (!selectedRequest || !modalType) return;
    try {
      if (activeTab === 'trainer') {
        if (modalType === 'approve') {
            await approvePayoutRequest(selectedRequest._id);
            toast.success("Trainer payout approved");
        } else {
            await rejectPayoutRequest(selectedRequest._id);
            toast.success("Trainer payout rejected");
        }
      } else {
        if (modalType === 'approve') {
            await approveUserPayoutRequest(selectedRequest._id);
            toast.success("User payout approved");
        } else {
            await rejectUserPayoutRequest(selectedRequest._id);
            toast.success("User payout rejected");
        }
      }
      fetchRequests(); // Refresh list
    } catch (error) {
        console.error(`Failed to ${modalType} request:`, error);
        toast.error(`Failed to ${modalType} request`);
    } finally {
      closeModal();
    }
  };

  const paginatedRequests = requests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-white mb-6">Payout Requests</h1>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-700">
          <button
              onClick={() => setActiveTab('trainer')}
              className={`pb-2 px-4 font-medium transition-colors ${
                  activeTab === 'trainer' 
                      ? "text-[#d9ff00] border-b-2 border-[#d9ff00]" 
                      : "text-gray-400 hover:text-white"
              }`}
          >
              Trainer Payouts
          </button>
          <button
              onClick={() => setActiveTab('user')}
              className={`pb-2 px-4 font-medium transition-colors ${
                  activeTab === 'user' 
                      ? "text-[#d9ff00] border-b-2 border-[#d9ff00]" 
                      : "text-gray-400 hover:text-white"
              }`}
          >
              User Payouts
          </button>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden mt-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white">Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white">No payout requests found.</p>
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      {activeTab === 'trainer' ? "Trainer" : "User"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {paginatedRequests.map((request) => (
                  <tr key={request._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        <div className="font-bold">
                            {activeTab === 'trainer' ? request.trainerId?.name : request.userId?.name || "Unknown"}
                        </div>
                        <div className="text-gray-400 text-xs">
                            {activeTab === 'trainer' ? request.trainerId?.email : request.userId?.email}
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-mono">
                      ₹{request.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        request.status === 'approved' ? "bg-green-500 text-white" :
                        request.status === 'rejected' ? "bg-red-500 text-white" :
                        "bg-yellow-500 text-black"
                      }`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {request.status === 'pending' && (
                            <>
                                <button
                                    onClick={() => openModal(request, 'approve')}
                                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => openModal(request, 'reject')}
                                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
                                >
                                    Reject
                                </button>
                            </>
                        )}
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
        <AnimatePresence>
            {selectedRequest && modalType && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="bg-gray-800 rounded-lg p-6 w-full max-w-md text-white border border-gray-700 shadow-xl"
                >
                    <h2 className="text-xl font-semibold mb-4 text-center">
                    {modalType === 'approve' ? "Approve Payout" : "Reject Payout"}
                    </h2>
                    <p className="mb-6 text-center text-gray-300">
                    Are you sure you want to {modalType} the payout request of <span className="font-bold text-white">₹{selectedRequest.amount}</span> for <strong>{activeTab === 'trainer' ? selectedRequest.trainerId?.name : selectedRequest.userId?.name}</strong>?
                    </p>
                    <div className="flex justify-center space-x-4">
                    <button
                        onClick={closeModal}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded text-sm transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAction}
                        className={`px-4 py-2 rounded text-sm font-bold transition-colors ${
                        modalType === 'approve' 
                            ? "bg-green-600 hover:bg-green-700" 
                            : "bg-red-600 hover:bg-red-700"
                        }`}
                    >
                        Confirm {modalType === 'approve' ? "Approval" : "Rejection"}
                    </button>
                    </div>
                </motion.div>
                </div>
            )}
        </AnimatePresence>
    </div>
  );
};

export default Payments;
