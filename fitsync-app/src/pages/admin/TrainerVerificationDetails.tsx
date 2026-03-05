import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTrainerById,approveTrainer, rejectTrainer } from '../../axios/adminApi';
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
  profileImageUrl: string;
  certificateUrl: string;
  reason:string;
}

const TrainerVerificationDetails = () => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
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
    setShowApproveModal(true);
  };

  const handleConfirmApprove = async () => {
    try {
      const response = await approveTrainer(id)
      console.log("Response ",response);
      

      if (response.status === 200) {
        toast.success("Trainer approved successfully");
        navigate('/admin/trainerVerification'); 
      } else {
        toast.error("Failed to approve trainer");
      }
    } catch (error) {
      toast.error("An error occurred while approving the trainer");
      console.error(error);
    } finally {
      setShowApproveModal(false);
    }
  };

  const handleReject = () => {
    setShowRejectModal(true);
  };

  const handleSubmitRejection = async() => {
    console.log('Rejected with reason:', rejectReason);
    try {
      const response = await rejectTrainer(id,{reason:rejectReason})
      console.log("Response ",response);
      

      if (response.status === 200) {
        toast.success("Trainer rejected successfully");
        navigate('/admin/trainerVerification'); 
      } else {
        toast.error("Failed to reject trainer");
      }
    } catch (error) {
      toast.error("An error occurred while rejecting the trainer");
      console.error(error);
    } finally {
      setShowRejectModal(false);
    }
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
                src={trainerData.profileImageUrl || "/placeholder.svg"}
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
                <div className="flex flex-col items-center gap-4">
                  {/* Show image preview if it's an image, otherwise show a PDF link */}
                  {/\.(jpg|jpeg|png|webp)$/i.test(trainerData.certificateUrl) ? (
                    <img
                      src={trainerData.certificateUrl}
                      alt="Trainer Certificate"
                      className="w-full rounded-lg object-contain max-h-96"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-10">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-600 font-medium">PDF Certificate</p>
                    </div>
                  )}
                  <a
                    href={trainerData.certificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg transition-colors font-medium"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View Certificate
                  </a>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-10">No certificate available</p>
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

      {/* Approval Confirmation Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full">
            <h2 className="text-xl font-semibold text-white mb-4">
              Confirm Approval
            </h2>
            <p className="text-white mb-6">Are you sure you want to approve this trainer?</p>
            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApprove}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Yes, Approve
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