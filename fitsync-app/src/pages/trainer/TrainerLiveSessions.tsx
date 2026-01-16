import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Play, Video } from 'lucide-react';
import { getTrainerBookings, startVideoSession } from '../../axios/trainerApi'; // You'll need to add startVideoSession to your API file

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
          {bookings.length > 0 ? (
            bookings.map((session) => (
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
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-gray-900 rounded-xl border border-dashed border-gray-700">
              <p className="text-gray-500">No sessions scheduled for today.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}