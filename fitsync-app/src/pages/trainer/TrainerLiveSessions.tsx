import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Play, Square, Video } from 'lucide-react';
import { getTrainerBookings, startVideoSession, completeSession } from '../../axios/trainerApi';

interface Booking {
  _id: string;
  meetingId: string;       // Added
  meetingStatus: 'waiting' | 'live' | 'ended'; // Added
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
  const [confirmingEnd, setConfirmingEnd] = useState<string | null>(null); // bookingId being ended

  useEffect(() => {
    fetchLiveBookings();
  }, []);

  const fetchLiveBookings = async () => {
    try {
      const trainerId = localStorage.getItem('trainerId');
      if (!trainerId) return;
      const data = await getTrainerBookings(trainerId);
      console.log("Booking Data:",data);
      
      const activeSessions = data.filter((b: Booking) => b.status === 'confirmed' && b.meetingStatus !== 'ended');
      setBookings(activeSessions);
    } catch (err) {
        console.log('error fetching data',err); 
        toast.error("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleStartCall = async (meetingId: string) => {
    try {
      // 1. Call the backend API we created (POST /api/video/start)
      await startVideoSession(meetingId); 
      
      toast.success("Session started! Redirecting to call...");
      
      // 2. Navigate to the video call page
      navigate(`/video-call/${meetingId}`);
    } catch (err) {
        console.log('error starting session',err);
      toast.error("Could not start session. Ensure you are authorized.");
    }
  };

  const handleEndSession = async (bookingId: string) => {
    try {
      await completeSession(bookingId);
      toast.success("Session ended and marked as completed.");
      // Remove it from the list
      setBookings(prev => prev.filter(b => b._id !== bookingId));
    } catch (err) {
      console.log('error ending session', err);
      toast.error("Could not end session. Please try again.");
    } finally {
      setConfirmingEnd(null);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBookings = bookings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(bookings.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) return <div className="p-6 text-white">Loading live sessions...</div>;

  return (
    <div className="flex-1 p-6 text-white bg-black min-h-screen">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#d9ff00]">Live Training Sessions</h1>
            <p className="text-gray-400">Start and manage your scheduled video calls</p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6">
          {currentBookings.length > 0 ? (
            currentBookings.map((session) => (
              <div key={session._id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between hover:border-[#d9ff00] transition-colors">
                <div className="flex items-center space-x-6">
                  <div className="bg-gray-800 p-4 rounded-full">
                    <Video className="text-[#d9ff00]" size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{session.userId.name}</h3>
                    <div className="flex space-x-4 text-sm text-gray-400 mt-1">
                      <span>Date: {new Date(session.startDate).toLocaleDateString()}</span>
                      <span>Time: {session.sessionTime}</span>
                    </div>
                    {session.meetingStatus === 'live' && (
                      <span className="inline-block mt-2 px-2 py-0.5 bg-red-600 text-[10px] font-bold uppercase rounded animate-pulse">
                        Live Now
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 md:mt-0 flex space-x-3">
                  <button 
                    onClick={() => handleStartCall(session.meetingId)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-full font-bold transition-all active:scale-95 ${
                      session.meetingStatus === 'live' 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-[#d9ff00] text-black hover:bg-[#c8e600]'
                    }`}
                  >
                    <Play size={18} fill="currentColor" />
                    <span>{session.meetingStatus === 'live' ? 'Re-join Call' : 'Start Session'}</span>
                  </button>

                  {session.meetingStatus === 'live' && (
                    <button
                      onClick={() => setConfirmingEnd(session._id)}
                      className="flex items-center space-x-2 px-6 py-3 rounded-full font-bold bg-red-600 hover:bg-red-700 transition-all active:scale-95"
                    >
                      <Square size={18} fill="currentColor" />
                      <span>End Session</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-gray-900 rounded-xl border border-dashed border-gray-700">
              <p className="text-gray-500">No sessions scheduled for today.</p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-8">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed border border-gray-800"
            >
              Previous
            </button>
            
            <div className="flex space-x-2">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index + 1)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    currentPage === index + 1
                      ? "bg-[#d9ff00] text-black font-bold"
                      : "bg-gray-900 border border-gray-800 text-white hover:bg-gray-800"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed border border-gray-800"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* End Session Confirmation Modal */}
      {confirmingEnd && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-md text-center">
            <div className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Square size={28} fill="white" className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">End Session?</h2>
            <p className="text-gray-400 mb-8">
              This will permanently mark the session as <span className="text-white font-semibold">Completed</span> and remove it from your live sessions. This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setConfirmingEnd(null)}
                className="flex-1 px-6 py-3 rounded-full font-bold bg-gray-700 hover:bg-gray-600 text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleEndSession(confirmingEnd)}
                className="flex-1 px-6 py-3 rounded-full font-bold bg-red-600 hover:bg-red-700 text-white transition-all"
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}