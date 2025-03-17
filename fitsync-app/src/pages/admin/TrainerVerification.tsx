import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface VerificationRequest {
  id: number;
  name: string;
  specialization: string;
  status: string;
  date: string;
}

const TrainerVerification = () => {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1);
  
  const verificationRequests: VerificationRequest[] = [
    {
      id: 1,
      name: "John Doe",
      specialization: "Yoga & Mindfulness",
      status: "Pending",
      date: "2023-10-01"
    },
    {
      id: 2,
      name: "Jane Smith",
      specialization: "Strength Training",
      status: "Pending",
      date: "2023-10-02"
    },
    {
      id: 3,
      name: "Emily Johnson",
      specialization: "Nutrition Coaching",
      status: "Pending",
      date: "2023-10-03"
    },
    {
      id: 4,
      name: "Jane Smith",
      specialization: "Strength Training",
      status: "Pending",
      date: "2023-10-02"
    },
    {
      id: 5,
      name: "Emily Johnson",
      specialization: "Nutrition Coaching",
      status: "Pending",
      date: "2023-10-03"
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Verification</h1>
      
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Specialization
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
          <tbody className="divide-y divide-gray-700">
            {verificationRequests.map((request) => (
              <tr key={request.id} className="bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {request.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {request.specialization}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-yellow-500">{request.status}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {request.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button 
                    onClick={() => navigate(`/admin/trainerVerificationDetails`) }
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          className="flex items-center px-4 py-2 text-sm bg-gray-700 text-white rounded-md hover:bg-gray-600"
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </button>
        
        <span className="text-white">
          Page {currentPage} of 3
        </span>
        
        <button
          onClick={() => setCurrentPage(p => Math.min(3, p + 1))}
          className="flex items-center px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
          disabled={currentPage === 3}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
};

export default TrainerVerification;