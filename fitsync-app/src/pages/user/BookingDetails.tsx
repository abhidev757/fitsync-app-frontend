import React, { useEffect, useState, Fragment } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { getBookingsDetails, cancelBooking } from '../../axios/userApi';
import { toast, ToastContainer } from 'react-toastify';
import { ShieldAlert, Calendar, User, Activity, DollarSign, Clock } from 'lucide-react';
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

  if (loading) return (
    <div className="p-8 text-[#CCFF00] font-black uppercase tracking-widest animate-pulse">
      Accessing Secure Logs...
    </div>
  );
  
  if (!booking) return (
    <div className="p-8 text-red-500 font-black uppercase italic tracking-tighter">
      File Not Found.
    </div>
  );

  return (
    <div className="p-8 space-y-8 bg-black min-h-screen text-white">
      <ToastContainer theme="dark" />
      
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[#CCFF00] font-black text-xs tracking-widest uppercase mb-1">Session Protocol</p>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">Booking Details</h1>
        </div>
      </div>

      <div className="bg-[#0B0B0B] border border-gray-900 rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        {/* Decorative branding element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#CCFF00] opacity-5 blur-[100px] pointer-events-none"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 relative z-10">
          
          {/* Data Points */}
          <div className="flex items-center space-x-4 group">
            <div className="p-3 bg-gray-900 rounded-xl text-gray-500 group-hover:text-[#CCFF00] transition-colors">
              <User size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Client Name</p>
              <p className="text-xl font-black italic uppercase tracking-tight">{booking.userId.name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 group">
            <div className="p-3 bg-gray-900 rounded-xl text-gray-500 group-hover:text-[#CCFF00] transition-colors">
              <Activity size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Expert Assigned</p>
              <p className="text-xl font-black italic uppercase tracking-tight text-[#CCFF00]">{booking.trainerId.name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 group">
            <div className="p-3 bg-gray-900 rounded-xl text-gray-500 group-hover:text-[#CCFF00] transition-colors">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Deployment Date</p>
              <p className="text-xl font-black italic uppercase tracking-tight">
                {new Date(booking.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 group">
            <div className="p-3 bg-gray-900 rounded-xl text-gray-500 group-hover:text-[#CCFF00] transition-colors">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Time Slot</p>
              <p className="text-xl font-black italic uppercase tracking-tight">{booking.sessionTime}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 group">
            <div className="p-3 bg-gray-900 rounded-xl text-gray-500 group-hover:text-[#CCFF00] transition-colors">
              <ShieldAlert size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Integration Plan</p>
              <p className="text-xl font-black italic uppercase tracking-tight">
                {booking.isPackage ? 'Multi-Session Package' : 'Individual Session'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 group">
            <div className="p-3 bg-gray-900 rounded-xl text-gray-500 group-hover:text-[#CCFF00] transition-colors">
              <DollarSign size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Authorized Amount</p>
              <p className="text-xl font-black italic uppercase tracking-tight">₹{booking.amount}.00</p>
            </div>
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="mt-12 pt-12 border-t border-gray-900 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-3">
             <div className={`w-3 h-3 rounded-full animate-pulse ${booking.status === 'confirmed' ? 'bg-[#CCFF00]' : 'bg-red-500'}`}></div>
             <span className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Status: </span>
             <span className={`text-xs font-black uppercase tracking-[0.3em] ${booking.status === 'confirmed' ? 'text-[#CCFF00]' : 'text-red-500'}`}>
               {booking.status}
             </span>
          </div>

          {booking.status === 'confirmed' && (
            <button
              onClick={handleCancel}
              className="w-full sm:w-auto border-2 border-red-900/50 text-red-500 hover:bg-red-500 hover:text-white font-black py-4 px-10 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95"
            >
              Terminate Booking
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
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
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-6 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-[2rem] bg-[#0B0B0B] border border-gray-800 p-10 text-left align-middle shadow-2xl transition-all">
                  <Dialog.Title as="h3" className="text-2xl font-black italic uppercase tracking-tighter text-white">
                    Confirm Termination
                  </Dialog.Title>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 font-medium leading-relaxed">
                      Are you sure you want to terminate this protocol? This action will remove the assigned trainer from your schedule and cannot be undone.
                    </p>
                  </div>

                  <div className="mt-10 flex gap-4">
                    <button
                      type="button"
                      className="flex-1 rounded-xl bg-gray-900 px-6 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-gray-800 transition-colors"
                      onClick={() => setIsOpen(false)}
                      disabled={isCancelling}
                    >
                      Abort
                    </button>
                    <button
                      type="button"
                      className="flex-1 rounded-xl bg-red-600 px-6 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-red-700 shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all"
                      onClick={confirmCancel}
                      disabled={isCancelling}
                    >
                      {isCancelling ? 'Processing...' : 'Yes, Terminate'}
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