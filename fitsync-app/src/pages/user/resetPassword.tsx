"use client";

import type React from "react";
import { useState } from "react";
import AuthLayout from "./AuthLayout";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { resetUserPassword } from "../../axios/userApi";
import { ShieldCheck, Lock } from "lucide-react";

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
    <AuthLayout title="Reset Credentials">
      <div className="flex flex-col items-center mb-6">
        <div className="bg-[#CCFF00]/10 p-3 rounded-2xl border border-[#CCFF00]/20 mb-4">
            <Lock className="text-[#CCFF00]" size={24} />
        </div>
        <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
          Enter your new security protocol below.
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="rounded-xl overflow-hidden border border-gray-800 bg-[#0D1117]">
          <div className="border-b border-gray-800">
            <input
              type="password"
              placeholder="New Password"
              required
              className="appearance-none relative block w-full px-4 py-4 bg-transparent placeholder-gray-600 text-white focus:outline-none focus:ring-1 focus:ring-[#CCFF00] focus:z-10 sm:text-sm italic"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Confirm New Password"
              required
              className="appearance-none relative block w-full px-4 py-4 bg-transparent placeholder-gray-600 text-white focus:outline-none focus:ring-1 focus:ring-[#CCFF00] focus:z-10 sm:text-sm italic"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        {(passwordError || confirmPasswordError) && (
            <div className="bg-red-500/10 border-l-2 border-red-500 p-3 space-y-1">
                {passwordError && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest italic">{passwordError}</p>}
                {confirmPasswordError && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest italic">{confirmPasswordError}</p>}
            </div>
        )}

        <div>
          <button
            type="submit"
            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-black rounded-xl text-black bg-[#CCFF00] hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all focus:outline-none uppercase tracking-widest active:scale-95"
            disabled={isLoading}
          >
            {isLoading ? (
                <span className="flex items-center gap-2">
                    <ShieldCheck size={18} className="animate-pulse" /> Re-calibrating...
                </span>
            ) : (
                "Update Credentials"
            )}
          </button>
        </div>
      </form>

      <p className="text-center mt-8 text-gray-700 text-[9px] font-black uppercase tracking-[0.4em]">
        Secure Socket Encryption Active
      </p>
    </AuthLayout>
  );
};

export default ResetPasswordPage;