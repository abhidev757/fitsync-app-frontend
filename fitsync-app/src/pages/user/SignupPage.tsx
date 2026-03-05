"use client";

import { FormEvent, useEffect, useState } from "react";
import AuthLayout from "./AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { googleSignin, registerUser } from "../../axios/userApi";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { setCredentials } from "../../slices/authSlice";

const SignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [strength, setStrength] = useState<"Weak" | "Medium" | "Strong" | "">("");

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (errors.length > 0) {
      const timer = setTimeout(() => setErrors([]), 4000);
      return () => clearTimeout(timer);
    }
  }, [errors]);

  const evaluatePasswordStrength = (pwd: string) => {
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    const isLongEnough = pwd.length >= 8;
    const isVeryLong = pwd.length >= 10;
  
    if (hasUpper && hasLower && hasNumber && isVeryLong) return "Strong";
    if (hasUpper && hasLower && hasNumber && isLongEnough) return "Medium";
    return "Weak";
  };

  useEffect(() => {
    if (password) {
      setStrength(evaluatePasswordStrength(password));
    } else {
      setStrength("");
    }
  }, [password]);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error("Google authentication failed. No credentials received.");
      return;
    }

    try {
      const data = await googleSignin({ credential: credentialResponse.credential });
      localStorage.setItem("userId", data._id);
      dispatch(setCredentials(data));
      navigate(data.isGoogleLogin ? "/user/dashboard" : "/");
    } catch (err: unknown) {
      console.error("Google Sign Up Error:", err);
      toast.error("Google Sign Up failed. Please try again.");
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors([]);

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match.");
    }

    if (strength === "Weak") {
      return toast.error("Password is too weak.");
    }

    try {
      const data = await registerUser({ name, email, password });

      if (!data.email) throw new Error("Email not found in the API response.");

      localStorage.setItem("userId", data._id);
      localStorage.setItem("emailId", data.email);

      toast.success("Registration successful! Please verify your email.");
      setTimeout(() => navigate("/otpVerification"), 1000);
    } catch (error) {
      const err = error as AxiosError<{ message?: string; errors?: string[] }>;

      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors(["An unexpected error occurred. Please try again later."]);
      }

      toast.error("User already exist");
    }
  };

  return (
    <AuthLayout title="Create An Account">
      {/* Become a Trainer Button - Synced with Elite Hybrid style */}
      <div className="absolute top-6 right-6">
        <Link to="/trainerSignup">
          <button className="px-4 py-2 bg-[#CCFF00] text-black font-black rounded-sm shadow-[0_0_15px_rgba(204,255,0,0.2)] hover:bg-white transition-all text-xs uppercase tracking-tight">
            Become a Trainer
          </button>
        </Link>
      </div>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-3">
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full px-4 py-3 bg-[#0D1117] border border-gray-800 placeholder-gray-600 text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-[#CCFF00] transition-all sm:text-sm"
            placeholder="Your full name"
            value={name}
            onChange={(e) => setName(e.target.value.trim())}
          />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full px-4 py-3 bg-[#0D1117] border border-gray-800 placeholder-gray-600 text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-[#CCFF00] transition-all sm:text-sm"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              className="w-full px-4 py-3 bg-[#0D1117] border border-gray-800 placeholder-gray-600 text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-[#CCFF00] transition-all sm:text-sm"
              placeholder="Create Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-3.5 text-[10px] font-black uppercase text-[#CCFF00] hover:text-white transition-colors"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {/* Password Strength Indicator - Color coded for brand sync */}
          {strength && (
            <div className="px-1 flex items-center justify-between">
              <div className="flex space-x-1">
                <div className={`h-1 w-8 rounded-full ${password ? (strength === 'Weak' ? 'bg-red-500' : strength === 'Medium' ? 'bg-[#CCFF00]/50' : 'bg-[#CCFF00]') : 'bg-gray-800'}`}></div>
                <div className={`h-1 w-8 rounded-full ${strength === 'Medium' || strength === 'Strong' ? (strength === 'Medium' ? 'bg-[#CCFF00]/50' : 'bg-[#CCFF00]') : 'bg-gray-800'}`}></div>
                <div className={`h-1 w-8 rounded-full ${strength === 'Strong' ? 'bg-[#CCFF00]' : 'bg-gray-800'}`}></div>
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${strength === "Strong" ? "text-[#CCFF00]" : strength === "Medium" ? "text-[#CCFF00]/60" : "text-red-500"}`}>
                {strength}
              </span>
            </div>
          )}

          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              required
              className="w-full px-4 py-3 bg-[#0D1117] border border-gray-800 placeholder-gray-600 text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-[#CCFF00] transition-all sm:text-sm"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((prev) => !prev)}
              className="absolute right-4 top-3.5 text-[10px] font-black uppercase text-[#CCFF00] hover:text-white transition-colors"
            >
              {showConfirm ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-4 px-4 bg-[#CCFF00] text-black font-black uppercase tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all active:scale-[0.98] focus:outline-none"
          >
            Start Your Journey
          </button>
        </div>
      </form>

      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800"></div>
          </div>
          <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
            <span className="px-4 bg-black text-gray-600 italic">One-tap Evolution</span>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
           <div className="p-1 bg-white rounded-md">
            <GoogleLogin
              theme="outline"
              shape="rectangular"
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google Sign Up was unsuccessful")}
            />
          </div>
        </div>
      </div>

      <div className="mt-10 text-center">
        <Link to="/signin">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest hover:text-[#CCFF00] transition-all cursor-pointer">
            Already a member? <span className="text-white underline decoration-[#CCFF00] decoration-2 underline-offset-4">Sign in</span>
          </span>
        </Link>
      </div>
    </AuthLayout>
  );
};

export default SignupPage;