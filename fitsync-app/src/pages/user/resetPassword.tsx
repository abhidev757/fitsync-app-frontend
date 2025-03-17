"use client";

import type React from "react";
import { useState } from "react";
import AuthLayout from "./AuthLayout";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { resetUserPassword } from "../../axios/userApi";

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
      setPasswordError("Please enter your password.");
      return;
    }
    if (!validatePassword(password)) {
      setPasswordError(
        "Password must include at least 1 uppercase, 1 lowercase, 1 digit, 1 special character, and be at least 8 characters long."
      );
      return;
    }
    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password.");
      return;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      return;
    }
    if (!token) {
      toast.error("Invalid or missing token.");
      return;
    }

    try {
      setIsLoading(true);
      await resetUserPassword({ password},token);

      toast.success("Password reset successfully! Redirecting to sign in...");
      setTimeout(() => navigate("/signin"), 3000);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setPasswordError(err.response?.data?.message || "Error resetting password.");
      } else {
        setPasswordError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset Password">
      <p className="mt-2 text-center text-sm text-gray-300">
        Please enter your new password below.
      </p>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <input
            type="password"
            placeholder="New Password"
            required
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}

          <input
            type="password"
            placeholder="Confirm Password"
            required
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {confirmPasswordError && <p className="text-red-500 text-sm">{confirmPasswordError}</p>}
        </div>

        <div>
          <button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            disabled={isLoading}
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
