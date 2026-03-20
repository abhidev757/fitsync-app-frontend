import React, { useEffect, useState, useCallback } from "react";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { resendTrainerOtp, verifyTrainerOtp } from "../../axios/trainerApi";
import { ShieldCheck, RefreshCw, ChevronLeft } from "lucide-react";

export default function OTPVerification() {
  const [otp, setOtp] = useState<string[]>(Array(4).fill(""));
  const [emailId, setEmailId] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmailId = localStorage.getItem("trainerEmailId");
    if (storedEmailId) {
      setEmailId(storedEmailId);
    } else {
      navigate("/trainerSignup");
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
      await verifyTrainerOtp({ otp: otp.join(""), emailId });
      toast.success("Security Verified: Protocol Initiated");
      navigate("/trainerSignin");
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "OTP verification failed");
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  const handleResendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await resendTrainerOtp({ emailId });
      setOtp(Array(4).fill(""));
      startTimer();
      toast.success("Fresh credentials transmitted to inbox.");
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Failed to resend OTP");
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col overflow-x-hidden">
      {/* Top Navigation Bar */}
      <div className="p-4 md:p-6 flex justify-between items-center border-b border-gray-900 bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="flex flex-col">
          <span className="text-[#CCFF00] font-black text-[8px] md:text-[10px] tracking-[0.3em] md:tracking-[0.4em] uppercase mb-0.5">Verification Protocol</span>
          <h1 className="text-lg md:text-xl font-black italic uppercase tracking-tighter">
            FIT<span className="text-[#CCFF00]">SYNC</span> OPS
          </h1>
        </div>
        <Link to="/trainerSignin" className="group flex items-center gap-1 md:gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all">
          <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> <span className="hidden xs:inline">Sign In</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 md:p-6 relative">
        {/* Background Ambient Glow - Scaled for mobile */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] md:w-[400px] h-[280px] md:h-[400px] bg-[#CCFF00] opacity-5 blur-[80px] md:blur-[120px] pointer-events-none"></div>

        <div className="w-full max-w-md bg-[#0B0B0B] border border-gray-900 rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative z-10 text-center">

          {/* Header Icon */}
          <div className="flex justify-center mb-6 md:mb-8">
            <div className="relative">
              <div className="absolute -inset-3 md:-inset-4 bg-[#CCFF00] rounded-full blur-2xl opacity-10 animate-pulse"></div>
              <div className="relative bg-black border border-gray-800 p-3 md:p-4 rounded-xl md:rounded-2xl shadow-xl">
                <ShieldCheck size={28} className="text-[#CCFF00] md:w-8 md:h-8" />
              </div>
            </div>
          </div>

          <div className="mb-8 md:mb-10">
            <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic mb-3">Identity Lock</h2>
            <p className="text-gray-500 text-[11px] md:text-xs font-medium leading-relaxed italic max-w-[240px] md:max-w-[280px] mx-auto">
              A secure signal has been transmitted to your inbox. Authorize credentials to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10">
            {/* OTP Grid - Made flexible for narrow screens */}
            <div className="flex justify-center gap-2 sm:gap-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-input-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onFocus={(e) => e.target.select()}
                  className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-black rounded-lg sm:rounded-xl bg-black border border-gray-800 text-[#CCFF00] focus:outline-none focus:ring-1 focus:ring-[#CCFF00] transition-all"
                />
              ))}
            </div>

            {/* Timer & Resend */}
            <div className="text-center">
              {timeLeft > 0 ? (
                <div className="flex flex-col items-center gap-1">
                  <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-gray-600">Signal Link Expires In</p>
                  <p className="text-lg md:text-xl font-black italic text-white tracking-tighter">{timeLeft}s</p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="flex items-center justify-center gap-2 mx-auto text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-[#CCFF00] hover:text-white transition-colors"
                >
                  <RefreshCw size={14} /> Resend Signal
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={otp.some(v => v === "")}
              className="w-full bg-[#CCFF00] text-black font-black py-4 md:py-5 px-4 rounded-xl md:rounded-2xl uppercase text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.3em] hover:shadow-[0_0_30px_rgba(204,255,0,0.4)] transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Authorize Access
            </button>
          </form>

          <p className="mt-8 md:mt-12 text-[8px] md:text-[9px] font-black text-gray-700 uppercase tracking-[0.3em] md:tracking-[0.4em] leading-relaxed">
            FITSYNC CORE ENCRYPTION // 2026
          </p>
        </div>
      </div>
    </div>
  );
}