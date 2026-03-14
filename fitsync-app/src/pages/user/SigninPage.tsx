"use client";

import type React from "react";
import { useEffect, useState } from "react";
import AuthLayout from "./AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { toast } from "react-toastify";
import { setCredentials } from "../../slices/authSlice";
import { IApiError } from "../../types/error.types";
import { googleSignin, loginUser } from '../../axios/userApi'

const SigninPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { userInfo } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (userInfo) {
      navigate("/user/dashboard");
    }
  }, [userInfo, navigate]);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error("Google authentication failed. No credentials received.");
      return;
    }

    try {
      setIsLoading(true);
      const data = await googleSignin({
        credential: credentialResponse.credential,
      });

      localStorage.setItem("userId", data._id);
      dispatch(setCredentials(data));

      navigate(data.isGoogleLogin ? "/user/dashboard" : "/");
    } catch (err: unknown) {
      console.error("Google Login Error:", err);
      const error = err as IApiError;
      toast.error(error?.data?.message || "Google Sign In failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const data = await loginUser({ email, password });

      dispatch(setCredentials(data));
      localStorage.setItem("userId", data._id);
      toast.success("Successfully logged in!");
      navigate("/user/dashboard");
    } catch (err: unknown) {
      const error = err as IApiError;
      console.error("Login Error:", error);
      toast.error(error?.data?.message || "Incorrect password or email.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome Back">
      {/* Top Left FitSync Branding */}
      <div className="absolute top-6 left-6 z-10">
        <Link to="/" className="text-[#CCFF00] font-black text-2xl uppercase italic tracking-tighter hover:drop-shadow-[0_0_15px_rgba(204,255,0,0.5)] transition-all">
          FitSync
        </Link>
      </div>

      {/* Top Right "Become a Trainer" Button - Adjusted to Lime/Black */}
      <div className="absolute top-6 right-6 z-10">
        <Link to="/trainerSignin">
          <button className="px-4 py-2 bg-[#CCFF00] text-black font-bold rounded-sm shadow-[0_0_15px_rgba(204,255,0,0.2)] hover:bg-white transition-all text-sm uppercase tracking-tight">
            Become a Trainer
          </button>
        </Link>
      </div>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <div className="rounded-xl overflow-hidden border border-gray-800 bg-[#0D1117]">
          <div className="border-b border-gray-800">
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none relative block w-full px-4 py-4 bg-transparent placeholder-gray-600 text-white focus:outline-none focus:ring-1 focus:ring-[#CCFF00] focus:z-10 sm:text-sm"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              className="appearance-none relative block w-full px-4 py-4 bg-transparent placeholder-gray-600 text-white focus:outline-none focus:ring-1 focus:ring-[#CCFF00] focus:z-10 sm:text-sm"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-4 text-[10px] uppercase font-bold text-[#CCFF00] hover:text-white transition-colors"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <div className="text-xs">
            <Link to="/forgotpassword" className="font-bold text-gray-500 hover:text-[#CCFF00] uppercase tracking-widest transition-colors">
              Forgot your password?
            </Link>
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-black rounded-xl text-black bg-[#CCFF00] hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all focus:outline-none uppercase tracking-widest"
            disabled={isLoading}
          >
            {isLoading ? "Authenticating..." : "Sign In"}
          </button>
        </div>
      </form>

      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase font-bold">
            <span className="px-4 bg-black text-gray-600 tracking-widest">Or Secure Login</span>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          {/* Customizing Google Login is limited by the library, but we maintain the dark theme surroundings */}
          <div className="p-1 bg-white rounded-md">
            <GoogleLogin
              theme="outline"
              shape="rectangular"
              onSuccess={(credentialResponse) => {
                if (credentialResponse.credential) {
                  handleGoogleSuccess(credentialResponse);
                } else {
                  toast.error("Google Sign In was unsuccessful");
                }
              }}
              onError={() => {
                toast.error("Google Sign In was unsuccessful");
              }}
            />
          </div>
        </div>
      </div>

      <div className="mt-10 text-center">
        <Link to="/signup" className="text-xs font-bold text-gray-400 hover:text-[#CCFF00] uppercase tracking-widest transition-all">
          Don't have an account? <span className="text-white underline decoration-[#CCFF00] decoration-2 underline-offset-4">Sign up</span>
        </Link>
      </div>
    </AuthLayout>
  );
};

export default SigninPage;