import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTrainerById } from '../../axios/adminApi';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { toast } from 'react-toastify';

interface TrainerVerification {
  name: string;
  email: string;
  phone: string;
  address: string;
  specializations: string;
  yearsOfExperience: string;
  sex: string;
  profileImage: string;
  certificateUrl: string;
}

const TrainerVerificationDetails = () => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const navigate = useNavigate();
  const { adminInfo } = useSelector((state: RootState) => state.adminAuth);

  useEffect(() => {
    if (!adminInfo) {
      navigate('/adminLogin');
    }
  }, [navigate, adminInfo]);
  const { id } = useParams<{ id: string }>() as { id: string };
  const [trainerData, setTrainerData] = useState<TrainerVerification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
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

    fetchUserDetails();
  }, [id]);

  if (loading) return <p className="text-white text-center">Loading Trainer details...</p>;
  if (!trainerData) return <p className="text-white text-center">Trainer not found</p>;

  const handleApprove = () => {
    // Handle approval logic
    console.log('Approved');
  };

  const handleReject = () => {
    setShowRejectModal(true);
  };

  const handleSubmitRejection = () => {
    // Handle rejection logic with reason
    console.log('Rejected with reason:', rejectReason);
    setShowRejectModal(false);
  };

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
              <InfoRow label="Phone Number" value={trainerData.phone} />
              <InfoRow label="Specialization" value={trainerData.specializations} />
              <InfoRow label="Years of Experience" value={trainerData.yearsOfExperience} />
              <InfoRow label="Sex" value={trainerData.sex} />
            </div>
          </div>

          {/* Right Column - Certificate */}
            <div>
              <h2 className="text-white text-xl font-semibold mb-4">Certificate</h2>
              <div className="bg-white rounded-lg p-4">
                {trainerData.certificateUrl ? (
                  <iframe
                    src={trainerData.certificateUrl}
                    title="Trainer Certificate"
                    className="w-full h-96 rounded-lg"
                  />
                ) : (
                  <p className="text-gray-500 text-center">No certificate available</p>
                )}
              </div>
            </div>

        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={handleApprove}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Approve
          </button>
          <button
            onClick={handleReject}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Reject
          </button>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full">
            <h2 className="text-xl font-semibold text-white mb-4">
              Reason for Rejection
            </h2>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Write here"
              className="w-full h-32 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none focus:outline-none focus:border-blue-500"
            />
            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRejection}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col space-y-1">
    <span className="text-gray-400 text-sm">{label} :</span>
    <span className="text-white">{value}</span>
  </div>
);

export default TrainerVerificationDetails;