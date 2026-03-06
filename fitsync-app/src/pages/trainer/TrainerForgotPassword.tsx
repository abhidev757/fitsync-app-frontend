"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { trainerForgotPasswordRequesting } from "../../axios/trainerApi";
import { KeyRound, Mail, ChevronLeft, ShieldCheck } from "lucide-react";

const ForgotPasswordPage: React.FC = () => {
  const location = useLocation();
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (location.state) {
      const { email } = location.state as { email: string };
      setEmail(email || "");
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await trainerForgotPasswordRequesting({ email });
      toast.success("Protocol Initiated: Check your email for recovery credentials");
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
    <div className="min-h-screen bg-black text-white font-sans flex flex-col overflow-hidden">
      {/* Top Protocol Bar */}
      <div className="p-6 border-b border-gray-900 bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex flex-col">
                <span className="text-[#CCFF00] font-black text-[10px] tracking-[0.4em] uppercase mb-0.5">Recovery Protocol</span>
                <h1 className="text-xl font-black italic uppercase tracking-tighter">
                FIT<span className="text-[#CCFF00]">SYNC</span> OPS
                </h1>
            </div>
            <Link to="/trainerSignin" className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all">
              <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Base
            </Link>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 relative">
        {/* Background Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#CCFF00] opacity-5 blur-[120px] pointer-events-none"></div>

        <div className="w-full max-w-md bg-[#0B0B0B] border border-gray-900 rounded-[2.5rem] p-10 md:p-12 shadow-2xl relative z-10 text-center">
          
          {/* Header Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute -inset-4 bg-[#CCFF00] rounded-full blur-2xl opacity-10 animate-pulse"></div>
              <div className="relative bg-black border border-gray-800 p-4 rounded-2xl shadow-xl">
                <KeyRound size={32} className="text-[#CCFF00]" />
              </div>
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-black tracking-tighter uppercase italic mb-3 text-white">Recover Access</h2>
            <p className="text-gray-500 text-xs font-medium leading-relaxed italic max-w-[280px] mx-auto">
              Enter your registered expert email to receive recovery credentials.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 text-left">
            <div className="space-y-2">
              <label htmlFor="email-address" className="text-[10px] font-black uppercase tracking-widest text-[#CCFF00] ml-1">Expert Email</label>
              <div className="flex items-center bg-black border border-gray-800 rounded-xl p-4 focus-within:border-[#CCFF00] transition-all">
                <Mail size={16} className="text-gray-700 mr-3" />
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="bg-transparent w-full text-sm font-bold uppercase tracking-tight focus:outline-none placeholder-gray-800 text-white italic"
                  placeholder="name@fitsync.ops"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#CCFF00] text-black font-black py-5 px-4 rounded-2xl uppercase text-xs tracking-[0.3em] hover:shadow-[0_0_30px_rgba(204,255,0,0.4)] transition-all active:scale-[0.98] disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                    <ShieldCheck size={18} className="animate-pulse" /> Transmitting...
                </span>
              ) : (
                "Send Recovery Link"
              )}
            </button>
          </form>

          <div className="mt-10">
            <Link to="/trainerSignin" className="text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-[#CCFF00] transition-colors border-b border-gray-900 pb-1">
              Remembered Credentials? Sign In
            </Link>
          </div>

          <p className="mt-12 text-[9px] font-black text-gray-700 uppercase tracking-[0.4em] leading-relaxed">
            SECURE CHANNEL ENCRYPTED // 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;