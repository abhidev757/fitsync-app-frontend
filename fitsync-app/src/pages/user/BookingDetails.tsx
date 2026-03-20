import React, { useEffect, useState, Fragment } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { getBookingsDetails, cancelBooking } from '../../axios/userApi';
import { toast, ToastContainer } from 'react-toastify';
import { ShieldAlert, Calendar, User, Activity, DollarSign, Clock, ChevronLeft } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';

interface Booking {
  _id: string;
  userId: { name: string; };
  trainerId: { name: string; };
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
    <div className="p-6 md:p-8 text-[#CCFF00] font-black uppercase tracking-[0.3em] animate-pulse h-screen flex items-center justify-center bg-black">
      Accessing Secure Logs...
    </div>
  );
  
  if (!booking) return (
    <div className="p-6 md:p-8 text-red-500 font-black uppercase italic tracking-tighter h-screen flex items-center justify-center bg-black">
      File Not Found.
    </div>
  );

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-10 bg-black min-h-screen text-white font-sans pb-24 md:pb-8">
      <ToastContainer theme="dark" position="top-center" autoClose={3000} hideProgressBar />
      
      {/* Responsive Header */}
      <div className="flex items-center gap-4 md:gap-6">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2.5 bg-gray-900 rounded-xl text-gray-400 hover:text-[#CCFF00] active:scale-90 transition-all shrink-0"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <p className="text-[#CCFF00] font-black text-[9px] md:text-xs tracking-[0.4em] uppercase mb-0.5">Session Protocol</p>
          <h1 className="text-2xl md:text-4xl font-black tracking-tighter uppercase italic leading-none">Booking Details</h1>
        </div>
      </div>

      <div className="bg-[#0B0B0B] border border-gray-900 rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 shadow-2xl relative overflow-hidden">
        {/* Branding Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#CCFF00] opacity-5 blur-[100px] pointer-events-none"></div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8 md:gap-y-12 relative z-10">
          
          {/* Data Points Grid */}
          {[
            { icon: <User size={20} />, label: "Client Name", val: booking.userId.name, color: "text-white" },
            { icon: <Activity size={20} />, label: "Expert Assigned", val: booking.trainerId.name, color: "text-[#CCFF00]" },
            { icon: <Calendar size={20} />, label: "Deployment Date", val: new Date(booking.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), color: "text-white" },
            { icon: <Clock size={20} />, label: "Time Slot", val: booking.sessionTime, color: "text-white" },
            { icon: <ShieldAlert size={20} />, label: "Integration Plan", val: booking.isPackage ? 'Multi-Session Block' : 'Individual Session', color: "text-white" },
            { icon: <DollarSign size={20} />, label: "Authorized Amount", val: `₹${booking.amount}.00`, color: "text-white" }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center space-x-4 md:space-x-6 group">
              <div className="p-3.5 bg-black border border-gray-900 rounded-xl text-gray-600 group-hover:text-[#CCFF00] group-hover:border-[#CCFF00]/30 transition-all shrink-0">
                {item.icon}
              </div>
              <div className="overflow-hidden">
                <p className="text-[9px] md:text-[10px] font-black text-gray-700 uppercase tracking-[0.2em] mb-1">{item.label}</p>
                <p className={`text-lg md:text-xl font-black italic uppercase tracking-tight truncate ${item.color}`}>
                  {item.val}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Controls */}
        <div className="mt-12 md:mt-20 pt-10 md:pt-12 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center space-x-4 bg-black/40 px-6 py-3 rounded-2xl border border-gray-900 w-full md:w-auto justify-center md:justify-start">
             <div className={`w-2 h-2 rounded-full animate-pulse shrink-0 ${booking.status === 'confirmed' ? 'bg-[#CCFF00] shadow-[0_0_8px_#CCFF00]' : 'bg-red-500'}`}></div>
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">System Status: </span>
             <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${booking.status === 'confirmed' ? 'text-[#CCFF00]' : 'text-red-500'}`}>
               {booking.status}
             </span>
          </div>

          {booking.status === 'confirmed' && (
            <button
              onClick={handleCancel}
              className="w-full md:w-auto border border-red-900/50 bg-red-950/10 text-red-500 hover:bg-red-600 hover:text-white font-black py-5 px-12 rounded-2xl text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg"
            >
              Terminate Protocol
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal - Optimized for Touch */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[100]" onClose={() => setIsOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/95 backdrop-blur-xl" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-end md:items-center justify-center p-4 md:p-6 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-10 md:scale-95"
                enterTo="opacity-100 translate-y-0 md:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 md:scale-100"
                leaveTo="opacity-0 translate-y-10 md:scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-[2.5rem] bg-[#0B0B0B] border border-gray-800 p-8 md:p-12 text-left align-middle shadow-2xl transition-all">
                  <Dialog.Title as="h3" className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white">
                    Confirm Termination
                  </Dialog.Title>
                  <div className="mt-4">
                    <p className="text-xs md:text-sm text-gray-600 font-bold uppercase tracking-tight leading-relaxed italic">
                      Warning: Terminating this protocol will decouple the assigned expert from your deployment grid. This action is irreversible.
                    </p>
                  </div>

                  <div className="mt-10 flex flex-col sm:flex-row gap-4">
                    <button
                      type="button"
                      className="flex-1 order-2 sm:order-1 rounded-xl bg-gray-900 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white hover:bg-gray-800 active:scale-95 transition-all"
                      onClick={() => setIsOpen(false)}
                      disabled={isCancelling}
                    >
                      Abort
                    </button>
                    <button
                      type="button"
                      className="flex-1 order-1 sm:order-2 rounded-xl bg-red-600 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white hover:bg-red-700 shadow-[0_0_20px_rgba(220,38,38,0.4)] active:scale-95 transition-all"
                      onClick={confirmCancel}
                      disabled={isCancelling}
                    >
                      {isCancelling ? 'Processing...' : 'Confirm'}
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