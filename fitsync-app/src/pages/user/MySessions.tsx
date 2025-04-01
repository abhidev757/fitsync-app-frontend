import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getBookings } from '../../axios/userApi'; // Adjust the import path as needed

interface Booking {
  _id: string;
  trainerId: {
    _id: string;
    name: string;
    profileImageUrl: string;
  };
  sessionTime: string;
  startDate: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  // Add other fields as needed
}

const MySessions: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
       
        const currentUserId =  localStorage.getItem('userId');
        if (!currentUserId) {
          throw new Error('User not authenticated');
        }
        const data = await getBookings(currentUserId);
        setBookings(data);
      } catch (err) {
        setError('Failed to fetch bookings');
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Transform API data to match your UI structure
  const sessions = bookings.map(booking => ({
    id: booking._id,
    trainerName: booking.trainerId.name,
    trainerImage: booking.trainerId.profileImageUrl || 'https://via.placeholder.com/80',
    sessionType: 'Training Session', // You might want to add session type to your API
    date: new Date(booking.startDate).toLocaleDateString(),
    time: booking.sessionTime,
    status: booking.status === 'confirmed' ? 'upcoming' : 
           booking.status === 'completed' ? 'completed' : 'cancelled'
  }));

  // Mock data for upcoming sessions (you can replace this with actual data if available)
  const upcomingSessions = bookings
    .filter(booking => booking.status === 'confirmed')
    .map(booking => ({
      id: booking._id,
      trainer: booking.trainerId.name,
      type: 'Training Session',
      time: booking.sessionTime
    }));

  // Mock data for recent activities (you can enhance this with actual data)
  const recentActivities = bookings.map(booking => ({
    id: booking._id,
    description: `Session with ${booking.trainerId.name}`,
    date: new Date(booking.startDate).toLocaleDateString(),
    type: booking.status === 'confirmed' ? 'upcoming' : 
          booking.status === 'completed' ? 'completion' : 'payment'
  }));

  const hasSessions = sessions.length > 0;

  if (loading) {
    return <div className="p-6 text-[#d9ff00]">Loading sessions...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6">
      {/* My Sessions Section */}
      <div className="bg-[#1a1a1a] rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-[#d9ff00] mb-6">My Sessions</h2>
        
        {hasSessions ? (
          <div className="space-y-4">
            {sessions.map(session => (
              <div key={session.id} className="bg-[#222222] rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img 
                    src={session.trainerImage} 
                    alt={session.trainerName} 
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-[#d9ff00] font-medium">
                      {session.sessionType} with {session.trainerName}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Date: {session.date}, Time: {session.time}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded-full text-sm">
                    Chat
                  </button>
                  {session.status === 'upcoming' ? (
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-full text-sm">
                      Join now
                    </button>
                  ) : (
                    <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-full text-sm">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#222222] rounded-lg p-16 flex flex-col items-center justify-center">
            <p className="text-gray-400 mb-8">No Sessions Attended</p>
            <Link to="/trainers">
              <button className="bg-[#d9ff00] hover:bg-[#c8e600] text-black px-6 py-2 rounded-full font-medium">
                Book now
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Upcoming Sessions and Recent Activity Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Sessions */}
        <div className="bg-[#1a1a1a] rounded-lg p-6">
          <h2 className="text-xl font-bold text-[#d9ff00] mb-6">Upcoming Sessions</h2>
          
          <div className="bg-[#222222] rounded-lg p-6">
            {upcomingSessions.length > 0 ? (
              upcomingSessions.map((session) => (
                <div key={session.id} className="mb-2 last:mb-0">
                  <p className="text-[#d9ff00]">
                    {session.type} with {session.trainer} - {session.time}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No upcoming sessions</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#1a1a1a] rounded-lg p-6 flex flex-col">
          <h2 className="text-xl font-bold text-[#d9ff00] mb-6">Recent Activity</h2>
          
          <div className="bg-[#222222] rounded-lg p-6 flex-1">
            {recentActivities.length > 0 ? (
              recentActivities.map(activity => (
                <div key={activity.id} className="mb-2 last:mb-0">
                  <p className="text-[#d9ff00]">{activity.description}</p>
                  <p className="text-sm text-gray-400">Date: {activity.date}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No recent activity</p>
            )}
          </div>
          
          <div className="mt-4 flex justify-end">
            <Link to="/trainers">
              <button className="bg-[#d9ff00] hover:bg-[#c8e600] text-black px-6 py-2 rounded-full font-medium">
                View Trainers
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MySessions;