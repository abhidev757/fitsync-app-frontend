import { useState, useEffect } from 'react';
import { Calendar, Search, ChevronLeft, ChevronRight, User, Package, Clock, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getTrainerBookings } from '../../axios/trainerApi';

interface Booking {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  sessionTime: string;
  startDate: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  isPackage: boolean;
  paymentId: string;
  amount: number;
}
type FilterStatus = 'All' | 'Pending' | 'Completed' | 'Cancelled';

export default function BookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const trainerId = localStorage.getItem('trainerId');
        if (!trainerId) throw new Error('Trainer identity not verified.');
        const data = await getTrainerBookings(trainerId);
        setBookings(data);
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter(booking => {
    const matchesFilter = filter === 'All' ||
      (filter === 'Pending' && booking.status === 'confirmed') ||
      (filter === 'Completed' && booking.status === 'completed') ||
      (filter === 'Cancelled' && booking.status === 'cancelled');

    const clientName = booking.userId?.name ?? '';
    const dateStr = new Date(booking.startDate).toLocaleDateString();
    const matchesSearch = clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.sessionTime.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dateStr.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-gray-500 p-6 text-center">
      <Activity className="animate-pulse mb-4 text-[#CCFF00]" />
      <p className="text-[10px] font-black uppercase tracking-[0.4em]">Synchronizing Roster...</p>
    </div>
  );

  return (
    <div className="flex-1 p-4 md:p-8 bg-black min-h-screen text-white font-sans pb-24 md:pb-8 overflow-hidden w-full max-w-full">
      <div className="max-w-[1600px] mx-auto w-full">

        {/* Header Protocol */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 gap-4 md:gap-6">
          <div>
            <p className="text-[#CCFF00] font-black text-[10px] md:text-xs tracking-[0.3em] uppercase mb-1 md:mb-2">Personnel Management</p>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic text-white leading-none">Client Roster</h1>
          </div>
          <div className="flex items-center gap-3 md:gap-4 bg-[#0B0B0B] border border-gray-900 px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl shadow-xl">
            <Calendar size={16} className="text-[#CCFF00]" />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest italic">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </header>

        {/* Tactical Filters & Search */}
        <div className="flex flex-col xl:flex-row gap-4 md:gap-6 mb-10 w-full">
          <div className="xl:w-1/3 relative group w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-[#CCFF00] transition-colors" size={16} />
            <input
              type="text"
              placeholder="SEARCH PERSONNEL..."
              className="w-full pl-12 pr-4 py-4 bg-[#0B0B0B] border border-gray-900 rounded-2xl focus:outline-none focus:border-[#CCFF00] transition-all text-[10px] md:text-xs font-black uppercase tracking-widest placeholder-gray-800 italic"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Scrollable Filter Tabs for Mobile */}
          <div className="xl:w-2/3 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x w-full max-w-full min-w-0">
            {['All', 'Pending', 'Completed', 'Cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => { setFilter(tab as FilterStatus); setCurrentPage(1); }}
                className={`px-6 md:px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap snap-start active:scale-95 ${filter === tab
                    ? 'bg-[#CCFF00] text-black shadow-[0_0_15px_rgba(204,255,0,0.3)]'
                    : 'bg-[#0B0B0B] border border-gray-900 text-gray-600'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Data Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {currentBookings.length > 0 ? (
            currentBookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-[#0B0B0B] border border-gray-900 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] hover:border-[#CCFF00]/40 transition-all duration-300 group relative overflow-hidden flex flex-col h-full"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#CCFF00] opacity-0 group-hover:opacity-5 blur-3xl transition-opacity"></div>

                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                    <div className="p-3 md:p-4 bg-black border border-gray-800 rounded-xl md:rounded-2xl text-[#CCFF00] shrink-0">
                      <User size={20} className="md:w-6 md:h-6" />
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="text-base md:text-lg font-black italic uppercase tracking-tight truncate">{booking.userId?.name ?? "Unknown Personnel"}</h3>
                      <p className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest ${booking.status === 'confirmed' ? 'text-yellow-500' :
                          booking.status === 'completed' ? 'text-[#CCFF00]' : 'text-red-600'
                        }`}>
                        {booking.status} Protocol
                      </p>
                    </div>
                  </div>
                  <div className="p-2 bg-black border border-gray-900 rounded-lg text-gray-700 shrink-0">
                    {booking.isPackage ? <Package size={14} /> : <Clock size={14} />}
                  </div>
                </div>

                <div className="space-y-3 md:space-y-4 mb-8 flex-1">
                  <div className="flex justify-between items-center border-b border-gray-900/50 pb-3">
                    <span className="text-[8px] md:text-[9px] font-black text-gray-700 uppercase tracking-widest">Deployment</span>
                    <span className="text-[10px] md:text-xs font-bold italic text-white">{new Date(booking.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-900/50 pb-3">
                    <span className="text-[8px] md:text-[9px] font-black text-gray-700 uppercase tracking-widest">Window</span>
                    <span className="text-[10px] md:text-xs font-bold italic text-white">{booking.sessionTime}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] md:text-[9px] font-black text-gray-700 uppercase tracking-widest">Plan</span>
                    <span className="text-[8px] md:text-[9px] font-black text-[#CCFF00] uppercase tracking-widest">
                      {booking.isPackage ? 'Elite Block' : 'Standard Session'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/trainer/bookingsDetails/${booking._id}`)}
                  className="w-full py-4 bg-white text-black text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] rounded-xl md:rounded-2xl hover:bg-[#CCFF00] transition-all active:scale-95"
                >
                  Inspect Dossier
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 md:py-32 bg-[#0B0B0B] border border-dashed border-gray-900 rounded-[2.5rem] text-center px-6">
              <p className="text-gray-700 text-[10px] font-black uppercase tracking-[0.3em]">No Personnel Records Found</p>
            </div>
          )}
        </div>

        {/* Pagination Protocol */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 md:gap-4 mt-12 md:mt-16 overflow-x-auto py-2 w-full max-w-full min-w-0">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-3 md:p-4 bg-[#0B0B0B] border border-gray-900 rounded-xl text-gray-700 hover:text-[#CCFF00] disabled:opacity-10 transition-all"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex gap-1.5 md:gap-2">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index + 1)}
                  className={`min-w-[40px] md:w-12 h-10 md:h-12 rounded-xl flex items-center justify-center text-[10px] font-black transition-all ${currentPage === index + 1
                      ? "bg-[#CCFF00] text-black shadow-[0_0_15px_#CCFF00]/30"
                      : "bg-[#0B0B0B] border border-gray-900 text-gray-700"
                    }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-3 md:p-4 bg-[#0B0B0B] border border-gray-900 rounded-xl text-gray-700 hover:text-[#CCFF00] disabled:opacity-10 transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}