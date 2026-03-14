"use client";

import type React from "react";
import { useEffect, useState } from "react";
import AuthLayout from "./AuthLayout";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { forgotPasswordRequesting } from "../../axios/userApi";
import { KeyRound, Mail, ChevronLeft } from "lucide-react";

const ForgotPasswordPage: React.FC = () => {
  const location = useLocation();
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (location.state) {
      const { email } = location.state as {
        email: string;
      };
      setEmail(email || "");
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await forgotPasswordRequesting({ email });
      toast.success("Protocol Initiated: Check your email for the reset link");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Transmission failed");
      } else {
        toast.error("An unexpected system error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Recover Access">
      {/* Mobile-Friendly Back Navigation */}
      <div className="absolute top-6 left-4 md:left-8 z-20">
        <Link 
          to="/signin" 
          className="flex items-center gap-2 text-[#CCFF00] font-black text-[10px] uppercase tracking-widest hover:text-white transition-all"
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Back to Login</span>
        </Link>
      </div>

      <div className="w-full max-w-md mx-auto px-2">
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-6">
            <div className="absolute -inset-4 bg-[#CCFF00] rounded-full blur-2xl opacity-10 animate-pulse"></div>
            <div className="relative bg-gray-900 p-4 rounded-2xl border border-gray-800">
              <KeyRound className="text-[#CCFF00]" size={32} />
            </div>
          </div>
          <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter text-white mb-2">Access Recovery</h2>
          <p className="text-center text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-gray-600 max-w-[260px] leading-relaxed">
            Transmit your registered email to receive recovery credentials.
          </p>
        </div>

        <form className="mt-4 md:mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-2xl overflow-hidden border border-gray-900 bg-[#0B0B0B] transition-all focus-within:border-[#CCFF00]/50 shadow-2xl">
            <div className="relative flex items-center group">
              <div className="pl-5 text-gray-700 group-focus-within:text-[#CCFF00] transition-colors">
                <Mail size={18} />
              </div>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-4 py-5 bg-transparent placeholder-gray-700 text-white focus:outline-none text-sm font-bold italic"
                placeholder="ENTER SECURE EMAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-5 px-4 border border-transparent text-[11px] font-black rounded-2xl text-black bg-[#CCFF00] hover:shadow-[0_0_30px_rgba(204,255,0,0.5)] transition-all focus:outline-none uppercase tracking-[0.2em] active:scale-95 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Transmitting Signal..." : "Initialize Recovery"}
            </button>
          </div>
        </form>

        <div className="mt-10 text-center">
          <Link 
            to="/signin" 
            className="text-[10px] font-black text-gray-600 hover:text-[#CCFF00] uppercase tracking-[0.2em] transition-all inline-flex flex-col items-center gap-2"
          >
            <span className="opacity-40">Remember credentials?</span>
            <span className="text-white underline decoration-[#CCFF00] decoration-2 underline-offset-8">Return to Secure Sign-In</span>
          </Link>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-900/50">
          <p className="text-center text-[8px] font-black text-gray-800 uppercase tracking-[0.5em] italic">
            FitSync Auth Module // End Transmission
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;