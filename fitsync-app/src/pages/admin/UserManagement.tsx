import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../../components/admin/SearchBar";
import ActionButton from "../../components/admin/ActionButton";
import Pagination from "../../components/admin/Pagination";
import { getAllUsers, updateUserStatus } from "../../axios/adminApi";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { motion, AnimatePresence } from "framer-motion";
import { User as UserIcon, Calendar, ShieldAlert } from "lucide-react";

interface User {
  _id: string;
  name: string;
  specialization: string;
  email: string;
  isBlocked: boolean
  createdAt: Date;
}

const UserManagement = () => {
  const navigate = useNavigate();
  const { adminInfo } = useSelector((state: RootState) => state.adminAuth);

  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pendingAction, setPendingAction] = useState<"Block" | "Unblock" | null>(null);

  useEffect(() => {
    if (!adminInfo) {
      navigate("/adminLogin");
    }
  }, [navigate, adminInfo]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch (error) {
        toast.error("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleStatus = (user: User) => {
    setSelectedUser(user);
    setPendingAction(user.isBlocked ? "Unblock" : "Block");
    setShowConfirmModal(true);
  };

  const confirmToggle = async () => {
    if (!selectedUser || !pendingAction) return;
    try {
      const newStatus = pendingAction === "Block";
      await updateUserStatus(selectedUser._id, newStatus);
      setUsers((prev) =>
        prev.map((u) => u._id === selectedUser._id ? { ...u, isBlocked: newStatus } : u)
      );
      toast.success(`User ${pendingAction.toLowerCase()}ed successfully`);
    } catch (error) {
      toast.error("Failed to update user status");
    } finally {
      setShowConfirmModal(false);
      setSelectedUser(null);
      setPendingAction(null);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ITEMS_PER_PAGE = 5;
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-white">Users List</h1>
        <div className="w-full md:w-72">
          <SearchBar onChange={handleSearch} />
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl border border-gray-700">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
             <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mb-4"></div>
             <p className="text-gray-400 text-sm">Synchronizing user data...</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {paginatedUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 inline-flex text-[10px] font-bold rounded-full uppercase ${
                            user.isBlocked ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"
                          }`}>
                          {user.isBlocked ? "Blocked" : "Active"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {format(new Date(user.createdAt), "dd MMM yyyy")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <ActionButton variant="view" onClick={() => navigate(`/admin/userDetails/${user._id}`)}>View</ActionButton>
                        <ActionButton variant={user.isBlocked ? "Unblock" : "Block"} onClick={() => handleToggleStatus(user)}>
                          {user.isBlocked ? "Unblock" : "Block"}
                        </ActionButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-700">
              {paginatedUsers.map((user) => (
                <div key={user._id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white">
                        <UserIcon size={18} />
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">{user.name}</p>
                        <p className="text-gray-400 text-xs">{user.email}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-md ${
                        user.isBlocked ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"
                      }`}>
                      {user.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-400 pt-1">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {format(new Date(user.createdAt), "dd/MM/yyyy")}</span>
                    <div className="flex gap-2">
                       <button onClick={() => navigate(`/admin/userDetails/${user._id}`)} className="text-blue-400 font-bold px-2 py-1">View</button>
                       <button onClick={() => handleToggleStatus(user)} className={`${user.isBlocked ? 'text-green-400' : 'text-red-400'} font-bold px-2 py-1`}>
                         {user.isBlocked ? "Unblock" : "Block"}
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mt-6">
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && selectedUser && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className={pendingAction === "Block" ? "text-red-500" : "text-green-500"} size={32} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                {pendingAction} User
              </h2>
              <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                Confirm action for <span className="text-white font-bold">{selectedUser.name}</span>?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-3 bg-gray-700 text-white rounded-xl font-bold transition-all hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmToggle}
                  className={`flex-1 py-3 rounded-xl font-bold text-white transition-all ${
                    pendingAction === "Block"
                      ? "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-900/20"
                      : "bg-green-600 hover:bg-green-700 shadow-lg shadow-green-900/20"
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

export default UserManagement;