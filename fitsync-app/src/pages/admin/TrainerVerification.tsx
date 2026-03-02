import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchApplicants } from '../../axios/adminApi';
import { format } from "date-fns";

interface VerificationRequest {
  _id: string;
  name: string;
  specializations: string;
  status: string;
  createdAt: string;
}

const TrainerVerification = () => {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1);
  const [applicants, setApplicants] = useState<VerificationRequest[]>([]);

  const ITEMS_PER_PAGE = 5;
  
  useEffect(() => {
          const fetchAllApplicants = async () => {
              try {
                  const data = await fetchApplicants();
                  setApplicants(data);
              } catch (error) {
                  console.error('Failed to fetch Applicants:', error);
              }
          };
    
          fetchAllApplicants();
      }, []);

      const handleViewTrainer = (id: string) => {
        navigate(`/admin/trainerVerificationDetails/${id}`);
      };

  const totalPages = Math.max(1, Math.ceil(applicants.length / ITEMS_PER_PAGE));
  const currentApplicants = applicants.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Status
              </th> */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {currentApplicants.map((request) => (
              <tr key={request._id} className="bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {request.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {request.specializations}
                </td>
                {/* <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-yellow-500">{request.status}</span>
                </td> */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                {format(new Date(request.createdAt), "dd/MM/yyyy")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button 
                    onClick={()=>handleViewTrainer(request._id) }
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
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="flex items-center px-4 py-2 text-sm bg-gray-700 text-white rounded-md hover:bg-gray-600"
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </button>

          <div className="flex space-x-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  currentPage === i + 1
                    ? 'bg-blue-500 text-white font-bold'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="flex items-center px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
};

export default TrainerVerification;