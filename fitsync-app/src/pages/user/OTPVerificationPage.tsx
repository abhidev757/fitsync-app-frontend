"use client";

import type React from "react";
import { useEffect, useState, useCallback } from "react";
import { AxiosError } from "axios";
import AuthLayout from "./AuthLayout";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { resendUserOtp, verifyUserOtp } from "../../axios/userApi";
import { ShieldCheck, RefreshCw, ChevronLeft } from "lucide-react";

const OTPVerificationPage: React.FC = () => {
  const [otp, setOtp] = useState<string[]>(Array(4).fill(""));
  const [emailId, setEmailId] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmailId = localStorage.getItem("emailId");
    if (storedEmailId) {
      setEmailId(storedEmailId);
    } else {
      navigate("/signup");
    }
  }, [navigate]);

  const startTimer = useCallback(() => {
    setTimeLeft(60);
    const timerInterval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime > 0) {
          return prevTime - 1;
        } else {
          clearInterval(timerInterval);
          return 0;
        }
      });
    }, 1000);
    return () => clearInterval(timerInterval);
  }, []);

  useEffect(() => {
    const cleanup = startTimer();
    return cleanup;
  }, [startTimer]);

  const handleInputChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); 
    setOtp(newOtp);

    if (value && index < 3) {
      document.getElementById(`otp-input-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`)?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await verifyUserOtp({
        otp: otp.join(""),
        emailId,
      });

      toast.success("Security Verified: Protocol Initiated");
      navigate("/userInfo");
    } catch {
      toast.error("Invalid OTP: Security mismatch.");
    }
  };

  const handleResendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await resendUserOtp({ emailId });
      setOtp(Array(4).fill(""));
      startTimer();
      toast.success("Fresh credentials transmitted.");
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      toast.error(error.response?.data?.message || "Transmission failed.");
    }
  };

  return (
    <AuthLayout title="Security Auth">
      {/* Tactical Back Navigation */}
      <div className="absolute top-6 left-4 md:left-8 z-20">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-500 font-black text-[10px] uppercase tracking-widest hover:text-[#CCFF00] transition-all"
        >
          <ChevronLeft size={16} />
          <span>Modify Credentials</span>
        </button>
      </div>

      <div className="w-full max-w-sm mx-auto px-2">
        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-6">
            <div className="absolute -inset-4 bg-[#CCFF00] rounded-full blur-2xl opacity-10 animate-pulse"></div>
            <div className="relative bg-gray-900 p-4 rounded-2xl border border-gray-800 shadow-xl">
              <ShieldCheck className="text-[#CCFF00]" size={32} />
            </div>
          </div>
          <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter text-white mb-2">Identify Verification</h2>
          <p className="text-center text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-gray-600 max-w-[260px] leading-relaxed">
            Secure signal transmitted to <span className="text-gray-400 italic lowercase">{emailId}</span>.
          </p>
        </div>

        <form className="mt-8 space-y-10" onSubmit={handleSubmit}>
          {/* OTP Input Grid - Fixed for Mobile */}
          <div className="flex justify-center gap-3 md:gap-4">
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                name="otp"
                id={`otp-input-${index}`}
                maxLength={1}
                value={data}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onFocus={(e) => e.target.select()}
                className="w-14 h-16 md:w-16 md:h-20 text-center text-2xl md:text-3xl font-black rounded-2xl bg-[#0B0B0B] border border-gray-800 text-[#CCFF00] focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00] transition-all shadow-2xl"
              />
            ))}
          </div>

          <div className="flex flex-col items-center gap-4">
            {timeLeft > 0 ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 rounded-full border border-gray-800/50">
                <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-pulse"></span>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">
                  Signal stable: <span className="text-white italic">{timeLeft}s</span>
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#CCFF00] hover:text-white transition-all active:scale-95 py-2"
              >
                <RefreshCw size={12} className="animate-spin-slow" /> Request New Signal
              </button>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="group relative w-full flex justify-center py-5 px-4 border border-transparent text-[11px] font-black rounded-2xl text-black bg-[#CCFF00] hover:shadow-[0_0_30px_rgba(204,255,0,0.5)] transition-all focus:outline-none uppercase tracking-[0.2em] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-xl"
              disabled={otp.some(v => v === "")}
            >
              Authorize Access
            </button>
          </div>
        </form>

        <div className="mt-16 pt-8 border-t border-gray-900/50">
          <p className="text-center text-[8px] font-black text-gray-800 uppercase tracking-[0.5em] italic leading-relaxed">
            Encrypted Channel // FitSync Core // Security Protocol 4.1
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default OTPVerificationPage;