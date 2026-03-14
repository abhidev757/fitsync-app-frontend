"use client"

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { fetchTrainer, getTrainerReviews, createPaymentIntent, createBooking } from "../../axios/userApi";
import { format, parseISO } from "date-fns";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { ShieldCheck, CreditCard, Receipt, User, ChevronLeft } from "lucide-react";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface Trainer {
  _id: string;
  name: string;
  specializations: string;
  profileImageUrl: string;
  rating: number;
  description: string;
  experience?: string[];
  timeSlots?: {
    time: string;
    price: number;
    startDate: string;
  }[];
  packages?: {
    time: string;
    sessions: number;
    price: number;
    dateRange: string;
  }[];
}

interface BookingState {
  time: string;
  price: number;
  startDate: string;
  isPackage: boolean;
}

const CheckoutForm: React.FC<{
  trainer: Trainer;
  booking: BookingState;
  total: number;
  onSuccess: () => void;
}> = ({ trainer, booking, total, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    if (!stripe || !elements) return;

    try {
      const userId = localStorage.getItem('userId');
      const userInfoString = localStorage.getItem('userInfo');

      if (!userId || !userInfoString) {
        throw new Error("User not authenticated");
      }

      const userInfo = JSON.parse(userInfoString);

      const { clientSecret } = await createPaymentIntent({
        amount: total * 100,
        userId: userId,
        trainerId: trainer._id,
        sessionTime: booking.time,
        startDate: booking.startDate,
        isPackage: booking.isPackage
      });

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: userInfo.name,
          },
        },
      });

      if (stripeError) throw stripeError;

      if (paymentIntent?.status === "succeeded") {
        await createBooking({
          user: userId,
          trainer: trainer._id,
          clientName: userInfo.name,
          clientEmail: userInfo.email,
          sessionTime: booking.time,
          startDate: booking.startDate,
          isPackage: booking.isPackage,
          paymentId: paymentIntent.id,
          amount: total
        });

        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || "Payment failed");
      console.error("Payment error:", err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 md:mt-12">
      <div className="bg-black border border-gray-900 rounded-2xl p-5 md:p-8 mb-8">
        <div className="flex items-center gap-2 mb-6 text-[#CCFF00]">
          <CreditCard size={18} />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Secure Data Link</h3>
        </div>
        <div className="bg-[#0D1117] border border-gray-800 rounded-xl p-4 focus-within:border-[#CCFF00] transition-all">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "14px",
                  color: "#ffffff",
                  fontFamily: 'Inter, sans-serif',
                  "::placeholder": { color: "#374151" },
                  backgroundColor: "transparent",
                },
                invalid: { color: "#FF5252" },
              },
            }}
          />
        </div>
        {error && <div className="text-red-500 mt-4 text-[10px] font-black uppercase tracking-tight italic border-l-2 border-red-500 pl-3">{error}</div>}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-t border-gray-900 pt-8">
        <div className="flex flex-col text-center md:text-left w-full md:w-auto">
          <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em]">Total Authorization</span>
          <div className="text-4xl font-black text-white italic tracking-tighter">₹{total}.00</div>
        </div>
        <button
          className={`w-full md:w-auto bg-[#CCFF00] text-black font-black py-5 px-12 rounded-xl uppercase text-[10px] tracking-widest hover:shadow-[0_0_30px_rgba(204,255,0,0.4)] transition-all ${processing ? "opacity-50 cursor-not-allowed" : "active:scale-95"}`}
          type="submit"
          disabled={!stripe || processing}
        >
          {processing ? "Establishing Link..." : "Initialize Payment"}
        </button>
      </div>
      <div className="mt-8 flex justify-center items-center gap-3 text-gray-700">
        <ShieldCheck size={14} className="text-[#CCFF00]/40" />
        <span className="text-[8px] font-black uppercase tracking-[0.4em]">End-to-End Encryption Active</span>
      </div>
    </form>
  );
};

