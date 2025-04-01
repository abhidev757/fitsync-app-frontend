import { useEffect, useState } from 'react';
import { getBookingsDetails } from '../../axios/trainerApi';
import { useParams } from 'react-router-dom';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

interface Trainer {
  _id: string;
  name: string;
  profileImageUrl: string;
  email: string;
  phone: string;
  yearsOfExperience: number;
}

interface Booking {
  _id: string;
  userId: User;
  trainerId: Trainer;
  sessionTime: string;
  startDate: string;
  isPackage: boolean;
  paymentId: string;
  amount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export default function BookingDetailsPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        if (!bookingId) return;
        
        const data = await getBookingsDetails(bookingId);
        setBooking(data);
      } catch (error) {
        console.error("Error fetching booking details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  if (loading) return <div>Loading...</div>;
  if (!booking) return <div>No booking details found.</div>;

  const bookingDetails = {
    "Client Name": booking.userId.name,
    "Trainer Name": booking.trainerId.name,
    "Session Time": booking.sessionTime,
    "Start Date": new Date(booking.startDate).toLocaleDateString(),
    "Amount": `$${booking.amount}`,
    "Status": booking.status,
  };

  return (
    <div className="flex-1 p-6">
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-2xl text-white font-semibold mb-6">Booking Details</h2>
        
        <div className="bg-gray p-6 rounded-lg space-y-4">
          {Object.entries(bookingDetails).map(([key, value]) => (
            <div key={key} className="flex">
              <span className="text-gray-400 w-32 capitalize">
                {key} :
              </span>
              <span className="text-white">{value}</span>
            </div>
          ))}
          
          <div className="flex justify-end mt-6">
            <button className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}