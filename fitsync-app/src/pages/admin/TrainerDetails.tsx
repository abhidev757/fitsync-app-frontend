import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTrainerById } from "../../axios/adminApi";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

// Define TrainerDetails Interface
interface TrainerDetails {
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  specializations: string;
  yearsOfExperience: number;
  age: number;
  dob: string;
  sex: string;
  profileImage: string;
  certificateImage: string;
}

const TrainerDetails = () => {
  const navigate = useNavigate();
  const { adminInfo } = useSelector((state: RootState) => state.adminAuth);

  useEffect(() => {
    if (!adminInfo) {
      navigate('/adminLogin');
    }
  }, [navigate, adminInfo]);
  const { id } = useParams<{ id: string }>() as { id: string };
  const [trainerData, setTrainerData] = useState<TrainerDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainerDetails = async () => {
      try {
        setLoading(true);
        const data = await getTrainerById(id);
        setTrainerData(data);
      } catch (error) {
        toast.error("Failed to fetch trainer details");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainerDetails();
  }, [id]);

  if (loading) return <p className="text-white text-center">Loading trainer details...</p>;
  if (!trainerData) return <p className="text-white text-center">Trainer not found</p>;

  return (
    <div className="p-6">
      <div className="bg-gray-800 rounded-lg p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Profile Info */}
          <div className="space-y-6">
            {/* Profile Image */}
            <div className="mb-6">
              <img
                src={trainerData.profileImage || "/placeholder.svg"}
                alt={trainerData.name}
                className="w-48 h-48 rounded-lg object-cover"
              />
            </div>

            {/* Trainer Information */}
            <div className="space-y-4">
              <InfoRow label="Full Name" value={trainerData.name} />
              <InfoRow label="Email" value={trainerData.email} />
              <InfoRow label="Phone Number" value={trainerData.phoneNumber} />
              <InfoRow label="Address" value={trainerData.address} />
              <InfoRow label="Specialization" value={trainerData.specializations} />
              <InfoRow label="Years of Experience" value={`${trainerData.yearsOfExperience} years`} />
              <InfoRow label="Age" value={trainerData.age ? trainerData.age.toString() : "N/A"} />
              <InfoRow label="DOB" value={trainerData.dob || "N/A"} />
              <InfoRow label="Sex" value={trainerData.sex || "N/A"} />
            </div>
          </div>

          {/* Right Column - Certificate */}
          <div>
            <h2 className="text-white text-xl font-semibold mb-4">Certificate</h2>
            <div className="bg-white rounded-lg p-4">
              <img
                src={trainerData.certificateImage || "/placeholder.svg"}
                alt="Trainer Certificate"
                className="w-full rounded-lg"
              />
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

export default TrainerDetails;