const BookingCheckout: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as BookingState | undefined;
  const { time, price, startDate, isPackage } = state || {};

  const [trainerData, setTrainerData] = useState<Trainer | null>(null);
  const [loading, setLoading] = useState(true);
  const [trainerRating, setTrainerRating] = useState<number | null>(null);

  useEffect(() => {
    const fetchTrainerData = async () => {
      try {
        if (!id) return;
        const response = await fetchTrainer(id);
        setTrainerData(response);

        try {
          const reviews = await getTrainerReviews(id);
          if (reviews && reviews.length > 0) {
            const avgRating = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length;
            setTrainerRating(avgRating);
          }
        } catch (reviewErr) {
          console.error("Error fetching reviews:", reviewErr);
        }
      } catch (error) {
        console.error("Error fetching trainer data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrainerData();
  }, [id]);

  const total = isPackage ? Number(price) * 10 : Number(price);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(parseISO(dateString), "MMM d, yyyy");
    } catch {
      return dateString;
    }
  };

  const handlePaymentSuccess = () => {
    navigate("/user/paymentSuccess", {
      state: {
        booking: {
          trainer: trainerData,
          time,
          startDate,
          isPackage,
          total,
        },
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 border-2 border-t-[#CCFF00] border-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#CCFF00]">Securing Protocol</p>
        </div>
      </div>
    );
  }

  if (!trainerData || !state) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-6">Link Mismatch Detected</h2>
        <button onClick={() => navigate(-1)} className="bg-gray-900 text-[#CCFF00] px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest">Return to Roster</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans p-4 md:p-8 pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8 md:mb-12">
          <button onClick={() => navigate(-1)} className="p-2.5 bg-gray-900 rounded-xl text-gray-400 hover:text-[#CCFF00] active:scale-90 transition-all">
            <ChevronLeft size={20} />
          </button>
          <div>
            <p className="text-[#CCFF00] font-black text-[9px] tracking-[0.4em] uppercase mb-0.5">Secure Transaction</p>
            <h1 className="text-2xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">Booking Checkout</h1>
          </div>
        </div>

        <div className="bg-[#0B0B0B] border border-gray-900 rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#CCFF00] opacity-5 blur-[100px] pointer-events-none"></div>

          {/* Trainer Summary Card */}
          <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-8 mb-10 pb-10 border-b border-gray-900">
            <div className="relative shrink-0">
              <div className="absolute -inset-1 bg-[#CCFF00] rounded-full blur opacity-10"></div>
              <img
                src={trainerData.profileImageUrl || "/placeholder.svg"}
                alt={trainerData.name}
                className="relative w-24 h-24 md:w-28 md:h-28 rounded-full object-cover grayscale border-2 border-gray-800"
              />
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-[#CCFF00] mb-1">{trainerData.name}</h2>
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">{trainerData.specializations}</p>
              <div className="flex items-center justify-center sm:justify-start mt-3 gap-2 bg-black/40 w-fit px-3 py-1 rounded-lg border border-gray-900 mx-auto sm:mx-0">
                <span className="text-[#CCFF00] text-[10px]">★</span>
                <span className="text-[10px] font-black italic">{trainerRating !== null ? trainerRating.toFixed(1) : "NEW"}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Booking Details */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Receipt className="text-[#CCFF00]" size={16} />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Manifest</h3>
              </div>
              <div className="bg-black border border-gray-900 rounded-2xl p-5 md:p-6 space-y-5">
                {[
                  { label: "Operation", val: isPackage ? "10 Session Bundle" : "Single Deployment", highlight: true },
                  { label: "Window", val: isPackage ? "Cycle Based" : formatDate(startDate) },
                  { label: "Slot", val: time || "Pending Allocation" },
                  { label: "Operative", val: trainerData.name }
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1 border-b border-gray-900/50 last:border-0 pb-3 last:pb-0">
                    <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest">{item.label}</span>
                    <span className={`text-[11px] font-black uppercase italic ${item.highlight ? "text-[#CCFF00]" : "text-gray-300"}`}>
                      {item.val}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Ledger */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <User className="text-[#CCFF00]" size={16} />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Ledger</h3>
              </div>
              <div className="bg-black border border-gray-900 rounded-2xl p-5 md:p-6 space-y-4">
                <div className="flex justify-between items-center py-1 border-b border-gray-900/50 pb-3">
                  <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest">Base Rate</span>
                  <span className="text-[11px] font-black italic text-gray-400">₹{price}.00</span>
                </div>
                {isPackage && (
                  <div className="flex justify-between items-center py-1 border-b border-gray-900/50 pb-3">
                    <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest">Quantity</span>
                    <span className="text-[11px] font-black italic text-[#CCFF00]">x10 Units</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-4 bg-[#CCFF00]/5 -mx-5 md:-mx-6 px-5 md:px-6 mt-4">
                  <span className="text-[10px] font-black text-[#CCFF00] uppercase tracking-[0.3em]">Net Balance</span>
                  <span className="text-2xl font-black italic tracking-tighter text-white">₹{total}.00</span>
                </div>
              </div>
            </div>
          </div>

          <Elements stripe={stripePromise}>
            <CheckoutForm
              trainer={trainerData}
              booking={state}
              total={total}
              onSuccess={handlePaymentSuccess}
            />
          </Elements>
        </div>
      </div>
    </div>
  );
};

export default BookingCheckout;