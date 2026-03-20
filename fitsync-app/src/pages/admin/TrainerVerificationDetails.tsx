import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTrainerById, approveTrainer, rejectTrainer } from '../../axios/adminApi';
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
  reason: string;
}

const TrainerVerificationDetails = () => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const navigate = useNavigate();
  const { adminInfo } = useSelector((state: RootState) => state.adminAuth);

  const { id } = useParams<{ id: string }>() as { id: string };
  const [trainerData, setTrainerData] = useState<TrainerVerification | null>(null);
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
        const data = await getTrainerById(id);
        setTrainerData(data);
      } catch (error) {
        toast.error("Failed to fetch trainer details");
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, [id]);

  if (loading) return <div className="p-10 text-center text-white">Loading...</div>;
  if (!trainerData) return <div className="p-10 text-center text-white">Trainer not found</div>;

  const handleConfirmApprove = async () => {
    try {
      const response = await approveTrainer(id);
      if (response.status === 200) {
        toast.success("Trainer approved");
        navigate('/admin/trainerVerification');
      }
    } catch (error) {
      toast.error("Error during approval");
    } finally {
      setShowApproveModal(false);
    }
  };

  const handleSubmitRejection = async () => {
    try {
      const response = await rejectTrainer(id, { reason: rejectReason });
      if (response.status === 200) {
        toast.success("Trainer rejected");
        navigate('/admin/trainerVerification');
      }
    } catch (error) {
      toast.error("Error during rejection");
    } finally {
      setShowRejectModal(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          
          {/* Details Section */}
          <div className="w-full lg:w-1/2 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-gray-700">
            <div className="flex flex-col items-center sm:items-start">
              <img
                src={trainerData.profileImageUrl || "/placeholder.svg"}
                alt={trainerData.name}
                className="w-48 h-48 rounded-lg object-cover mb-6 border border-gray-600"
              />
              <div className="w-full space-y-4">
                <InfoRow label="Full Name" value={trainerData.name} />
                <InfoRow label="Email" value={trainerData.email} />
                <InfoRow label="Phone" value={trainerData.phone} />
                <InfoRow label="Specialization" value={trainerData.specializations} />
                <InfoRow label="Experience" value={trainerData.yearsOfExperience} />
                <InfoRow label="Sex" value={trainerData.sex} />
              </div>
            </div>
          </div>

          {/* Certificate Section */}
          <div className="w-full lg:w-1/2 p-6 md:p-8">
            <h2 className="text-white text-xl font-bold mb-4">Certificate</h2>
            <div className="bg-white rounded-lg p-4 flex flex-col items-center">
              {trainerData.certificateUrl ? (
                <>
                  {/\.(jpg|jpeg|png|webp)$/i.test(trainerData.certificateUrl) ? (
                    <img
                      src={trainerData.certificateUrl}
                      alt="Certificate"
                      className="w-full h-auto max-h-96 object-contain rounded"
                    />
                  ) : (
                    <div className="py-10 text-gray-500 font-medium italic">Document Preview (PDF)</div>
                  )}
                  <a
                    href={trainerData.certificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 text-sm font-semibold"
                  >
                    View Full File
                  </a>
                </>
              ) : (
                <p className="text-gray-400 py-10">No certificate uploaded</p>
              )}
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end">
              <button
                onClick={() => setShowApproveModal(true)}
                className="w-full sm:w-auto px-8 py-3 bg-green-500 text-white rounded font-bold hover:bg-green-600 transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                className="w-full sm:w-auto px-8 py-3 bg-red-500 text-white rounded font-bold hover:bg-red-600 transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-4">Rejection Reason</h2>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full h-32 p-3 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none"
              placeholder="Enter reason..."
            />
            <div className="mt-4 flex gap-3">
              <button onClick={() => setShowRejectModal(false)} className="flex-1 py-2 bg-gray-600 text-white rounded">Cancel</button>
              <button onClick={handleSubmitRejection} className="flex-1 py-2 bg-blue-500 text-white rounded">Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full text-center">
            <h2 className="text-xl font-bold text-white mb-4">Confirm Approval</h2>
            <p className="text-gray-300 mb-6">Are you sure you want to approve this trainer?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowApproveModal(false)} className="flex-1 py-2 bg-gray-600 text-white rounded">No</button>
              <button onClick={handleConfirmApprove} className="flex-1 py-2 bg-green-500 text-white rounded">Yes, Approve</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col border-b border-gray-700 pb-2">
    <span className="text-gray-400 text-xs font-semibold">{label}</span>
    <span className="text-white text-sm break-all">{value}</span>
  </div>
);

export default TrainerVerificationDetails;