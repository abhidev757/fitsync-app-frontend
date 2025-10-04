import React, { useEffect, useState, Fragment } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { getBookingsDetails, cancelBooking } from '../../axios/userApi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Booking {
  _id: string;
  userId: {
    name: string;
  };
  trainerId: {
    name: string;
  };
  sessionTime: string;
  startDate: string;
  isPackage: boolean;
  paymentId: string;
  amount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const BookingDetails: React.FC = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        if (!bookingId) return;
        const data = await getBookingsDetails(bookingId);
        setBooking(data);
      } catch (err) {
        toast.error('Failed to load booking.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const handleCancel = () => setIsOpen(true);

  const confirmCancel = async () => {
    if (!bookingId) return;
    setIsCancelling(true);
    try {
      await cancelBooking(bookingId);
      toast.success('Booking cancelled successfully');
      navigate('/user/mySessions');
    } catch (err) {
      toast.error('Failed to cancel booking');
      console.error(err);
    } finally {
      setIsCancelling(false);
      setIsOpen(false);
    }
  };

  if (loading) return <div className="p-6 text-yellow-300">Loading...</div>;
  if (!booking) return <div className="p-6 text-red-400">Booking not found.</div>;

  return (
    <div className="p-6 relative">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="bg-[#1a1a1a] rounded-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-8">Booking Details</h1>

        <div className="bg-[#222222] rounded-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6">
            <div className="flex items-center">
              <span className="text-gray-400 font-medium w-32">Client Name :</span>
              <span className="text-white">{booking.userId.name}</span>
            </div>

            <div className="flex items-center">
              <span className="text-gray-400 font-medium w-32">Trainer :</span>
              <span className="text-white">{booking.trainerId.name}</span>
            </div>

            <div className="flex items-center">
              <span className="text-gray-400 font-medium w-32">Date :</span>
              <span className="text-white">{new Date(booking.startDate).toLocaleDateString()}</span>
            </div>

            <div className="flex items-center">
              <span className="text-gray-400 font-medium w-32">Time :</span>
              <span className="text-white">{booking.sessionTime}</span>
            </div>

            <div className="flex items-center">
              <span className="text-gray-400 font-medium w-32">Plan :</span>
              <span className="text-white">{booking.isPackage ? 'Package Plan' : 'Single Session'}</span>
            </div>

            <div className="flex items-center">
              <span className="text-gray-400 font-medium w-32">Amount :</span>
              <span className="text-white">${booking.amount}</span>
            </div>

            <div className="flex items-center">
              <span className="text-gray-400 font-medium w-32">Status :</span>
              <span className="text-white capitalize">{booking.status}</span>
            </div>
          </div>

          {booking.status === 'confirmed' && (
            <div className="flex justify-end mt-8">
              <button
                onClick={handleCancel}
                className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal with animation */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-60" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[#1f1f1f] p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-white">
                    Confirm Cancellation
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-300">
                      Are you sure you want to cancel this booking? This action cannot be undone.
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end space-x-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-500"
                      onClick={() => setIsOpen(false)}
                      disabled={isCancelling}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                      onClick={confirmCancel}
                      disabled={isCancelling}
                    >
                      {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default BookingDetails;
