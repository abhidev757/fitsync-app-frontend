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
import { motion } from "framer-motion";

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
        const formattedUsers = data.map((user: User) => ({
          ...user,
          status: user.isBlocked ? "Unblock" : "Block",
        }));
        setUsers(formattedUsers);
      } catch (error) {
        console.log("Failed to fetch users", error);
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
  };

  const handleViewUser = (id: string) => {
    navigate(`/admin/userDetails/${id}`);
  };

  const handleToggleStatus = (user: User) => {
    setSelectedUser(user);
    setPendingAction(user.isBlocked  ? "Unblock" : "Block");
    setShowConfirmModal(true);
  };

  const confirmToggle = async () => {
    if (!selectedUser || !pendingAction) return;
  
    try {
      const newStatus = pendingAction === "Block";
  
      await updateUserStatus(selectedUser._id, newStatus);
  
      setUsers((prev) =>
        prev.map((u) =>
          u._id === selectedUser._id ? { ...u, isBlocked: newStatus } : u
        )
      );
  
      toast.success(`User ${pendingAction === "Block" ? "blocked" : "unblocked"} successfully`);
    } catch (error) {
      console.error("Failed to update status:", error);
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
      user.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Users List</h1>

      <SearchBar onChange={handleSearch} />

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        {loading ? (
          <p className="text-white text-center py-6">Loading users...</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
  {filteredUsers.map((user) => (
    <tr key={user._id}>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{user.name}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{user.email}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            user.isBlocked
              ? "bg-yellow-100 text-yellow-800"  
              : "bg-green-100 text-green-800"     
          }`}
        >
          {user.isBlocked ? "Blocked" : "Active"}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
        {format(new Date(user.createdAt), "dd MMM yyyy")}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
        <ActionButton variant="view" onClick={() => handleViewUser(user._id)}>
          View
        </ActionButton>
        <ActionButton
          variant={user.isBlocked ? "Unblock" : "Block"}
          onClick={() => handleToggleStatus(user)}
        >
          {user.isBlocked ? "Unblock" : "Block"}
        </ActionButton>
      </td>
    </tr>
  ))}
</tbody>

          </table>
        )}
      </div>

      <Pagination currentPage={currentPage} totalPages={3} onPageChange={handlePageChange} />

      {/* Confirmation Modal */}
      {showConfirmModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.2 }}
            className="bg-gray-800 rounded-lg p-6 w-full max-w-md text-white"
          >
            <h2 className="text-lg font-semibold mb-4">
              {pendingAction === "Block" ? "Block" : "Unblock"} User
            </h2>
            <p className="mb-6">
              Are you sure you want to {pendingAction?.toLowerCase()}{" "}
              <strong>{selectedUser.name}</strong>?
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
                  pendingAction === "Block"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
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

export default UserManagement;
