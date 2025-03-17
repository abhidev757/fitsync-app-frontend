"use client";

import type React from "react";
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

const SignupPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (errors.length > 0) {
      const timer = setTimeout(() => setErrors([]), 4000);
      return () => clearTimeout(timer);
    }
  }, [errors]);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error("Google authentication failed. No credentials received.");
      return;
    }

    try {
      const data = await googleSignin({
        credential: credentialResponse.credential,
      });

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

    try {
      const data = await registerUser({
        name,
        email,
        password,
      });
      console.log("API Response:", data); 

      if (!data.email) {
          throw new Error("Email not found in the API response.");
      }

      localStorage.setItem("userId", data._id);
      localStorage.setItem("emailId", data.email);
      console.log("Email stored in localStorage:", data.email);

      toast.success("Registration successful! Please verify your email.");
      setTimeout(() => {
        navigate("/otpVerification");
    }, 1000);
    } catch (error) {
      const err = error as AxiosError<{ message?: string; errors?: string[] }>;

      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors(["An unexpected error occurred. Please try again later."]);
      }

      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <AuthLayout title="Create An Account">
      {/* Top Right "Become a Trainer" Button */}
      <div className="absolute top-4 right-4">
        <Link to="/trainerSignup">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700">
            Become a Trainer
          </button>
        </Link>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="rounded-md shadow-sm -space-y-px">
          <div>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value.trim())}
            />
          </div>
          <div>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            Sign Up
          </button>
        </div>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-800 text-gray-300">Or</span>
          </div>
        </div>

        <div className="mt-6">
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              if (credentialResponse.credential) {
                handleGoogleSuccess(credentialResponse);
              } else {
                toast.error("Google Sign Up was unsuccessful");
              }
            }}
            onError={() => {
              toast.error("Google Sign Up was unsuccessful");
            }}
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
