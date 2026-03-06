"use client";

import type React from "react";
import { useEffect, useState, useCallback } from "react";
import { AxiosError } from "axios";
import AuthLayout from "./AuthLayout";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { resendUserOtp, verifyUserOtp } from "../../axios/userApi";
import { ShieldCheck, RefreshCw } from "lucide-react";

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
    newOtp[index] = value.slice(-1); // Ensure only last digit is kept
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
      toast.success("Fresh credentials transmitted to inbox.");
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      toast.error(error.response?.data?.message || "Transmission failed.");
    }
  };

  return (
    <AuthLayout title="Verification">
      <div className="flex flex-col items-center mb-6">
        <div className="bg-[#CCFF00]/10 p-3 rounded-2xl border border-[#CCFF00]/20 mb-4">
          <ShieldCheck className="text-[#CCFF00]" size={24} />
        </div>
        <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-gray-500 max-w-[280px]">
          We transmitted a secure code to your inbox. Enter it to continue.
        </p>
      </div>

      <form className="mt-8 space-y-8" onSubmit={handleSubmit}>
        <div className="flex justify-center space-x-3">
          {otp.map((data, index) => (
            <input
              key={index}
              type="text"
              name="otp"
              id={`otp-input-${index}`}
              maxLength={1}
              value={data}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onFocus={(e) => e.target.select()}
              className="w-14 h-16 text-center text-2xl font-black rounded-xl bg-[#0D1117] border border-gray-800 text-[#CCFF00] focus:outline-none focus:ring-1 focus:ring-[#CCFF00] focus:border-[#CCFF00] transition-all"
            />
          ))}
        </div>

        <div className="text-center">
          {timeLeft > 0 ? (
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">
              Link expires in <span className="text-white italic">{timeLeft}s</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResendOtp}
              className="flex items-center justify-center gap-2 mx-auto text-[10px] font-black uppercase tracking-[0.3em] text-[#CCFF00] hover:text-white transition-colors"
            >
              <RefreshCw size={12} /> Resend Signal
            </button>
          )}
        </div>

        <div>
          <button
            type="submit"
            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-black rounded-xl text-black bg-[#CCFF00] hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all focus:outline-none uppercase tracking-widest active:scale-95 disabled:opacity-50"
            disabled={otp.some(v => v === "")}
          >
            Authorize Access
          </button>
        </div>
      </form>

      <p className="mt-8 text-center text-[9px] font-black text-gray-700 uppercase tracking-[0.4em] leading-relaxed">
        SECURE CHANNEL ENCRYPTED // FITSYNC CORE
      </p>
    </AuthLayout>
  );
};

export default OTPVerificationPage;