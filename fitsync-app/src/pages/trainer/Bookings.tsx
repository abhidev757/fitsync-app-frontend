import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
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

export default function BookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Completed' | 'Cancelled'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // Get trainerId from localStorage
        const trainerId = localStorage.getItem('trainerId');
        if (!trainerId) {
          throw new Error('Trainer not authenticated');
        }
        
        const data = await getTrainerBookings(trainerId);
        setBookings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const statusColors = {
    confirmed: 'text-yellow-500',
    completed: 'text-green-500',
    cancelled: 'text-red-500',
  };

  const statusLabels = {
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled'
  };

  const viewDetailsHandle = (bookingId: string) => {
    navigate(`/trainer/bookingsDetails/${bookingId}`);
  };

  // Filter bookings based on selected filter and search term
  const filteredBookings = bookings.filter(booking => {
    const matchesFilter = filter === 'All' || 
                         (filter === 'Pending' && booking.status === 'confirmed') ||
                         (filter === 'Completed' && booking.status === 'completed') ||
                         (filter === 'Cancelled' && booking.status === 'cancelled');
    
    const matchesSearch = booking.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.sessionTime.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.startDate.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex-1 p-6 text-white">
        <div className="bg-gray-800 p-6 rounded-lg">
          <p>Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6 text-white">
        <div className="bg-gray-800 p-6 rounded-lg text-red-500">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 text-white">
      <div className="bg-gray-800 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Manage Your Bookings</h2>
          <div className="flex items-center space-x-2 bg-black px-4 py-2 rounded-lg">
            <Calendar size={20} />
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Search"
              className="px-4 py-2 bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex space-x-2">
            {['All', 'Pending', 'Completed', 'Cancelled'].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 rounded-lg transition-colors text-white ${
                  filter === tab ? 'bg-gray-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
                onClick={() => setFilter(tab as any)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="text-left bg-gray-900">
              <tr>
                <th className="p-4">CLIENT NAME</th>
                <th className="p-4">DATE</th>
                <th className="p-4">TIME</th>
                <th className="p-4">SERVICE</th>
                <th className="p-4">STATUS</th>
                <th className="p-4">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <tr key={booking._id} className="border-b border-gray-700">
                    <td className="p-4">{booking.userId.name}</td>
                    <td className="p-4">{new Date(booking.startDate).toLocaleDateString()}</td>
                    <td className="p-4">{booking.sessionTime}</td>
                    <td className="p-4">
                      {booking.isPackage ? 'Training Package' : 'Single Session'}
                    </td>
                    <td className={`p-4 ${statusColors[booking.status]}`}>
                      {statusLabels[booking.status]}
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => viewDetailsHandle(booking._id)} 
                        className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-400">
                    No bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-4">
          <button className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-white">
            Previous
          </button>
          <span className="text-gray-400">Page 1 of 1</span>
          <button className="px-4 py-2 bg-black rounded-lg hover:bg-gray-900 transition-colors text-white">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}