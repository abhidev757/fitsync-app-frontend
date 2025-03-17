"use client";

import type React from "react";
import { useEffect, useState } from "react";
import AuthLayout from "./AuthLayout";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { forgotPasswordRequesting } from "../../axios/userApi";

const ForgotPasswordPage: React.FC = () => {
  const location = useLocation();
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isChangePassword, setIsChangePassword] = useState<boolean>(false);

  useEffect(() => {
    if (location.state) {
      const { email, isChangePassword } = location.state as {
        email: string;
        isChangePassword: boolean;
      };
      setEmail(email || "");
      setIsChangePassword(isChangePassword || false);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await forgotPasswordRequesting({ email });

      toast.success("Password reset link sent to your email");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Failed to send reset link");
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Forgot Password">
      <p className="mt-2 text-center text-sm text-gray-300">
        We can assign tasks, set deadlines, and track progress effortlessly.
      </p>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="rounded-md shadow-sm -space-y-px">
          <div>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send E-mail"}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <Link to="/signin" className="text-sm text-yellow-400 hover:text-yellow-500">
          Remember your password? Sign in
        </Link>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
