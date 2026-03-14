"use client";

import type React from "react";
import { useState } from "react";
import AuthLayout from "./AuthLayout";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { resetUserPassword } from "../../axios/userApi";
import { ShieldCheck, Lock, AlertTriangle } from "lucide-react";

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const validatePassword = (password: string) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setPasswordError("");
    setConfirmPasswordError("");

    if (!password) {
      setPasswordError("Required: Enter new credentials.");
      return;
    }
    if (!validatePassword(password)) {
      setPasswordError(
        "Criteria: 1 Upper, 1 Lower, 1 Digit, 1 Special, Min 8 Chars."
      );
      return;
    }
    if (!confirmPassword) {
      setConfirmPasswordError("Required: Confirm new credentials.");
      return;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError("Mismatch: Credentials do not align.");
      return;
    }
    if (!token) {
      toast.error("Auth Error: Invalid reset token.");
      return;
    }

    try {
      setIsLoading(true);
      await resetUserPassword({ password }, token);

      toast.success("Security Updated: Redirecting to Sign In...");
      setTimeout(() => navigate("/signin"), 3000);
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
    <AuthLayout title="Reset Protocol">
      <div className="w-full max-w-md mx-auto px-2">
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-6">
            <div className="absolute -inset-4 bg-[#CCFF00] rounded-full blur-2xl opacity-10 animate-pulse"></div>
            <div className="relative bg-gray-900 p-4 rounded-2xl border border-gray-800">
              <Lock className="text-[#CCFF00]" size={32} />
            </div>
          </div>
          <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter text-white mb-2">New Credentials</h2>
          <p className="text-center text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-gray-600 max-w-[260px] leading-relaxed italic">
            Define your new security parameters.
          </p>
        </div>

        <form className="mt-4 md:mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-2xl overflow-hidden border border-gray-900 bg-[#0B0B0B] shadow-2xl transition-all focus-within:border-[#CCFF00]/50">
            <div className="border-b border-gray-900">
              <input
                type="password"
                placeholder="NEW PASSWORD"
                required
                className="appearance-none relative block w-full px-5 py-5 bg-transparent placeholder-gray-700 text-white focus:outline-none text-sm font-bold italic"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="CONFIRM PASSWORD"
                required
                className="appearance-none relative block w-full px-5 py-5 bg-transparent placeholder-gray-700 text-white focus:outline-none text-sm font-bold italic"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          {(passwordError || confirmPasswordError) && (
            <div className="bg-red-500/5 border-l-2 border-red-600 p-4 rounded-r-xl space-y-2 animate-in fade-in slide-in-from-left-2 duration-300">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Protocol Warning</span>
              </div>
              {passwordError && <p className="text-gray-300 text-[10px] font-bold uppercase tracking-tight leading-relaxed">{passwordError}</p>}
              {confirmPasswordError && <p className="text-gray-300 text-[10px] font-bold uppercase tracking-tight leading-relaxed">{confirmPasswordError}</p>}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="group relative w-full flex justify-center py-5 px-4 border border-transparent text-[11px] font-black rounded-2xl text-black bg-[#CCFF00] hover:shadow-[0_0_30px_rgba(204,255,0,0.5)] transition-all focus:outline-none uppercase tracking-[0.2em] active:scale-95 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <ShieldCheck size={18} className="animate-pulse" /> Re-calibrating...
                </span>
              ) : (
                "Update Secure Credentials"
              )}
            </button>
          </div>
        </form>

        <div className="mt-16 pt-8 border-t border-gray-900/50">
          <p className="text-center text-[8px] font-black text-gray-800 uppercase tracking-[0.5em] italic">
            End of Line // Registry Lockdown Active
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ResetPasswordPage;