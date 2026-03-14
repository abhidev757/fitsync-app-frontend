"use client";

import { useState, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { resetTrainerPassword } from "../../axios/trainerApi";
import axios from "axios";
import { Lock, ShieldCheck, ChevronLeft } from "lucide-react";

export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
  
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
  
    const validatePassword = (password: string) => {
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
      return passwordRegex.test(password);
    };
  
    const handleSubmit = async (e: FormEvent) => {
      e.preventDefault();
  
      setPasswordError("");
      setConfirmPasswordError("");
  
      if (!password) {
        setPasswordError("Required: Enter new credentials.");
        return;
      }
      if (!validatePassword(password)) {
        setPasswordError(
          "Criteria: 1 Uppercase, 1 Lowercase, 1 Digit, 1 Special Char, Min 8 Length."
        );
        return;
      }
      if (!confirmPassword) {
        setConfirmPasswordError("Required: Confirm new credentials.");
        return;
      }
      if (password !== confirmPassword) {
        setConfirmPasswordError("Mismatch: Passwords do not align.");
        return;
      }
      if (!token) {
        toast.error("Auth Error: Invalid or missing token.");
        return;
      }
  
      try {
        setIsLoading(true);
        await resetTrainerPassword({ password }, token);
  
        toast.success("Security Updated: Redirecting to Sign In...");
        setTimeout(() => navigate("/trainerSignin"), 3000);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setPasswordError(err.response?.data?.message || "Protocol Error: Reset failed.");
        } else {
          setPasswordError("System Error: Unexpected disruption.");
        }
      } finally {
        setIsLoading(false);
      }
    };
  

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col overflow-x-hidden">
      {/* Top Protocol Bar */}
      <div className="p-4 md:p-6 border-b border-gray-900 bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex flex-col">
                <span className="text-[#CCFF00] font-black text-[8px] md:text-[10px] tracking-[0.3em] md:tracking-[0.4em] uppercase mb-0.5">Security Override</span>
                <h1 className="text-lg md:text-xl font-black italic uppercase tracking-tighter">
                FIT<span className="text-[#CCFF00]">SYNC</span> OPS
                </h1>
            </div>
            <button onClick={() => navigate("/trainerSignin")} className="group flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all">
              <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
              <span className="hidden xs:inline">Sign In</span>
              <span className="xs:hidden">Back</span>
            </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 md:p-6 relative">
        {/* Responsive Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#CCFF00] opacity-5 blur-[80px] md:blur-[120px] pointer-events-none"></div>

        <div className="w-full max-w-md bg-[#0B0B0B] border border-gray-900 rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative z-10 text-center">
          
          <div className="flex justify-center mb-6 md:mb-8">
            <div className="relative">
              <div className="absolute -inset-3 md:-inset-4 bg-[#CCFF00] rounded-full blur-2xl opacity-10 animate-pulse"></div>
              <div className="relative bg-black border border-gray-800 p-3 md:p-4 rounded-xl md:rounded-2xl shadow-xl">
                <Lock size={28} className="text-[#CCFF00] md:w-8 md:h-8" />
              </div>
            </div>
          </div>

          <div className="mb-8 md:mb-10">
            <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic mb-3">Reset Credentials</h2>
            <p className="text-gray-500 text-[11px] md:text-xs font-medium leading-relaxed italic max-w-[260px] md:max-w-[280px] mx-auto">
              Define your new security protocol below to restore expert access.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            {/* Identity Container */}
            <div className="rounded-xl md:rounded-2xl overflow-hidden border border-gray-800 bg-black transition-all focus-within:border-[#CCFF00]/50">
              <div className="relative flex items-center border-b border-gray-900">
                <div className="pl-4 text-gray-700">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Secret Key"
                  required
                  className="appearance-none relative block w-full px-4 py-4 md:py-5 bg-transparent placeholder-gray-800 text-white focus:outline-none text-xs md:text-sm italic font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="pr-4 text-gray-700 hover:text-white transition-colors"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>

              <div className="relative flex items-center">
                <div className="pl-4 text-gray-700">
                  <ShieldCheck size={16} />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Verify Secret Key"
                  required
                  className="appearance-none relative block w-full px-4 py-4 md:py-5 bg-transparent placeholder-gray-800 text-white focus:outline-none text-xs md:text-sm italic font-medium"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="pr-4 text-gray-700 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            {(passwordError || confirmPasswordError) && (
                <div className="bg-red-500/10 border-l-2 border-red-500 p-3 space-y-1">
                    {passwordError && <p className="text-red-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest italic leading-tight">{passwordError}</p>}
                    {confirmPasswordError && <p className="text-red-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest italic leading-tight">{confirmPasswordError}</p>}
                </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#CCFF00] text-black font-black py-4 md:py-5 px-4 rounded-xl md:rounded-2xl uppercase text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.3em] hover:shadow-[0_0_30px_rgba(204,255,0,0.4)] transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                    <ShieldCheck size={16} className="animate-pulse" /> Re-calibrating...
                </span>
              ) : (
                "Update Credentials"
              )}
            </button>
          </form>

          <p className="mt-8 md:mt-12 text-[8px] md:text-[9px] font-black text-gray-700 uppercase tracking-[0.3em] md:tracking-[0.4em] leading-relaxed">
            SECURE CHANNEL ENCRYPTED // FITSYNC OPS
          </p>
        </div>
      </div>
    </div>
  );
}