import { useEffect, useState } from 'react';
import { getBookingsDetails, cancelBooking } from '../../axios/trainerApi';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ConfirmModal from '../../components/trainer/ConfirmModal'; 
import { User, ShieldCheck, Calendar, Clock, DollarSign, Activity, ChevronLeft, AlertCircle, Phone, Mail } from 'lucide-react';

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
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        if (!bookingId) return;
        const data = await getBookingsDetails(bookingId);
        setBooking(data);
      } catch (error) {
        toast.error("Protocol Error: Failed to load dossier.");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  const handleCancelBooking = async () => {
    try {
      if (!bookingId) return;
      await cancelBooking(bookingId);
      toast.success("Protocol Terminated: Booking Cancelled.");
      navigate("/trainer/bookings");
    } catch (error) {
      toast.error("Priority Error: Cancellation failed.");
    } finally {
      setShowConfirm(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
        <Activity className="animate-pulse mb-4 text-[#CCFF00]" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em]">Decrypting Dossier...</p>
    </div>
  );
  
  if (!booking) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-700 p-6 text-center">
        <AlertCircle size={40} className="mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em]">Target Dossier Not Found</p>
    </div>
  );

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500 p-4 md:p-0 pb-24 md:pb-8">
      {/* Header Protocol */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
        <div className="w-full md:w-auto">
          <button 
            onClick={() => navigate('/trainer/bookings')}
            className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-[#CCFF00] transition-all mb-4 active:scale-95"
          >
            <ChevronLeft size={14} /> Back to Roster
          </button>
          <p className="text-[#CCFF00] font-black text-[10px] md:text-xs tracking-[0.3em] uppercase mb-1">Detailed Inspection</p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic text-white leading-none">Personnel Dossier</h1>
        </div>
        <div className="flex items-center gap-4 bg-[#0B0B0B] border border-gray-900 px-5 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl shrink-0">
          <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-gray-600">Ref ID:</span>
          <span className="text-[10px] md:text-xs font-bold text-white font-mono uppercase">{booking._id.slice(-12)}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8">
        
        {/* Left Column: Personnel Identification */}
        <div className="xl:col-span-4 space-y-6 md:space-y-8">
          <div className="bg-[#0B0B0B] border border-gray-900 rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10 text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#CCFF00] opacity-20"></div>
            <div className="relative mb-6 mx-auto w-24 h-24 md:w-32 md:h-32">
                <div className="absolute -inset-2 bg-[#CCFF00] rounded-full blur-2xl opacity-5"></div>
                <div className="relative w-full h-full bg-black border border-gray-800 rounded-full flex items-center justify-center overflow-hidden">
                    <User size={40} className="text-gray-800" />
                </div>
            </div>
            <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-white mb-1 truncate px-2">{booking.userId.name}</h2>
            <p className="text-[9px] font-black text-[#CCFF00] uppercase tracking-[0.2em] mb-6">Verified Personnel</p>
            
            <div className="space-y-4 pt-8 border-t border-gray-900 text-left">
                <div className="flex gap-4 items-center">
                    <div className="p-2 bg-black rounded-lg border border-gray-900 text-gray-600">
                        <Mail size={14} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Secure Email</p>
                        <p className="text-xs font-bold text-white truncate italic">{booking.userId.email}</p>
                    </div>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="p-2 bg-black rounded-lg border border-gray-900 text-gray-600">
                        <Phone size={14} />
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Signal Line</p>
                        <p className="text-xs font-bold text-white italic">{booking.userId.phone || "Offline"}</p>
                    </div>
                </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className={`p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border flex items-center justify-between shadow-2xl transition-colors ${
            booking.status === 'confirmed' ? 'bg-yellow-500/5 border-yellow-500/20' : 
            booking.status === 'completed' ? 'bg-[#CCFF00]/5 border-[#CCFF00]/20' : 'bg-red-600/5 border-red-600/20'
          }`}>
             <div>
                <p className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Current Protocol</p>
                <p className={`text-xl md:text-2xl font-black italic uppercase tracking-tighter ${
                    booking.status === 'confirmed' ? 'text-yellow-500' : 
                    booking.status === 'completed' ? 'text-[#CCFF00]' : 'text-red-600'
                }`}>{booking.status}</p>
             </div>
             <ShieldCheck size={28} className={
                booking.status === 'confirmed' ? 'text-yellow-500/40' : 
                booking.status === 'completed' ? 'text-[#CCFF00]/40' : 'text-red-600/40'
             } />
          </div>
        </div>

        {/* Right Column: Deployment Logistics */}
        <div className="xl:col-span-8 space-y-6 md:space-y-8">
            <div className="bg-[#0B0B0B] border border-gray-900 rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
                <div className="flex items-center gap-3 mb-8 md:mb-10 border-b border-gray-900 pb-6">
                    <Activity className="text-[#CCFF00]" size={18} />
                    <h3 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] text-gray-500">Deployment Logistics</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12">
                    <div className="flex gap-4 md:gap-6 items-start">
                        <div className="p-3 md:p-4 bg-black border border-gray-800 rounded-xl md:rounded-2xl text-[#CCFF00] shrink-0">
                            <Calendar size={20} className="md:w-6 md:h-6" />
                        </div>
                        <div>
                            <p className="text-[8px] md:text-[9px] font-black text-gray-700 uppercase tracking-[0.2em] mb-1">Deployment Date</p>
                            <p className="text-lg md:text-xl font-black italic text-white tracking-tight">
                                {new Date(booking.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 md:gap-6 items-start">
                        <div className="p-3 md:p-4 bg-black border border-gray-800 rounded-xl md:rounded-2xl text-[#CCFF00] shrink-0">
                            <Clock size={20} className="md:w-6 md:h-6" />
                        </div>
                        <div>
                            <p className="text-[8px] md:text-[9px] font-black text-gray-700 uppercase tracking-[0.2em] mb-1">Synchronization</p>
                            <p className="text-lg md:text-xl font-black italic text-white tracking-tight">{booking.sessionTime}</p>
                        </div>
                    </div>

                    <div className="flex gap-4 md:gap-6 items-start">
                        <div className="p-3 md:p-4 bg-black border border-gray-800 rounded-xl md:rounded-2xl text-[#CCFF00] shrink-0">
                            <DollarSign size={20} className="md:w-6 md:h-6" />
                        </div>
                        <div>
                            <p className="text-[8px] md:text-[9px] font-black text-gray-700 uppercase tracking-[0.2em] mb-1">Asset Value</p>
                            <p className="text-lg md:text-xl font-black italic text-[#CCFF00] tracking-tight">₹{booking.amount}</p>
                        </div>
                    </div>

                    <div className="flex gap-4 md:gap-6 items-start">
                        <div className="p-3 md:p-4 bg-black border border-gray-800 rounded-xl md:rounded-2xl text-[#CCFF00] shrink-0">
                            <Activity size={20} className="md:w-6 md:h-6" />
                        </div>
                        <div>
                            <p className="text-[8px] md:text-[9px] font-black text-gray-700 uppercase tracking-[0.2em] mb-1">Deployment Class</p>
                            <p className="text-lg md:text-xl font-black italic text-white tracking-tight leading-tight">
                                {booking.isPackage ? "Elite Training Block" : "Standard Tactical"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-12 md:mt-16 pt-8 md:pt-10 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-gray-800 text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em] text-center md:text-left">
                        Internal Registry Access Only // FitSync Protocol 4.2
                    </p>
                    
                    {booking.status !== "cancelled" && (
                        <button
                            onClick={() => setShowConfirm(true)}
                            className="w-full md:w-auto px-10 py-5 bg-red-600 text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-xl md:rounded-2xl hover:bg-red-700 transition-all active:scale-95 flex items-center justify-center gap-3 shadow-lg"
                        >
                            <AlertCircle size={18} /> Terminate Protocol
                        </button>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* Confirmation Protocol Modal */}
      <ConfirmModal
        title="Terminate Protocol?"
        message="This action will permanently sever the link for this deployment. Confirm authorization?"
        isOpen={showConfirm}
        onConfirm={handleCancelBooking}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}