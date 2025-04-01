"use client"

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { fetchTrainer } from "../../axios/userApi";
import { format, parseISO } from "date-fns";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { createPaymentIntent, createBooking } from "../../axios/userApi";

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
  reviews?: {
    id: number;
    author: string;
    avatar: string;
    rating: number;
    text: string;
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
      if (!userId) {
        throw new Error("User not authenticated");
      }
      // 1. Create payment intent
      const { clientSecret } = await createPaymentIntent({
        amount: total * 100,
        userId: userId,
        trainerId: trainer._id,
        sessionTime: booking.time,
        startDate: booking.startDate,
        isPackage: booking.isPackage
      });

      // 2. Confirm payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: "Customer Name", // Replace with actual user name
          },
        },
      });

      if (stripeError) throw stripeError;

      if (paymentIntent?.status === "succeeded") {
        // 3. Create booking
        await createBooking({
          user: userId,
          trainer: trainer._id,
          sessionTime: booking.time,
          startDate: booking.startDate,
          isPackage: booking.isPackage,
          paymentId: paymentIntent.id,
          amount: total
        });

        // 4. Navigate to success
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
    <form onSubmit={handleSubmit} className="mt-6">
      <div className="bg-[#2a2a2a] rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
        <div className="border border-gray-600 rounded-lg p-3">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#ffffff",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                  backgroundColor: "transparent",
                },
                invalid: {
                  color: "#ff5252",
                },
              },
            }}
          />
        </div>
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </div>

      <div className="flex justify-between items-center border-t border-gray-700 pt-4">
        <div className="text-lg font-bold">
          Total Amount: <span className="text-white">${total}</span>
        </div>
        <button
          className={`bg-[#d9ff00] hover:bg-[#c8e600] text-black font-medium py-2 px-8 rounded-lg transition-colors ${
            processing ? "opacity-70 cursor-not-allowed" : ""
          }`}
          type="submit"
          disabled={!stripe || processing}
        >
          {processing ? "Processing..." : "Confirm & Pay"}
        </button>
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
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
        <div className="animate-pulse">Loading booking details...</div>
      </div>
    );
  }

  if (!trainerData || !state) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
        <div>Booking information not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Booking Checkout</h1>

        <div className="bg-[#1a1a1a] rounded-lg p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <img
              src={trainerData.profileImageUrl || "/placeholder.svg"}
              alt={trainerData.name}
              className="w-24 h-24 rounded-full object-cover"
            />
            <div>
              <h2 className="text-xl font-bold text-[#d9ff00]">{trainerData.name}</h2>
              <p className="text-gray-300">{trainerData.specializations}</p>
              {trainerData.rating && (
                <div className="flex items-center mt-1">
                  <span className="text-yellow-400 mr-1">★</span>
                  <span>{trainerData.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Booking Details</h3>
            <div className="bg-[#2a2a2a] rounded-lg p-4">
              <div className="mb-4">
                <h4 className="text-[#d9ff00] font-medium">
                  {isPackage ? "Training Package" : "Single Session"}
                </h4>
              </div>
              <div className="grid grid-cols-2 py-2 border-b border-gray-700">
                <span className="text-gray-400">Date:</span>
                <span>
                  {isPackage 
                    ? trainerData.packages?.[0]?.dateRange || "Custom dates" 
                    : formatDate(startDate)}
                </span>
              </div>
              <div className="grid grid-cols-2 py-2 border-b border-gray-700">
                <span className="text-gray-400">Time:</span>
                <span>{time || "Not specified"}</span>
              </div>
              <div className="grid grid-cols-2 py-2 border-b border-gray-700">
                <span className="text-gray-400">Trainer:</span>
                <span>{trainerData.name}</span>
              </div>
              <div className="grid grid-cols-2 py-2 border-b border-gray-700">
                <span className="text-gray-400">Service:</span>
                <span className="text-[#d9ff00] capitalize">
                  {trainerData.specializations}
                </span>
              </div>
              <div className="grid grid-cols-2 py-2">
                <span className="text-gray-400">Plan:</span>
                <span>
                  {isPackage ? "Package (10 sessions)" : "Single Session"}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Pricing</h3>
            <div className="bg-[#2a2a2a] rounded-lg p-4">
              <div className="grid grid-cols-2 py-2 border-b border-gray-700">
                <span className="text-gray-400">Session Price:</span>
                <span>${price}</span>
              </div>
              {isPackage && (
                <div className="grid grid-cols-2 py-2 border-b border-gray-700">
                  <span className="text-gray-400">Sessions:</span>
                  <span>10</span>
                </div>
              )}
              <div className="grid grid-cols-2 py-2 font-bold">
                <span className="text-gray-400">Total:</span>
                <span>${total}</span>
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