import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUserById } from "../../axios/adminApi"; 
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "../../store";


interface UserDetails {
  name: string;
  email: string;
  phoneNumber: string;
  age: number;
  dob: string;
  sex: string;
}

const UserDetails = () => {
  const navigate = useNavigate();
  const { adminInfo } = useSelector((state: RootState) => state.adminAuth);

  useEffect(() => {
    if (!adminInfo) {
      navigate('/adminLogin');
    }
  }, [navigate, adminInfo]);
  const { id } = useParams<{ id: string }>() as { id: string };
  const [userData, setUserData] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const data = await getUserById(id); 
        setUserData(data);
      } catch (error) {
        toast.error("Failed to fetch user details");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [id]);

  if (loading) return <p className="text-white text-center">Loading user details...</p>;
  if (!userData) return <p className="text-white text-center">User not found</p>;

  return (
    <div className="p-6">
      <div className="bg-gray-800 rounded-lg p-8">
        <div className="max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <InfoRow label="Full Name" value={userData.name} />
              <InfoRow label="Email" value={userData.email} />
              <InfoRow label="Phone Number" value={userData.phoneNumber} />
            </div>
            <div className="space-y-4">
              <InfoRow label="Age" value={userData.age ? userData.age.toString() : "N/A"} />
              <InfoRow label="DOB" value={userData.dob || "N/A"} />
              <InfoRow label="Sex" value={userData.sex || "N/A"} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col space-y-1">
    <span className="text-gray-400 text-sm">{label} :</span>
    <span className="text-white">{value}</span>
  </div>
);

export default UserDetails;
