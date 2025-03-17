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


interface User {
  _id: string;
  name: string;
  specialization: string;
  email: string;
  status: "Block" | "Unblock";
  createdAt: Date;
}

const UserManagement = () => {
  const navigate = useNavigate();
  const { adminInfo } = useSelector((state: RootState) => state.adminAuth);

  useEffect(() => {
    if (!adminInfo) {
      navigate('/adminLogin');
    }
  }, [navigate, adminInfo]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const data = await getAllUsers();
        const formattedUsers = data.map((user: User) => ({
          ...user,
          status: user.status ? "Unblock" : "Block", 
        }));
        setUsers(formattedUsers);
      } catch (error) {
        console.log("Failed to fetch users",error);
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

  
  const handleToggleStatus = async (id: string, currentStatus: "Block" | "Unblock") => {
    const newStatus = currentStatus === "Block" ? "Unblock" : "Block";
    try {
      await updateUserStatus(id, newStatus === "Block");
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === id ? { ...user, status: newStatus } : user
        )
      );
      toast.success(`User status updated to ${newStatus}`);
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === "Block"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {user.status}
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
                      variant={user.status === "Block" ? "Unblock" : "Block"}
                      onClick={() => handleToggleStatus(user._id, user.status)}
                    >
                      {user.status === "Block" ? "Unblock" : "Block"}
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

export default UserManagement;
