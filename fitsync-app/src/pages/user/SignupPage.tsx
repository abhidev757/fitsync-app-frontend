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
      <div className="absolute top-4 right-4">
        <Link to="/trainerSignup">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700">
            Become a Trainer
          </button>
        </Link>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-white bg-transparent rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value.trim())}
          />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-white bg-transparent rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
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
              className="w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-white bg-transparent rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2 top-2 text-xs text-yellow-300 hover:text-yellow-500"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
            {strength && (
              <p className={`text-sm mt-1 ${strength === "Strong" ? "text-green-400" : strength === "Medium" ? "text-yellow-400" : "text-red-400"}`}>
                Password Strength: {strength}
              </p>
            )}
          </div>

          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              required
              className="w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-white bg-transparent rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((prev) => !prev)}
              className="absolute right-2 top-2 text-xs text-yellow-300 hover:text-yellow-500"
            >
              {showConfirm ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-yellow-400 text-black font-semibold rounded-md hover:bg-yellow-500 focus:outline-none"
          >
            Sign Up
          </button>
        </div>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-500"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-800 text-gray-300">Or</span>
          </div>
        </div>

        <div className="mt-6">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => toast.error("Google Sign Up was unsuccessful")}
          />
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link to="/signin">
          <span className="text-sm text-yellow-400 hover:text-yellow-500">
            Already have an account? Sign in
          </span>
        </Link>
      </div>
    </AuthLayout>
  );
};

export default SignupPage;
