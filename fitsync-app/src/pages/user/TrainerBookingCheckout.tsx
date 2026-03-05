"use client"

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { fetchTrainer } from "../../axios/userApi";
import { format, parseISO } from "date-fns";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { createPaymentIntent, createBooking } from "../../axios/userApi";
import { ShieldCheck, CreditCard, Receipt, User } from "lucide-react";

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
          clientName:userInfo.name,
          clientEmail:userInfo.email,
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
    <form onSubmit={handleSubmit} className="mt-8">
      <div className="bg-black border border-gray-900 rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-6 text-[#CCFF00]">
            <CreditCard size={18} />
            <h3 className="text-xs font-black uppercase tracking-widest">Secure Credit Card</h3>
        </div>
        <div className="bg-[#0D1117] border border-gray-800 rounded-xl p-4 focus-within:border-[#CCFF00] transition-colors">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#ffffff",
                  fontFamily: 'Inter, sans-serif',
                  "::placeholder": {
                    color: "#4B5563",
                  },
                  backgroundColor: "transparent",
                },
                invalid: {
                  color: "#FF5252",
                },
              },
            }}
          />
        </div>
        {error && <div className="text-red-500 mt-4 text-xs font-bold uppercase tracking-tight italic">{error}</div>}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 border-t border-gray-900 pt-8">
        <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Authorized Amount</span>
            <div className="text-3xl font-black text-white italic tracking-tighter">${total}.00</div>
        </div>
        <button
          className={`w-full sm:w-auto bg-[#CCFF00] text-black font-black py-4 px-12 rounded-xl uppercase text-xs tracking-widest hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all ${
            processing ? "opacity-50 cursor-not-allowed" : "active:scale-95"
          }`}
          type="submit"
          disabled={!stripe || processing}
        >
          {processing ? "Authorizing..." : "Authorize & Pay"}
        </button>
      </div>
      <div className="mt-6 flex justify-center items-center gap-2 text-gray-600">
          <ShieldCheck size={14} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Encrypted SSL Transaction</span>
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

  useEffect(() => {
    const fetchTrainerData = async () => {
      try {
        if (!id) return;
        const response = await fetchTrainer(id);
        setTrainerData(response);
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
          <div className="h-12 w-12 border-2 border-t-[#CCFF00] border-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#CCFF00]">Securing Gateway</p>
        </div>
      </div>
    );
  }

  if (!trainerData || !state) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-black uppercase italic tracking-tighter text-3xl">
        Transaction Error
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <p className="text-[#CCFF00] font-black text-xs tracking-widest uppercase mb-1">Secure Transaction</p>
          <h1 className="text-5xl font-black tracking-tighter uppercase italic">Booking Checkout</h1>
        </div>

        <div className="bg-[#0B0B0B] border border-gray-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#CCFF00] opacity-5 blur-[100px] pointer-events-none"></div>

          {/* Trainer Summary Card */}
          <div className="flex flex-col md:flex-row items-center gap-8 mb-12 pb-12 border-b border-gray-900">
            <div className="relative">
                <div className="absolute -inset-1 bg-[#CCFF00] rounded-full blur opacity-10"></div>
                <img
                  src={trainerData.profileImageUrl || "/placeholder.svg"}
                  alt={trainerData.name}
                  className="relative w-28 h-28 rounded-full object-cover grayscale brightness-75 border-2 border-gray-800"
                />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-[#CCFF00] mb-1">{trainerData.name}</h2>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">{trainerData.specializations}</p>
              <div className="flex items-center justify-center md:justify-start mt-3 gap-1">
                <span className="text-[#CCFF00] text-xs">★</span>
                <span className="text-xs font-black italic">{trainerData.rating?.toFixed(1) || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Left: Booking Details */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Receipt className="text-[#CCFF00]" size={18} />
                <h3 className="text-xs font-black uppercase tracking-widest">Booking Invoice</h3>
              </div>
              <div className="bg-black border border-gray-900 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-900/50">
                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Plan</span>
                  <span className="text-xs font-black uppercase italic text-[#CCFF00]">
                    {isPackage ? "10 Session Package" : "Single Session"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-900/50">
                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Deployment</span>
                  <span className="text-xs font-black uppercase italic">
                    {isPackage ? "Block Training" : formatDate(startDate)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-900/50">
                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Time Slot</span>
                  <span className="text-xs font-black uppercase italic">{time || "TBD"}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Expert</span>
                  <span className="text-xs font-black uppercase italic">{trainerData.name}</span>
                </div>
              </div>
            </div>

            {/* Right: Pricing Breakdown */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <User className="text-[#CCFF00]" size={18} />
                <h3 className="text-xs font-black uppercase tracking-widest">Pricing Ledger</h3>
              </div>
              <div className="bg-black border border-gray-900 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-900/50">
                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Unit Price</span>
                  <span className="text-xs font-black italic">${price}.00</span>
                </div>
                {isPackage && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-900/50">
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Quantity</span>
                    <span className="text-xs font-black italic">x10</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-4 bg-[#CCFF00]/5 -mx-6 px-6">
                  <span className="text-[10px] font-black text-[#CCFF00] uppercase tracking-[0.2em]">Total Balance</span>
                  <span className="text-xl font-black italic tracking-tighter text-white">${total}.00</span>
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