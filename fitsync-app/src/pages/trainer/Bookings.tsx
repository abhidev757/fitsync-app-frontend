import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Booking {
  clientName: string;
  date: string;
  time: string;
  service: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
}

export default function BookingsPage() {
  const navigate = useNavigate()
  const [bookings] = useState<Booking[]>([
    { clientName: 'John Doe', date: '2023-10-10', time: '10:00 AM', service: 'Yoga', status: 'Pending' },
    { clientName: 'Jane Smith', date: '2023-10-11', time: '11:00 AM', service: 'Meditation', status: 'Confirmed' },
    { clientName: 'Emily Johnson', date: '2023-10-12', time: '12:00 PM', service: 'Custom Workout Plans', status: 'Pending' },
    { clientName: 'Emily Johnson', date: '2023-10-12', time: '12:00 PM', service: 'Custom Workout Plans', status: 'Cancelled' },
    { clientName: 'Emily Johnson', date: '2023-10-12', time: '12:00 PM', service: 'Custom Workout Plans', status: 'Cancelled' },
  ]);

  const statusColors = {
    Pending: 'text-yellow-500',
    Confirmed: 'text-green-500',
    Cancelled: 'text-red-500',
  };

  const viewDetailsHandle = ()=> {
    navigate('/trainer/bookingsDetails')
  }

  return (
    <div className="flex-1 p-6 text-white"> {/* Added text-white here */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Manage Your Bookings</h2>
          <div className="flex items-center space-x-2 bg-black px-4 py-2 rounded-lg">
            <Calendar size={20} />
            <span>25/11/2022</span>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Search"
              className="px-4 py-2 bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 text-white" 
            />
          </div>
          <div className="flex space-x-2">
            {['All', 'Pending', 'Completed', 'Cancelled'].map((tab) => (
              <button
                key={tab}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-white" 
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
              {bookings.map((booking, index) => (
                <tr key={index} className="border-b border-gray-700">
                  <td className="p-4">{booking.clientName}</td>
                  <td className="p-4">{booking.date}</td>
                  <td className="p-4">{booking.time}</td>
                  <td className="p-4">{booking.service}</td>
                  <td className={`p-4 ${statusColors[booking.status]}`}>
                    {booking.status}
                  </td>
                  <td className="p-4">
                    <button onClick={viewDetailsHandle} className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition-colors">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-4">
          <button className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-white"> {/* Added text-white here */}
            Previous
          </button>
          <span className="text-gray-400">Page 1 of 3</span>
          <button className="px-4 py-2 bg-black rounded-lg hover:bg-gray-900 transition-colors text-white"> {/* Added text-white here */}
            Next
          </button>
        </div>
      </div>
    </div>
  );
}