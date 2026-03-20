import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUserById } from "../../axios/adminApi"; 
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { ChevronLeft, User } from "lucide-react";

interface UserDetails {
  name: string;
  email: string;
  phoneNumber: string;
  age: number;
  dob: string;
  sex: string;
  profileImageUrl?: string;
}

const UserDetailsPage = () => {
  const navigate = useNavigate();
  const { adminInfo } = useSelector((state: RootState) => state.adminAuth);

  const { id } = useParams<{ id: string }>() as { id: string };
  const [userData, setUserData] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminInfo) {
      navigate('/adminLogin');
    }
  }, [navigate, adminInfo]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const data = await getUserById(id); 
        setUserData(data);
      } catch (error) {
        toast.error("Failed to fetch user details");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [id]);

  if (loading) return <div className="p-10 text-center text-white italic">Loading user data...</div>;
  if (!userData) return <div className="p-10 text-center text-white">User record not found.</div>;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header with Navigation */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl md:text-2xl font-bold text-white">User Profile</h1>
      </div>

      <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-700">
        {/* Top Banner/Avatar Section */}
        <div className="bg-gray-900/50 p-6 md:p-8 flex flex-col items-center sm:flex-row sm:gap-6 border-b border-gray-700">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-700 rounded-full flex items-center justify-center text-gray-400 mb-4 sm:mb-0 overflow-hidden">
            {userData.profileImageUrl ? (
              <img 
                src={userData.profileImageUrl} 
                alt={`${userData.name}'s profile`} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <User size={40} />
            )}
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-white">{userData.name}</h2>
            <p className="text-gray-400 text-sm">{userData.email}</p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
            <div className="space-y-6">
              <InfoRow label="Full Name" value={userData.name} />
              <InfoRow label="Email Address" value={userData.email} />
              <InfoRow label="Phone Number" value={userData.phoneNumber || "Not Provided"} />
            </div>
            <div className="space-y-6">
              <InfoRow label="Age" value={userData.age ? userData.age.toString() : "N/A"} />
              <InfoRow label="Date of Birth" value={userData.dob || "N/A"} />
              <InfoRow label="Sex" value={userData.sex || "N/A"} />
            </div>
          </div>
        </div>
        
        {/* Footer Actions */}
        <div className="bg-gray-900/30 p-4 md:p-6 border-t border-gray-700 flex justify-end">
          <button 
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            Return to List
          </button>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col space-y-1">
    <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">{label}</span>
    <span className="text-white text-base md:text-lg break-all font-medium">{value}</span>
  </div>
);

export default UserDetailsPage;