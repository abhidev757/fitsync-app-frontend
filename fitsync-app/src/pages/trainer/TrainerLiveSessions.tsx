import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Play, Square, Video, Calendar, Clock, ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import { getTrainerBookings, startVideoSession, completeSession } from '../../axios/trainerApi';

interface Booking {
  _id: string;
  meetingId: string;
  meetingStatus: 'waiting' | 'live' | 'ended';
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  sessionTime: string;
  startDate: string;
  status: 'confirmed' | 'completed' | 'cancelled';
}

export default function TrainerLiveSessions() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [confirmingEnd, setConfirmingEnd] = useState<string | null>(null);

  useEffect(() => {
    fetchLiveBookings();
  }, []);

  const fetchLiveBookings = async () => {
    try {
      const trainerId = localStorage.getItem('trainerId');
      if (!trainerId) return;
      const data = await getTrainerBookings(trainerId);
      const activeSessions = data.filter((b: Booking) => b.status === 'confirmed' && b.meetingStatus !== 'ended');
      setBookings(activeSessions);
    } catch (err) {
        toast.error("Failed to sync deployment schedule");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleStartCall = async (meetingId: string) => {
    try {
      await startVideoSession(meetingId); 
      toast.success("Link Established. Initializing Video Stream...");
      const storedInfo = localStorage.getItem('trainerInfo');
      const trainerInfo = storedInfo ? JSON.parse(storedInfo) : null;
      navigate(`/video-call/${meetingId}`, { state: { role: 'trainer', name: trainerInfo?.name } });
    } catch (err) {
      toast.error("Stream initialization failed. Check permissions.");
    }
  };

  const handleEndSession = async (bookingId: string) => {
    try {
      await completeSession(bookingId);
      toast.success("Protocol Terminated: Session marked complete.");
      setBookings(prev => prev.filter(b => b._id !== bookingId));
    } catch (err) {
      toast.error("Termination failed. System retry required.");
    } finally {
      setConfirmingEnd(null);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBookings = bookings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(bookings.length / itemsPerPage);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-gray-500">
        <Activity className="animate-pulse mb-4 text-[#CCFF00]" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em]">Syncing Live Grid...</p>
    </div>
  );

  return (
    <div className="flex-1 p-8 bg-[#0B0B0B] min-h-screen text-white font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <p className="text-[#CCFF00] font-black text-xs tracking-[0.3em] uppercase mb-2">Live Grid Operations</p>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">Deployment Schedule</h1>
        </header>

        <div className="space-y-6">
          {currentBookings.length > 0 ? (
            currentBookings.map((session) => (
              <div 
                key={session._id} 
                className={`bg-black border p-6 rounded-[2.5rem] flex flex-col lg:flex-row items-center justify-between transition-all duration-300 gap-6 ${
                    session.meetingStatus === 'live' ? 'border-[#CCFF00] shadow-[0_0_30px_rgba(204,255,0,0.1)]' : 'border-gray-900'
                }`}
              >
                {/* LEFT: ICON AND USER DATA */}
                <div className="flex items-center gap-6 flex-1 min-w-0 w-full">
                  <div className={`p-5 rounded-3xl shrink-0 ${session.meetingStatus === 'live' ? 'bg-[#CCFF00]/10' : 'bg-[#0B0B0B] border border-gray-900'}`}>
                    <Video className={session.meetingStatus === 'live' ? 'text-[#CCFF00]' : 'text-gray-700'} size={28} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-xl font-black italic uppercase tracking-tight truncate">{session.userId.name}</h3>
                        {session.meetingStatus === 'live' && (
                            <span className="px-2 py-0.5 bg-red-600 text-[8px] font-black uppercase rounded tracking-widest animate-pulse">Live Signal</span>
                        )}
                    </div>
                    
                    <div className="flex flex-wrap gap-6">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                            <Calendar size={12} className="text-[#CCFF00]" /> {new Date(session.startDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                            <Clock size={12} className="text-[#CCFF00]" /> {session.sessionTime}
                        </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT: ACTION BUTTONS */}
                <div className="flex shrink-0 items-center gap-4 w-full lg:w-auto">
                  <button 
                    onClick={() => handleStartCall(session.meetingId)}
                    className={`flex-1 lg:flex-none flex items-center justify-center gap-3 px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] transition-all active:scale-95 ${
                      session.meetingStatus === 'live' 
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-[0_0_20px_rgba(37,99,235,0.3)]' 
                      : 'bg-[#CCFF00] text-black hover:shadow-[0_0_25px_rgba(204,255,0,0.4)]'
                    }`}
                  >
                    <Play size={16} fill="currentColor" />
                    {session.meetingStatus === 'live' ? 'Re-Sync Stream' : 'Initialize Session'}
                  </button>

                  {session.meetingStatus === 'live' && (
                    <button
                      onClick={() => setConfirmingEnd(session._id)}
                      className="p-5 rounded-2xl bg-[#0B0B0B] border border-gray-800 text-red-500 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-lg"
                    >
                      <Square size={18} fill="currentColor" />
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-24 bg-[#0B0B0B] rounded-[2.5rem] border border-dashed border-gray-900">
              <Activity size={40} className="mx-auto text-gray-800 mb-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-700">No active deployments found in grid.</p>
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-16">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-3 bg-[#0B0B0B] border border-gray-900 rounded-xl text-gray-500 hover:text-[#CCFF00] disabled:opacity-20 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex gap-2">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index + 1)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black transition-all ${
                    currentPage === index + 1
                      ? "bg-[#CCFF00] text-black"
                      : "bg-[#0B0B0B] border border-gray-900 text-gray-500 hover:border-[#CCFF00]"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-3 bg-[#0B0B0B] border border-gray-900 rounded-xl text-gray-500 hover:text-[#CCFF00] disabled:opacity-20 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* TERMINATION MODAL */}
      {confirmingEnd && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-6 animate-in fade-in">
          <div className="bg-[#0B0B0B] border border-gray-900 rounded-[2.5rem] p-12 w-full max-w-md text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-red-600 opacity-50"></div>
            <div className="bg-red-500/10 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-red-500/20">
              <Square size={32} fill="currentColor" className="text-red-600" />
            </div>
            <p className="text-red-500 font-black text-[10px] tracking-[0.4em] uppercase mb-2">Priority Override</p>
            <h2 className="text-3xl font-black tracking-tighter uppercase italic text-white mb-4">End Deployment?</h2>
            <p className="text-gray-500 text-xs italic mb-10 leading-relaxed px-4">
              This action will permanently synchronize this session as <span className="text-white font-bold">COMPLETED</span>. 
              The video uplink will be severed.
            </p>
            <div className="flex flex-col gap-3">
                <button
                    onClick={() => handleEndSession(confirmingEnd)}
                    className="w-full py-5 bg-red-600 text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl hover:bg-red-700 transition-all shadow-[0_0_20px_rgba(220,38,38,0.2)]"
                >
                    Authorize Termination
                </button>
                <button
                    onClick={() => setConfirmingEnd(null)}
                    className="w-full py-5 bg-transparent border border-gray-800 text-gray-500 font-black uppercase text-xs tracking-[0.2em] rounded-2xl hover:text-white hover:border-gray-600 transition-all"
                >
                    Abort Protocol
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}