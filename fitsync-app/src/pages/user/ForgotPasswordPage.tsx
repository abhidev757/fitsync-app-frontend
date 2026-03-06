"use client";

import type React from "react";
import { useEffect, useState } from "react";
import AuthLayout from "./AuthLayout";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { forgotPasswordRequesting } from "../../axios/userApi";
import { KeyRound, Mail } from "lucide-react";

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
      <div className="flex flex-col items-center mb-6">
        <div className="bg-[#CCFF00]/10 p-3 rounded-2xl border border-[#CCFF00]/20 mb-4">
          <KeyRound className="text-[#CCFF00]" size={24} />
        </div>
        <p className="mt-2 text-center text-xs font-bold uppercase tracking-[0.2em] text-gray-500 max-w-[280px]">
          Enter your registered email to receive recovery credentials.
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="rounded-xl overflow-hidden border border-gray-800 bg-[#0D1117] transition-all focus-within:border-[#CCFF00]/50">
          <div className="relative flex items-center">
            <div className="pl-4 text-gray-600">
              <Mail size={18} />
            </div>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none relative block w-full px-4 py-4 bg-transparent placeholder-gray-600 text-white focus:outline-none sm:text-sm italic"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-black rounded-xl text-black bg-[#CCFF00] hover:shadow-[0_0_25px_rgba(204,255,0,0.4)] transition-all focus:outline-none uppercase tracking-widest active:scale-[0.98]"
            disabled={isLoading}
          >
            {isLoading ? "Transmitting..." : "Send Recovery Link"}
          </button>
        </div>
      </form>

      <div className="mt-8 text-center">
        <Link to="/signin" className="text-xs font-bold text-gray-500 hover:text-[#CCFF00] uppercase tracking-widest transition-all inline-flex items-center gap-2">
          <span className="opacity-50">Remember credentials?</span>
          <span className="text-white underline decoration-[#CCFF00] decoration-2 underline-offset-4">Sign in</span>
        </Link>
      </div>

      <p className="mt-10 text-center text-[9px] font-black text-gray-700 uppercase tracking-[0.4em]">
        FitSync Authentication Module // v2.0
      </p>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;