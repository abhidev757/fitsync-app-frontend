import { useState } from 'react';
import { useParams } from 'react-router-dom';

interface TrainerVerification {
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  specialization: string;
  yearsOfExperience: string;
  age: number;
  dob: string;
  sex: string;
  profileImage: string;
  certificateImage: string;
}

const TrainerVerificationDetails = () => {
  const { id } = useParams();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // This would typically come from an API call
  const trainerData: TrainerVerification = {
    fullName: "John Doe",
    email: "john.doe@example.com",
    phoneNumber: "(123) 456-7890",
    address: "123 Main Street, Anytown, USA",
    specialization: "Yoga",
    yearsOfExperience: "3 years",
    age: 32,
    dob: "09/05/1992",
    sex: "Male",
    profileImage: "/placeholder.svg?height=200&width=200",
    certificateImage: "/placeholder.svg?height=400&width=600"
  };

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
                alt={trainerData.fullName}
                className="w-48 h-48 rounded-lg object-cover"
              />
            </div>

            {/* Trainer Information */}
            <div className="space-y-4">
              <InfoRow label="Full Name" value={trainerData.fullName} />
              <InfoRow label="Email" value={trainerData.email} />
              <InfoRow label="Phone Number" value={trainerData.phoneNumber} />
              <InfoRow label="Address" value={trainerData.address} />
              <InfoRow label="Specialization" value={trainerData.specialization} />
              <InfoRow label="Years of Experience" value={trainerData.yearsOfExperience} />
              <InfoRow label="Age" value={trainerData.age.toString()} />
              <InfoRow label="DOB" value={trainerData.dob} />
              <InfoRow label="Sex" value={trainerData.sex} />
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