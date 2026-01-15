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
import {googleSignin,loginUser} from '../../axios/userApi'

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
      const data  = await googleSignin({
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
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-white rounded-t-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
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
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-white rounded-b-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
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
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <Link to="/forgotpassword" className="font-medium text-yellow-400 hover:text-yellow-500">
              Forgot your password?
            </Link>
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            disabled={isLoading}
          >
            {isLoading ? "Signing In..." : "Sign In"}
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
                toast.error("Google Sign In was unsuccessful");
              }
            }}
            onError={() => {
              toast.error("Google Sign In was unsuccessful");
            }}
          />
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link to="/signup" className="text-sm text-yellow-400 hover:text-yellow-500">
          Don't have an account? Sign up
        </Link>
      </div>
    </AuthLayout>
  );
};

export default SigninPage;
