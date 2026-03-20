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
import { Wallet, UserIcon, CheckCircle, XCircle } from "lucide-react";

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
      fetchRequests(); 
    } catch (error) {
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
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Payout Management</h1>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-8 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('trainer')}
            className={`pb-4 px-4 text-sm font-bold uppercase tracking-widest transition-all ${
                activeTab === 'trainer' 
                    ? "text-[#d9ff00] border-b-2 border-[#d9ff00]" 
                    : "text-gray-500 hover:text-gray-300"
            }`}
          >
              Trainers
          </button>
          <button
            onClick={() => setActiveTab('user')}
            className={`pb-4 px-4 text-sm font-bold uppercase tracking-widest transition-all ${
                activeTab === 'user' 
                    ? "text-[#d9ff00] border-b-2 border-[#d9ff00]" 
                    : "text-gray-500 hover:text-gray-300"
            }`}
          >
              Users
          </button>
      </div>

      <div className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700 shadow-xl">
        {loading ? (
          <div className="text-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d9ff00] mx-auto mb-4"></div>
            <p className="text-gray-400 text-sm font-medium">Retrieving financial records...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-24">
            <Wallet className="mx-auto h-12 w-12 text-gray-600 mb-4" />
            <p className="text-gray-400">No payout requests found.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Recipient</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {paginatedRequests.map((request) => (
                    <tr key={request._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-white">
                            {activeTab === 'trainer' ? request.trainerId?.name : request.userId?.name || "Unknown"}
                        </div>
                        <div className="text-gray-500 text-xs lowercase">
                            {activeTab === 'trainer' ? request.trainerId?.email : request.userId?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#d9ff00] font-mono font-bold">
                        ₹{request.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(request.createdAt).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full ${
                          request.status === 'approved' ? "bg-green-500/10 text-green-500" :
                          request.status === 'rejected' ? "bg-red-500/10 text-red-500" :
                          "bg-yellow-500/10 text-yellow-500"
                        }`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                        {request.status === 'pending' && (
                          <>
                            <button onClick={() => openModal(request, 'approve')} className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors" title="Approve"><CheckCircle size={20}/></button>
                            <button onClick={() => openModal(request, 'reject')} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Reject"><XCircle size={20}/></button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-700">
              {paginatedRequests.map((request) => (
                <div key={request._id} className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-700 rounded-lg"><UserIcon size={18} className="text-gray-300"/></div>
                      <div>
                        <p className="text-white font-bold text-sm">{activeTab === 'trainer' ? request.trainerId?.name : request.userId?.name || "Unknown"}</p>
                        <p className="text-gray-500 text-[10px]">{activeTab === 'trainer' ? request.trainerId?.email : request.userId?.email}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded ${
                      request.status === 'approved' ? "bg-green-500/10 text-green-500" :
                      request.status === 'rejected' ? "bg-red-500/10 text-red-500" :
                      "bg-yellow-500/10 text-yellow-500"
                    }`}>
                      {request.status}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-gray-700/50">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-gray-500 uppercase font-black">Amount</span>
                      <span className="text-[#d9ff00] font-mono font-bold text-lg">₹{request.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] text-gray-500 uppercase font-black">Request Date</span>
                      <span className="text-gray-300 text-xs font-medium">{new Date(request.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => openModal(request, 'approve')} className="flex-1 py-3 bg-green-600 text-white rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-transform">Approve</button>
                      <button onClick={() => openModal(request, 'reject')} className="flex-1 py-3 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-transform">Reject</button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="px-6 py-6 border-t border-gray-700 bg-gray-900/30">
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
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl"
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${modalType === 'approve' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                 {modalType === 'approve' ? <CheckCircle size={32}/> : <XCircle size={32}/>}
              </div>
              <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-tight italic">
                {modalType === 'approve' ? "Confirm Approval" : "Confirm Rejection"}
              </h2>
              <p className="mb-8 text-gray-400 text-sm leading-relaxed">
                Confirm payout of <span className="text-[#d9ff00] font-bold font-mono">₹{selectedRequest.amount}</span> to <span className="text-white font-bold">{activeTab === 'trainer' ? selectedRequest.trainerId?.name : selectedRequest.userId?.name}</span>?
              </p>
              <div className="flex gap-3">
                <button onClick={closeModal} className="flex-1 py-3 bg-gray-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-600 transition-colors">Abort</button>
                <button
                  onClick={handleAction}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 ${
                    modalType === 'approve' ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  Execute
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