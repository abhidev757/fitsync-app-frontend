import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, Calendar, Award } from 'lucide-react';
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
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [applicants, setApplicants] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const ITEMS_PER_PAGE = 5;
  
  useEffect(() => {
    const fetchAllApplicants = async () => {
      try {
        const data = await fetchApplicants();
        const sorted = [...data].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setApplicants(sorted);
      } catch (error) {
        console.error('Failed to fetch Applicants:', error);
      } finally {
        setLoading(false);
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
    <div className="p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-black text-white italic uppercase tracking-tighter">Verification Registry</h1>
        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Pending Clearance Protocols</p>
      </div>
      
      {/* Desktop Table - Hidden on Mobile */}
      <div className="hidden md:block bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
        <table className="min-w-full">
          <thead className="bg-gray-800/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Name</th>
              <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Specialization</th>
              <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Submission Date</th>
              <th className="px-6 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {currentApplicants.map((request) => (
              <tr key={request._id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">{request.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{request.specializations}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {format(new Date(request.createdAt), "dd MMM yyyy")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button 
                    onClick={() => handleViewTrainer(request._id)}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all active:scale-95"
                  >
                    <Eye size={14} /> View File
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List - Hidden on Desktop */}
      <div className="md:hidden space-y-4">
        {currentApplicants.map((request) => (
          <div key={request._id} className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5 shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-white font-black uppercase italic tracking-tighter text-lg">{request.name}</h3>
              <span className="bg-yellow-500/10 text-yellow-500 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md border border-yellow-500/20">Pending</span>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-gray-400">
                <Award size={14} className="text-blue-500" />
                <span className="text-xs font-medium">{request.specializations}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Calendar size={14} className="text-blue-500" />
                <span className="text-xs font-medium">{format(new Date(request.createdAt), "dd/MM/yyyy")}</span>
              </div>
            </div>

            <button 
              onClick={() => handleViewTrainer(request._id)}
              className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white font-black uppercase text-[10px] tracking-[0.2em] py-4 rounded-xl shadow-lg shadow-blue-900/20"
            >
              <Eye size={16} /> Open Dossier
            </button>
          </div>
        ))}
      </div>

      {/* Pagination - Responsive Scaling */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-6">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="w-full sm:w-auto flex items-center justify-center px-6 py-3 text-[10px] font-black uppercase tracking-widest bg-gray-800 text-white rounded-xl hover:bg-gray-700 disabled:opacity-30 transition-all"
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" /> Previous
          </button>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 px-2 max-w-full">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                  currentPage === i + 1
                    ? 'bg-blue-600 text-white font-black shadow-lg shadow-blue-900/40'
                    : 'bg-gray-800 text-gray-500 hover:text-white'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="w-full sm:w-auto flex items-center justify-center px-6 py-3 text-[10px] font-black uppercase tracking-widest bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-30 transition-all"
            disabled={currentPage === totalPages}
          >
            Next <ChevronRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      )}

      {applicants.length === 0 && !loading && (
        <div className="text-center py-20 bg-gray-900/20 border border-dashed border-gray-800 rounded-3xl">
          <p className="text-gray-600 font-black uppercase tracking-widest text-xs">No pending verification requests found.</p>
        </div>
      )}
    </div>
  );
};

export default TrainerVerification;